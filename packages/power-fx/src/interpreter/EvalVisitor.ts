import { IRContext } from '../ir/IRContext'
import { IRNodeVisitor } from '../ir/IRNodeVisitor'
import { Library } from './functions/Library'
import {
  AggregateCoercionNode,
  BinaryOpKind,
  BinaryOpNode,
  BooleanLiteralNode,
  CallNode,
  ChainingNode,
  ColorLiteralNode,
  ErrorNode,
  LazyEvalNode,
  NumberLiteralNode,
  RecordFieldAccessNode,
  RecordNode,
  ResolvedObjectNode,
  ScopeAccessNode,
  SingleColumnTableAccessNode,
  TableNode,
  TextLiteralNode,
  UnaryOpKind,
  UnaryOpNode,
} from '../ir/node'
import {
  BlankValue,
  BooleanValue,
  DValue,
  ErrorValue,
  FormulaValue,
  FormulaValueStatic,
  InMemoryRecordValue,
  InMemoryTableValue,
  NamedValue,
  NumberValue,
  RecordValue,
  StringValue,
  TableValue,
  UntypedObjectValue,
  ValidFormulaValue,
} from '../public/values'
import { CultureInfo } from '../utils/CultureInfo'
import { CommonErrors } from './functions/CommonErrors'
import { CustomTexlFunction } from './ReflectionFunction'
import { SymbolContext } from './SymbolContext'
import { LambdaFormulaValue } from './values/LambdaFormulaValue'
import {
  ExternalType,
  ExternalTypeKind,
  FormulaType,
  TableType,
} from '../public/types'
import { ScopeAccessSymbol } from '../ir/symbols/ScopeAccessSymbol'
import { ScopeSymbol } from '../ir/symbols/ScopeSymbol'
import { RecordScope } from './IScope'
import { ExpressionError } from '../public/ExpressionError'
import { ErrorKind } from '../public/ErrorKind'
import { RecalcFormulaInfo } from './RecalcFormulaInfo'
import { OptionSet } from './environment/OptionSet'
import { ResolvedObjectHelpers } from './functions/ResolvedObjectHelpers'
import { Control } from './environment/Control'

export class EvalVisitor implements IRNodeVisitor<FormulaValue, SymbolContext> {
  public cultureInfo: CultureInfo

  constructor(cultureInfo: CultureInfo) {
    this.cultureInfo = cultureInfo
  }

  // Helper to eval an arg that might be a lambda.
  public async evalArgAsync<T extends ValidFormulaValue>(
    arg: FormulaValue,
    context: SymbolContext,
    irContext: IRContext
  ): Promise<DValue<T>> {
    if (arg instanceof LambdaFormulaValue) {
      const lambda = arg
      const val = await lambda.evalAsync(this, context)
      if (
        val instanceof ValidFormulaValue ||
        val instanceof BlankValue ||
        val instanceof ErrorValue
      ) {
        return DValue.Of(val)
      }
      return DValue.Of(CommonErrors.RuntimeTypeMismatch(irContext))
    }
    if (
      arg instanceof ValidFormulaValue ||
      arg instanceof BlankValue ||
      arg instanceof ErrorValue
    ) {
      return DValue.Of(arg)
    }
    return DValue.Of(CommonErrors.RuntimeTypeMismatch(irContext))
  }

  public async visit(
    node:
      | TextLiteralNode
      | NumberLiteralNode
      | BooleanLiteralNode
      | TableNode
      | RecordNode
      | LazyEvalNode
      | CallNode
      | BinaryOpNode
      | UnaryOpNode
      | AggregateCoercionNode
      | ScopeAccessNode
      | RecordFieldAccessNode
      | SingleColumnTableAccessNode
      | ErrorNode
      | ColorLiteralNode
      | ChainingNode
      | ResolvedObjectNode,
    context: SymbolContext
  ): Promise<FormulaValue> {
    if (node instanceof TextLiteralNode) {
      return new StringValue(node.IRContext, node.LiteralValue)
    }
    if (node instanceof NumberLiteralNode) {
      return new NumberValue(node.IRContext, node.LiteralValue)
    }
    if (node instanceof BooleanLiteralNode) {
      return new BooleanValue(node.IRContext, node.LiteralValue)
    }
    if (node instanceof TableNode) {
      // single-column table.
      const len = node.Values.length
      // Were pushed left-to-right
      const args: FormulaValue[] = []
      for (let i = 0; i < len; i++) {
        const child = node.Values[i]
        const arg = await child.accept(this, context)
        args[i] = arg
      }
      // Children are on the stack.
      const tableValue = new InMemoryTableValue(
        node.IRContext,
        Library.StandardTableNodeRecords(node.IRContext, args)
      )
      return tableValue
    }
    if (node instanceof RecordNode) {
      const fields: Array<NamedValue> = []
      for (const field of node.Fields) {
        const name = field[0]
        const value = field[1]
        const rhsValue = await value.accept(this, context)
        fields.push(new NamedValue(name.value, rhsValue))
      }
      return new InMemoryRecordValue(node.IRContext, fields)
    }
    if (node instanceof LazyEvalNode) {
      const val = node.Child.accept(this, context)
      return val
    }
    if (node instanceof CallNode) {
      // Sum(  [1,2,3], Value * Value)
      // return base.PreVisit(node);
      const func = node.Function
      const carg = node.Args.length

      const args: FormulaValue[] = []
      for (let i = 0; i < carg; i++) {
        const child = node.Args[i]
        const isLambda = node.isLambdaArg(i)
        if (!isLambda) {
          args[i] = await child.accept(this, context)
        } else {
          args[i] = new LambdaFormulaValue(node.IRContext, child)
        }
      }
      const childContext = context.withScope(node.Scope)
      if (func instanceof CustomTexlFunction) {
        const result = func.invoke(args)
        return result
      } else {
        const ptrResult = Library.FuncsByName.tryGetValue(func)
        const ptr = ptrResult[1]
        if (ptrResult[0]) {
          const result = await ptr({
            visitor: this,
            symbolContext: childContext,
            irContext: node.IRContext,
            values: args,
          })
          // Contract.Assert(result.IRContext.ResultType == node.IRContext.ResultType || result is ErrorValue || result.IRContext.ResultType is BlankType);
          return result
        }
        return CommonErrors.NotYetImplementedError(
          node.IRContext,
          `Missing func: ${func.name}`
        )
      }
    }
    if (node instanceof BinaryOpNode) {
      const arg1 = await node.Left.accept(this, context)
      const arg2 = await node.Right.accept(this, context)
      const values: FormulaValue[] = [arg1, arg2]

      switch (node.Op) {
        case BinaryOpKind.AddNumbers:
          return Library.OperatorBinaryAdd({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.MulNumbers:
          return Library.OperatorBinaryMul({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.DivNumbers:
          return Library.OperatorBinaryDiv({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.EqBlob:

        case BinaryOpKind.EqBoolean:
        case BinaryOpKind.EqColor:
        case BinaryOpKind.EqCurrency:
        case BinaryOpKind.EqDate:
        case BinaryOpKind.EqDateTime:
        case BinaryOpKind.EqGuid:
        case BinaryOpKind.EqHyperlink:
        case BinaryOpKind.EqImage:
        case BinaryOpKind.EqMedia:
        case BinaryOpKind.EqNumbers:
        case BinaryOpKind.EqOptionSetValue:
        case BinaryOpKind.EqText:
        case BinaryOpKind.EqTime:
          return Library.OperatorBinaryEq({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.NeqBlob:
        case BinaryOpKind.NeqBoolean:
        case BinaryOpKind.NeqColor:
        case BinaryOpKind.NeqCurrency:
        case BinaryOpKind.NeqDate:
        case BinaryOpKind.NeqDateTime:
        case BinaryOpKind.NeqGuid:
        case BinaryOpKind.NeqHyperlink:
        case BinaryOpKind.NeqImage:
        case BinaryOpKind.NeqMedia:
        case BinaryOpKind.NeqNumbers:
        case BinaryOpKind.NeqOptionSetValue:
        case BinaryOpKind.NeqText:
        case BinaryOpKind.NeqTime:
          return Library.OperatorBinaryNeq({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })

        case BinaryOpKind.GtNumbers:
          return Library.OperatorBinaryGt({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GeqNumbers:
          return Library.OperatorBinaryGeq({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LtNumbers:
          return Library.OperatorBinaryLt({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LeqNumbers:
          return Library.OperatorBinaryLeq({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })

        case BinaryOpKind.InText:
          return Library.OperatorTextIn({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.ExactInText:
          return Library.OperatorTextInExact({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })

        case BinaryOpKind.InScalarTable:
          return Library.OperatorScalarTableIn({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })

        case BinaryOpKind.ExactInScalarTable:
          return Library.OperatorScalarTableInExact({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })

        case BinaryOpKind.AddDateAndTime:
          return Library.OperatorAddDateAndTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.AddDateAndDay:
          return Library.OperatorAddDateAndDay({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.AddDateTimeAndDay:
          return Library.OperatorAddDateTimeAndDay({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.DateDifference:
          return Library.OperatorDateDifference({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.TimeDifference:
          return Library.OperatorTimeDifference({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LtDateTime:
          return Library.OperatorLtDateTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LeqDateTime:
          return Library.OperatorLeqDateTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GtDateTime:
          return Library.OperatorGtDateTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GeqDateTime:
          return Library.OperatorGeqDateTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LtDate:
          return Library.OperatorLtDate({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LeqDate:
          return Library.OperatorLeqDate({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GtDate:
          return Library.OperatorGtDate({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GeqDate:
          return Library.OperatorGeqDate({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LtTime:
          return Library.OperatorLtTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.LeqTime:
          return Library.OperatorLeqTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GtTime:
          return Library.OperatorGtTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.GeqTime:
          return Library.OperatorGeqTime({
            visitor: this,
            symbolContext: context,
            irContext: node.IRContext,
            values,
          })
        case BinaryOpKind.DynamicGetField:
          if (
            arg1 instanceof UntypedObjectValue &&
            arg2 instanceof StringValue
          ) {
            const cov = arg1
            const sv = arg2
            if (
              cov.impl.type instanceof ExternalType &&
              cov.impl.type.kind === ExternalTypeKind.Object
            ) {
              const rst = cov.impl.tryGetProperty(sv.value)
              const res = rst[1]
              if (rst[0]) {
                if (rst[1].type === FormulaType.Blank) {
                  return new BlankValue(node.IRContext)
                }
                return new UntypedObjectValue(node.IRContext, res)
              } else {
                return new BlankValue(node.IRContext)
              }
            } else if (cov.impl.type === FormulaType.Blank) {
              return new BlankValue(node.IRContext)
            } else {
              return new ErrorValue(
                node.IRContext,
                new ExpressionError(
                  'Accessing a field is not valid on this value',
                  node.IRContext.sourceContext,
                  ErrorKind.BadLanguageCode
                )
              )
            }
          } else {
            return new BlankValue(node.IRContext)
          }
        default:
          return CommonErrors.UnreachableCodeError(node.IRContext)
      }
    }
    if (node instanceof UnaryOpNode) {
      const arg1 = await node.Child.accept(this, context)
      const args: FormulaValue[] = [arg1]
      const result = Library.UnaryOps.tryGetValue(node.Op)
      const unaryOp = result[1]
      if (result[0]) {
        return unaryOp({
          visitor: this,
          symbolContext: context,
          irContext: node.IRContext,
          values: args,
        })
      }
      return CommonErrors.UnreachableCodeError(node.IRContext)
    }
    if (node instanceof AggregateCoercionNode) {
      const arg1 = await node.Child.accept(this, context)
      if (node.Op == UnaryOpKind.TableToTable) {
        const table = arg1 as TableValue
        const tableType = node.IRContext.resultType as TableType
        const resultRows: Array<DValue<RecordValue>> = []
        for (const row of table.rows) {
          if (row.isValue) {
            const fields: Array<NamedValue> = []
            const scopeContext = context.withScope(node.Scope)
            for (const coercion of node.FieldCoercions) {
              const record = row.value
              const newScope = scopeContext.withScopeValues(record)
              const newValue = await coercion[1].accept(this, newScope)
              const name = coercion[0]
              fields.push(new NamedValue(name.value, newValue))
            }
            resultRows.push(
              DValue.Of<RecordValue>(
                new InMemoryRecordValue(
                  IRContext.NotInSource(tableType.toRecord()),
                  fields
                )
              )
            )
          } else if (row.isBlank) {
            resultRows.push(DValue.Of<RecordValue>(row.blank))
          } else {
            resultRows.push(DValue.Of<RecordValue>(row.error))
          }
        }
        return new InMemoryTableValue(node.IRContext, resultRows)
      }
      return CommonErrors.UnreachableCodeError(node.IRContext)
    }
    if (node instanceof ScopeAccessNode) {
      if (node.value instanceof ScopeAccessSymbol) {
        const s1 = node.value
        const scope = s1.Parent
        const val = context.getScopeVar(scope, s1.Name.toString())
        return val
      }
      // Binds to whole scope
      if (node.value instanceof ScopeSymbol) {
        const s2 = node.value
        const r = context.scopeValues.get(s2.id)
        const r2 = r as RecordScope
        return r2._context
      }
      return CommonErrors.UnreachableCodeError(node.IRContext)
    }
    if (node instanceof RecordFieldAccessNode) {
      const left = await node.From.accept(this, context)
      if (left instanceof BlankValue) {
        return new BlankValue(node.IRContext)
      }
      if (left instanceof ErrorValue) {
        return left
      }
      const record = left as RecordValue
      const val = record.getField(node.IRContext, node.Field.value)
      return val
    }
    if (node instanceof SingleColumnTableAccessNode) {
      return CommonErrors.NotYetImplementedError(
        node.IRContext,
        'Single column table access'
      )
    }
    if (node instanceof ErrorNode) {
      return new ErrorValue(
        node.IRContext,
        new ExpressionError(
          node.ErrorHint,
          node.IRContext.sourceContext,
          ErrorKind.AnalysisError
        )
      )
    }
    if (node instanceof ColorLiteralNode) {
      return CommonErrors.NotYetImplementedError(
        node.IRContext,
        'Color literal'
      )
    }
    if (node instanceof ChainingNode) {
      let result: FormulaValue = FormulaValueStatic.New()
      for (const child of node.Nodes) {
        result = await child.accept(this, context)
      }
      // node.Nodes.forEach((child) => {
      //   result = child.accept(this, context)
      // })
      return result
    }
    if (node instanceof ResolvedObjectNode) {
      if (node.Value instanceof RecalcFormulaInfo) {
        return ResolvedObjectHelpers.RecalcFormulaInfo(node.Value)
      }
      if (node.Value instanceof OptionSet) {
        return ResolvedObjectHelpers.OptionSet(node.Value, node.IRContext)
      }
      if (node.Value instanceof Control) {
        console.warn('access control node')
        // return ResolvedObjectHelpers.Control(node.Value, node.IRContext)
      }
      if (node.Value instanceof FormulaValue) {
        return node.Value
      }
      return ResolvedObjectHelpers.ResolvedObjectError(node)
    }
  }
}
