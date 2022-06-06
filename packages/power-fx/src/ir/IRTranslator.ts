import { BindKind, TexlBinding } from '../binding'
import { BinaryOp, UnaryOp } from '../lexer'
import { FormulaType } from '../public/types/FormulaType'
import { BlankNode, StrInterpNode, TexlNode } from '../syntax'
import { TexlFunctionalVisitor } from '../syntax/visitors'
import { BuiltinFunctionsCore } from '../texl/BuiltinFunctionsCore'
import { DKind } from '../types/DKind'
import { DType } from '../types/DType'
import { Dictionary } from '../utils/Dictionary'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { CoercionKind } from './CoercionKind'
import { CoercionMatrix } from './CoercionMatrix'
import { IRContext } from './IRContext'
import {
  AsNode,
  BinaryOpNode as TexlBinaryOpNode,
  BoolLitNode,
  CallNode as TexlCallNode,
  DottedNameNode,
  ErrorNode as TexlErrorNode,
  FirstNameNode,
  ListNode,
  NumLitNode,
  ParentNode,
  RecordNode as TexlRecordNode,
  ReplaceableNode,
  SelfNode,
  StrLitNode,
  TableNode as TexlTableNode,
  UnaryOpNode as TexlUnaryOpNode,
  VariadicOpNode,
} from '../syntax/nodes'
import {
  BinaryOpKind,
  BinaryOpNode,
  BooleanLiteralNode,
  CallNode,
  ChainingNode,
  ColorLiteralNode,
  ErrorNode,
  IntermediateNode,
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
} from './node'
import { AggregateCoercionNode } from './node/AggregateCoercionNode'
import { ScopeAccessSymbol } from './symbols/ScopeAccessSymbol'
import { ScopeSymbol } from './symbols/ScopeSymbol'
import { LeafNodeType, NonLeafNodeType } from '../syntax/visitors/types'
import { BooleanValue, StringValue, TableValue, NumberValue, RecordValue } from '../public/values'

export class IRTranslator {
  /// <summary>
  /// Returns the top node of the IR tree, and a symbol that corresponds to the Rule Scope.
  /// </summary>
  public static Translate(binding: TexlBinding): { topNode: IntermediateNode; ruleScopeSymbol: ScopeSymbol } {
    // Contracts.AssertValue(binding);
    const ruleScopeSymbol = new ScopeSymbol(0)
    const visitor = new IRTranslatorVisitor()
    const context = new IRTranslatorContext(binding, ruleScopeSymbol)
    return {
      topNode: binding.top.acceptResult(visitor, context),
      ruleScopeSymbol,
    }
  }
}

export class IRTranslatorContext {
  public readonly Binding: TexlBinding
  public Scopes: ScopeSymbol[]

  constructor(bindingOrContext: TexlBinding | IRTranslatorContext, scope: ScopeSymbol) {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(baseScope);
    if (bindingOrContext instanceof TexlBinding) {
      this.Binding = bindingOrContext
      this.Scopes = [scope]
    } else if (bindingOrContext instanceof IRTranslatorContext) {
      this.Binding = bindingOrContext.Binding
      this.Scopes = [...bindingOrContext.Scopes, scope]
    }
  }

  public with(scope: ScopeSymbol): IRTranslatorContext {
    return new IRTranslatorContext(this, scope)
  }

  public getIRContext(node: TexlNode): IRContext {
    return new IRContext(node.getTextSpan(), FormulaType.Build(this.Binding.getType(node)))
  }
}

class IRTranslatorVisitor extends TexlFunctionalVisitor<IntermediateNode, IRTranslatorContext> {
  private _scopeId: number = 1

  public visit(node: LeafNodeType | NonLeafNodeType, context: IRTranslatorContext): IntermediateNode {
    // console.log('IRTranslator', NodeKind[node.kind], node.toString())
    if (node instanceof BlankNode) {
      return this.maybeInjectCoercion(
        node,
        new CallNode(context.getIRContext(node), BuiltinFunctionsCore.Blank, []),
        context,
      )
    }
    if (node instanceof BoolLitNode) {
      return this.maybeInjectCoercion(node, new BooleanLiteralNode(context.getIRContext(node), node.value), context)
    }
    if (node instanceof StrLitNode) {
      return this.maybeInjectCoercion(node, new TextLiteralNode(context.getIRContext(node), node.value), context)
    }
    if (node instanceof NumLitNode) {
      const value = node.value?.value ?? node.numValue
      return this.maybeInjectCoercion(node, new NumberLiteralNode(context.getIRContext(node), value), context)
    }
    if (node instanceof TexlRecordNode) {
      const values = new Dictionary<DName, IntermediateNode>()
      for (let i = 0; i < node.count; i++) {
        const childNode = node.children[i]
        const result = context.Binding.tryGetReplacedIdentName(node.ids[i])
        const newIdent = result[1]
        const identifierName = result[0] ? new DName(newIdent) : node.ids[i].name

        const childIR = childNode.acceptResult(this, context)

        values.set(identifierName, childIR)
      }

      const recordNode = new RecordNode(context.getIRContext(node), values)
      return this.maybeInjectCoercion(node, recordNode, context)
    }
    if (node instanceof TexlTableNode) {
      const children = node.children.map((child) => child.acceptResult(this, context))
      return this.maybeInjectCoercion(node, new TableNode(context.getIRContext(node), children), context)
    }
    if (node instanceof TexlUnaryOpNode) {
      const child = node.child.acceptResult(this, context)

      let result: IntermediateNode
      switch (node.op) {
        case UnaryOp.Not:
          result = new CallNode(context.getIRContext(node), BuiltinFunctionsCore.Not, [child])
          break
        case UnaryOp.Minus:
          result = new UnaryOpNode(context.getIRContext(node), UnaryOpKind.Negate, child)
          break
        case UnaryOp.Percent:
          result = new UnaryOpNode(context.getIRContext(node), UnaryOpKind.Percent, child)
          break
        default:
          throw new Error('NotSupportedException')
      }

      return this.maybeInjectCoercion(node, result, context)
    }
    if (node instanceof TexlBinaryOpNode) {
      const left = node.left.acceptResult(this, context)
      const right = node.right.acceptResult(this, context)

      const leftType = context.Binding.getType(node.left)
      const rightType = context.Binding.getType(node.right)

      let binaryOpResult: IntermediateNode

      switch (node.op) {
        case BinaryOp.In:
        case BinaryOp.Exactin:
          if (!rightType.isAggregate) {
            if (
              (DType.String.accepts(rightType) &&
                (DType.String.accepts(leftType) || leftType.coercesTo(DType.String))) ||
              (rightType.coercesTo(DType.String) && DType.String.accepts(leftType))
            ) {
              binaryOpResult = new BinaryOpNode(
                context.getIRContext(node),
                node.op == BinaryOp.In ? BinaryOpKind.InText : BinaryOpKind.ExactInText,
                left,
                right,
              )
              break
            }

            // anything else in scalar: not supported.
            // Contracts.Assert(
            //   context.Binding.ErrorContainer.HasErrors(node.Left) ||
            //     context.Binding.ErrorContainer.HasErrors(node.Right),
            // )
            return new ErrorNode(context.getIRContext(node), node.toString())
          }

          if (!leftType.isAggregate) {
            if (rightType.isTable) {
              // scalar in table: in_ST(left, right)
              // scalar exactin table: exactin_ST(left, right)
              binaryOpResult = new BinaryOpNode(
                context.getIRContext(node),
                node.op == BinaryOp.In ? BinaryOpKind.InScalarTable : BinaryOpKind.ExactInScalarTable,
                left,
                right,
              )
              break
            }

            // scalar in record: not supported
            // scalar exactin record: not supported
            // Contracts.Assert(
            //   context.Binding.ErrorContainer.HasErrors(node.Left) ||
            //     context.Binding.ErrorContainer.HasErrors(node.Right),
            // )
            return new ErrorNode(context.getIRContext(node), node.toString())
          }

          if (leftType.isRecord) {
            if (rightType.isTable) {
              // record in table: in_RT(left, right)
              // record exactin table: in_RT(left, right)
              // This is done regardless of "exactness".
              binaryOpResult = new BinaryOpNode(context.getIRContext(node), BinaryOpKind.InRecordTable, left, right)
              break
            }

            // record in record: not supported
            // record exactin record: not supported
            // Contracts.Assert(
            //   context.Binding.ErrorContainer.HasErrors(node.Left) ||
            //     context.Binding.ErrorContainer.HasErrors(node.Right),
            // )
            return new ErrorNode(context.getIRContext(node), node.toString())
          }

          // table in anything: not supported
          // table exactin anything: not supported
          // Contracts.Assert(context.Binding.ErrorContainer.HasErrors(node.Left))
          return new ErrorNode(context.getIRContext(node), node.toString())
        case BinaryOp.Power:
          binaryOpResult = new CallNode(context.getIRContext(node), BuiltinFunctionsCore.Power, [left, right])
          break
        case BinaryOp.Concat:
          binaryOpResult = new CallNode(context.getIRContext(node), BuiltinFunctionsCore.Concatenate, [left, right])
          break
        case BinaryOp.Or:
        case BinaryOp.And:
          binaryOpResult = new CallNode(
            context.getIRContext(node),
            node.op == BinaryOp.And ? BuiltinFunctionsCore.And : BuiltinFunctionsCore.Or,
            [left, new LazyEvalNode(context.getIRContext(node), right)],
          )
          break
        case BinaryOp.Add:
          binaryOpResult = IRTranslatorVisitor.GetAddBinaryOp(context, node, left, right, leftType, rightType)
          break
        case BinaryOp.Mul:
          binaryOpResult = new BinaryOpNode(context.getIRContext(node), BinaryOpKind.MulNumbers, left, right)
          break
        case BinaryOp.Div:
          binaryOpResult = new BinaryOpNode(context.getIRContext(node), BinaryOpKind.DivNumbers, left, right)
          break
        case BinaryOp.Equal:
        case BinaryOp.NotEqual:
        case BinaryOp.Less:
        case BinaryOp.LessEqual:
        case BinaryOp.Greater:
        case BinaryOp.GreaterEqual:
          binaryOpResult = IRTranslatorVisitor.GetBooleanBinaryOp(context, node, left, right, leftType, rightType)
          break
        case BinaryOp.Error:
          return new ErrorNode(context.getIRContext(node), node.toString())
        default:
          throw new Error('NotSupportedException')
      }

      return this.maybeInjectCoercion(node, binaryOpResult, context)
    }
    if (node instanceof TexlCallNode) {
      const info = context.Binding.getInfo(node)
      const carg = node.args.count
      const func = info.function
      const resultType = context.Binding.getType(node)
      if (func == null || carg < func.minArity || carg > func.maxArity) {
        throw new Error('NotSupportedException')
      }
      const args: IntermediateNode[] = []
      let scope: ScopeSymbol
      if (func.scopeInfo != null) {
        scope = this.getNewScope()
      }
      for (let i = 0; i < carg; ++i) {
        const arg = node.args.children[i]
        if (func.isLazyEvalParam(i)) {
          const child = arg.acceptResult(this, scope != null ? context.with(scope) : context)
          args.push(new LazyEvalNode(context.getIRContext(node), child))
        } else {
          args.push(arg.acceptResult(this, context))
        }
      }
      if (scope != null) {
        return this.maybeInjectCoercion(node, new CallNode(context.getIRContext(node), func, args, scope), context)
      }
      return this.maybeInjectCoercion(node, new CallNode(context.getIRContext(node), func, args), context)
    }
    if (node instanceof FirstNameNode) {
      const info = context.Binding.getInfo(node)
      if (info == null) {
        // Binding previously failed for this node, we don't know enough to do something useful here
        // Contracts.Assert(context.Binding.ErrorContainer.HasErrors(node));
        return new ErrorNode(context.getIRContext(node), node.toString())
      }
      const identResult = context.Binding.tryGetReplacedIdentName(node.ident)
      const newIdent = identResult[1]
      const nodeName = identResult[0] ? new DName(newIdent) : node.ident.name
      let result: IntermediateNode
      switch (info.kind) {
        case BindKind.LambdaFullRecord: {
          // This is a full reference to the lambda param, e.g. "ThisRecord" in an expression like "Filter(T, ThisRecord.Price < 100)".
          // Contracts.Assert(info.UpCount >= 0)
          // Contracts.Assert(context.Scopes.Length - info.UpCount > 0)
          const scope = context.Scopes[context.Scopes.length - info.upCount - 1]
          result = new ScopeAccessNode(context.getIRContext(node), scope)
          break
        }
        case BindKind.LambdaField: {
          // This is a normal bind, e.g. "Price" in an expression like "Filter(T, Price < 100)".
          // Contracts.Assert(info.UpCount >= 0)
          // Contracts.Assert(context.Scopes.Length - info.UpCount > 0)
          const scope = context.Scopes[context.Scopes.length - info.upCount - 1]
          const fieldAccess = new ScopeAccessSymbol(scope, scope.addOrGetIndexForField(nodeName))
          result = new ScopeAccessNode(context.getIRContext(node), fieldAccess)
          break
        }
        case BindKind.OptionSet:
        case BindKind.PowerFxResolvedObject: {
          result = new ResolvedObjectNode(context.getIRContext(node), info.data)
          break
        }
        case BindKind.ThisItem: {
          // const dataResult = context.Binding.nameResolver.lookup(info.data.entityName, NameLookupPreferences.None)
          const data = info.data
          const path = info.path.name.value
          // 如果ThisItem是数组，且path中包含数组元素路径则返回数组中指定元素
          if (data instanceof TableValue && /^\[[0-9]+\]$/.test(path)) {
            const numStr = path.substring(1, path.length - 1)
            const rowIndex = parseInt(numStr)
            result = new ResolvedObjectNode(context.getIRContext(node), data.rows[rowIndex].value)
          } else {
            result = new ResolvedObjectNode(context.getIRContext(node), data)
          }
          break
        }
        default:
          // Contracts.Assert(false, 'Unsupported BindKind')
          throw new Error('NotImplementedException')
      }
      return this.maybeInjectCoercion(node, result, context)
    }
    if (node instanceof DottedNameNode) {
      const typeLhs = context.Binding.getType(node.left)
      const identResult = context.Binding.tryGetReplacedIdentName(node.right)
      const newIdent = identResult[1]
      const nameRhs = identResult[0] ? new DName(newIdent) : node.right.name
      const resultType = context.Binding.getType(node)
      let result: IntermediateNode
      if (typeLhs.isEnum) {
        const value = context.Binding.getInfo(node).data
        // Contracts.Assert(value != null);
        if (DType.Color.accepts(resultType)) {
          // Contracts.Assert(value is uint);
          result = new ColorLiteralNode(context.getIRContext(node), value)
        } else if (DType.Number.accepts(resultType)) {
          result = new NumberLiteralNode(context.getIRContext(node), value)
        } else if (DType.String.accepts(resultType)) {
          result = new TextLiteralNode(context.getIRContext(node), value)
        } else if (DType.Boolean.accepts(resultType)) {
          result = new BooleanLiteralNode(context.getIRContext(node), value)
        } else {
          throw new Error('NotSupportedException')
        }
        return this.maybeInjectCoercion(node, result, context)
      }
      // Do not visit the left node for an enum bind
      const left = node.left.acceptResult(this, context)
      if (typeLhs.isOptionSet) {
        result = new RecordFieldAccessNode(context.getIRContext(node), left, nameRhs)
      } else if (typeLhs.isView) {
        // Contracts.Assert(false, "Unsupported LHS Type for DottedNames");
        throw new Error('NotSupportedException')
      } else if (typeLhs.isTable) {
        result = new SingleColumnTableAccessNode(context.getIRContext(node), left, nameRhs)
      } else if (node.usesBracket) {
        // Disambiguated scope field access.
        // For example, MyData[@field], should resolve to the value of 'field' in the current row in MyData.
        // In this case, left should be a ValueAccessNode where symbol == scope
        if (left instanceof ScopeAccessNode && left.value instanceof ScopeSymbol) {
          const scope = left.value
          result = new ScopeAccessNode(
            context.getIRContext(node),
            new ScopeAccessSymbol(scope, scope.addOrGetIndexForField(nameRhs)),
          )
        } else {
          // Contracts.Assert(false, "Scope Symbol not found for scope access");
          return new ErrorNode(context.getIRContext(node), node.toString())
        }
      } else if (typeLhs.isRecord) {
        // Field access within a record.
        // Contracts.Assert(typeLhs.IsRecord);
        const typeResult = typeLhs.tryGetType(nameRhs)
        const typeRhs = typeResult[1]
        if (typeResult[0] && typeRhs.isExpandEntity) {
          const entityResult = context.Binding.tryGetEntityInfo(node)
          const expandInfo = entityResult[1]
          if (entityResult[0] && expandInfo.isTable) {
            // Contracts.Assert(false, "Relationships not yet supported");
            result = new RecordFieldAccessNode(context.getIRContext(node), left, nameRhs)
          }
        } else if (typeResult[0] && typeRhs.isFlow) {
          const flowResult = context.Binding.tryGetFlowInfo(node)
          const flowInfo = flowResult[1]
          // TODO: 区分flow类型
          if (flowResult[0] && flowInfo) {
            result = new RecordFieldAccessNode(context.getIRContext(node), left, nameRhs)
          }
        } else {
          if (node.left instanceof FirstNameNode) {
            const firstNameInfo = context.Binding.getInfo(node.left)
            if (firstNameInfo?.kind === BindKind.QualifiedValue) {
              throw new Error('NotSupportedException')
            }
            // 强制获取ThisItem后数据
            if (firstNameInfo?.kind === BindKind.ThisItem) {
              const dotValue = context.Binding.nameResolver.lookupFormulaValuesIn(
                `${firstNameInfo.path.toDottedSyntax()}.${node.right.name.toString()}`,
              )
            }
          }
          if (left instanceof ScopeAccessNode && left.value instanceof ScopeSymbol) {
            const scope = left.value
            result = new ScopeAccessNode(
              context.getIRContext(node),
              new ScopeAccessSymbol(scope, scope.addOrGetIndexForField(nameRhs)),
            )
          } else {
            result = new RecordFieldAccessNode(context.getIRContext(node), left, nameRhs)
          }
        }
      } else if (typeLhs.isControl) {
        if (left instanceof ResolvedObjectNode) {
          result = new RecordFieldAccessNode(context.getIRContext(node), left, nameRhs)
        }
      } else if (typeLhs.isUntypedObject) {
        // Field access within a custom object.
        // Contracts.Assert(typeLhs.IsCustomObject)
        const right = new TextLiteralNode(IRContext.NotInSource(FormulaType.String), nameRhs.toString())
        return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.DynamicGetField, left, right)
      } else {
        // Contracts.Assert(context.Binding.ErrorContainer.HasErrors(node.Left) || context.Binding.ErrorContainer.HasErrors(node));
        return new ErrorNode(context.getIRContext(node), node.toString())
      }
      return this.maybeInjectCoercion(node, result, context)
    }
    if (node instanceof VariadicOpNode) {
      if (node.children.length == 1) {
        return this.maybeInjectCoercion(node, node.children[0].acceptResult(this, context), context)
      }
      const children: IntermediateNode[] = []
      for (const child of node.children) {
        children.push(child.acceptResult(this, context))
      }
      return this.maybeInjectCoercion(node, new ChainingNode(context.getIRContext(node), children), context)
    }
    if (node instanceof AsNode) {
      return this.maybeInjectCoercion(node, node.left.acceptResult(this, context), context)
    }
    if (node instanceof TexlErrorNode) {
      return new ErrorNode(context.getIRContext(node), node.toString())
    }
    if (node instanceof ListNode) {
      // // List nodes are pointless (just a container for Args for Call Nodes?)
      // // We could genuinely clean them up entirely
      throw new Error('NotImplementedException')
    }
    if (node instanceof ParentNode) {
      // These do not apply to PowerFx Scenarios and should be cleaned up.
      // Contracts.Assert(false, 'Parent Keyword not supported in PowerFx')
      throw new Error('NotSupportedException')
    }
    if (node instanceof SelfNode) {
      // These do not apply to PowerFx Scenarios and should be cleaned up.
      // Contracts.Assert(false, 'Parent Keyword not supported in PowerFx')
      throw new Error('NotSupportedException')
    }
    if (node instanceof ReplaceableNode) {
      //  Contracts.Assert(false);
      throw new Error('NotSupportedException')
    }
    if (node instanceof StrInterpNode) {
      // Contracts.AssertValue(node);
      // Contracts.AssertValue(context);

      if (node.children.length == 1) {
        return this.maybeInjectCoercion(node, node.children[0].acceptResult(this, context), context)
      }
      const children: IntermediateNode[] = []
      for (let child of node.children) {
        children.push(child.acceptResult(this, context))
      }
      return this.maybeInjectCoercion(
        node,
        new CallNode(context.getIRContext(node), BuiltinFunctionsCore.Concatenate, children),
        context,
      )
    }
  }

  private getNewScope(): ScopeSymbol {
    return new ScopeSymbol(this._scopeId++)
  }

  private static GetDateTimeToTextLiteralNode(context: IRTranslatorContext, kind: CoercionKind): TextLiteralNode {
    switch (kind) {
      case CoercionKind.DateToText:
        return new TextLiteralNode(IRContext.NotInSource(FormulaType.String), "'shortdate'")
      case CoercionKind.TimeToText:
        return new TextLiteralNode(IRContext.NotInSource(FormulaType.String), "'shorttime'")
      case CoercionKind.DateTimeToText:
        return new TextLiteralNode(IRContext.NotInSource(FormulaType.String), "'shortdatetime'")
      default:
        throw new Error('Invalid DateTimeToText coercion kind')
    }
  }

  private getAggregateCoercionNode(
    unaryOpKind: UnaryOpKind,
    child: IntermediateNode,
    context: IRTranslatorContext,
    fromType: DType,
    toType: DType,
  ): AggregateCoercionNode {
    const fieldCoercions = new Dictionary<DName, IntermediateNode>()
    const scope = this.getNewScope()
    for (const fromField of fromType.getNames(DPath.Root)) {
      const result = toType.tryGetType(fromField.name)
      const toFieldType = result[1]
      if (!result[0]) {
        continue
      }
      if (toFieldType.accepts(fromField.type)) {
        continue
      }
      const coercionKind = CoercionMatrix.GetCoercionKind(fromField.type, toFieldType)
      if (coercionKind == CoercionKind.None) {
        continue
      }
      fieldCoercions.set(
        fromField.name,
        this.injectCoercion(
          new ScopeAccessNode(
            IRContext.NotInSource(FormulaType.Build(fromField.type)),
            new ScopeAccessSymbol(scope, scope.addOrGetIndexForField(fromField.name)),
          ),
          context,
          fromField.type,
          toFieldType,
        ),
      )
    }
    return new AggregateCoercionNode(
      IRContext.NotInSource(FormulaType.Build(toType)),
      unaryOpKind,
      scope,
      child,
      fieldCoercions,
    )
  }

  private maybeInjectCoercion(
    nodeIn: TexlNode,
    child: IntermediateNode,
    context: IRTranslatorContext,
  ): IntermediateNode {
    if (!context.Binding.CanCoerce(nodeIn)) {
      return child
    }

    const fromType = context.Binding.getType(nodeIn)
    const result = context.Binding.tryGetCoercedType(nodeIn)
    const toType = result[1]
    // Contracts.Assert(!fromType.IsError);
    // Contracts.Assert(!toType.IsError);

    return this.injectCoercion(child, context, fromType, toType)
  }

  private injectCoercion(
    child: IntermediateNode,
    context: IRTranslatorContext,
    fromType: DType,
    toType: DType,
  ): IntermediateNode {
    const coercionKind = CoercionMatrix.GetCoercionKind(fromType, toType)
    let unaryOpKind: UnaryOpKind
    switch (coercionKind) {
      case CoercionKind.TextToNumber:
        return new CallNode(IRContext.NotInSource(FormulaType.Build(toType)), BuiltinFunctionsCore.Value, [child])

      case CoercionKind.DateToText:
      case CoercionKind.TimeToText:
      case CoercionKind.DateTimeToText:
        return new CallNode(IRContext.NotInSource(FormulaType.Build(toType)), BuiltinFunctionsCore.Text, [
          child,
          IRTranslatorVisitor.GetDateTimeToTextLiteralNode(context, coercionKind),
        ])

      case CoercionKind.TextToDateTime:
        return new CallNode(
          IRContext.NotInSource(FormulaType.Build(toType)),
          BuiltinFunctionsCore.DateTimeValue,
          [child],
        )
      case CoercionKind.TextToDate:
        return new CallNode(IRContext.NotInSource(FormulaType.Build(toType)), BuiltinFunctionsCore.DateValue, [
          child,
        ])
      case CoercionKind.TextToTime:
        return new CallNode(IRContext.NotInSource(FormulaType.Build(toType)), BuiltinFunctionsCore.TimeValue, [
          child,
        ])

      case CoercionKind.RecordToRecord:
        return this.getAggregateCoercionNode(UnaryOpKind.RecordToRecord, child, context, fromType, toType)
      case CoercionKind.TableToTable:
        return this.getAggregateCoercionNode(UnaryOpKind.TableToTable, child, context, fromType, toType)

      // After this it's just duplicating the coercion kind
      case CoercionKind.BooleanToNumber:
        unaryOpKind = UnaryOpKind.BooleanToNumber
        break
      case CoercionKind.BooleanOptionSetToNumber:
        unaryOpKind = UnaryOpKind.BooleanOptionSetToNumber
        break
      case CoercionKind.DateToNumber:
        unaryOpKind = UnaryOpKind.DateToNumber
        break
      case CoercionKind.TimeToNumber:
        unaryOpKind = UnaryOpKind.TimeToNumber
        break
      case CoercionKind.DateTimeToNumber:
        unaryOpKind = UnaryOpKind.DateTimeToNumber
        break
      case CoercionKind.BlobToHyperlink:
        unaryOpKind = UnaryOpKind.BlobToHyperlink
        break
      case CoercionKind.ImageToHyperlink:
        unaryOpKind = UnaryOpKind.ImageToHyperlink
        break
      case CoercionKind.MediaToHyperlink:
        unaryOpKind = UnaryOpKind.MediaToHyperlink
        break
      case CoercionKind.TextToHyperlink:
        unaryOpKind = UnaryOpKind.TextToHyperlink
        break
      case CoercionKind.SingleColumnRecordToLargeImage:
        unaryOpKind = UnaryOpKind.SingleColumnRecordToLargeImage
        break
      case CoercionKind.ImageToLargeImage:
        unaryOpKind = UnaryOpKind.ImageToLargeImage
        break
      case CoercionKind.LargeImageToImage:
        unaryOpKind = UnaryOpKind.LargeImageToImage
        break
      case CoercionKind.TextToImage:
        unaryOpKind = UnaryOpKind.TextToImage
        break
      case CoercionKind.TextToMedia:
        unaryOpKind = UnaryOpKind.TextToMedia
        break
      case CoercionKind.TextToBlob:
        unaryOpKind = UnaryOpKind.TextToBlob
        break
      case CoercionKind.NumberToText:
        unaryOpKind = UnaryOpKind.NumberToText
        break
      case CoercionKind.BooleanToText:
        unaryOpKind = UnaryOpKind.BooleanToText
        break
      case CoercionKind.OptionSetToText:
        unaryOpKind = UnaryOpKind.OptionSetToText
        break
      case CoercionKind.ViewToText:
        unaryOpKind = UnaryOpKind.ViewToText
        break
      case CoercionKind.NumberToBoolean:
        unaryOpKind = UnaryOpKind.NumberToBoolean
        break
      case CoercionKind.TextToBoolean:
        unaryOpKind = UnaryOpKind.TextToBoolean
        break
      case CoercionKind.BooleanOptionSetToBoolean:
        unaryOpKind = UnaryOpKind.BooleanOptionSetToBoolean
        break
      case CoercionKind.RecordToTable:
        unaryOpKind = UnaryOpKind.RecordToTable
        break
      case CoercionKind.NumberToDateTime:
        unaryOpKind = UnaryOpKind.NumberToDateTime
        break
      case CoercionKind.NumberToDate:
        unaryOpKind = UnaryOpKind.NumberToDate
        break
      case CoercionKind.NumberToTime:
        unaryOpKind = UnaryOpKind.NumberToTime
        break
      case CoercionKind.DateTimeToDate:
        unaryOpKind = UnaryOpKind.DateTimeToDate
        break
      case CoercionKind.DateToDateTime:
        unaryOpKind = UnaryOpKind.DateToDateTime
        break
      case CoercionKind.DateToTime:
        unaryOpKind = UnaryOpKind.DateToTime
        break
      case CoercionKind.TimeToDate:
        unaryOpKind = UnaryOpKind.TimeToDate
        break
      case CoercionKind.TimeToDateTime:
        unaryOpKind = UnaryOpKind.TimeToDateTime
        break
      case CoercionKind.BooleanToOptionSet:
        unaryOpKind = UnaryOpKind.BooleanToOptionSet
        break
      case CoercionKind.AggregateToDataEntity:
        unaryOpKind = UnaryOpKind.AggregateToDataEntity
        break
      case CoercionKind.None:
        // No coercion needed, return the child node
        return child
      default:
        throw new Error('Unexpected Coercion Kind: ' + coercionKind)
    }

    return new UnaryOpNode(IRContext.NotInSource(FormulaType.Build(toType)), unaryOpKind, child)
  }

  private static GetAddBinaryOp(
    context: IRTranslatorContext,
    node: TexlBinaryOpNode,
    left: IntermediateNode,
    right: IntermediateNode,
    leftType: DType,
    rightType: DType,
  ): IntermediateNode {
    // Contracts.AssertValue(node);
    // Contracts.Assert(node.Op == BinaryOp.Add);

    switch (leftType.kind) {
      case DKind.Date:
        if (rightType == DType.DateTime || rightType == DType.Date) {
          // Date + '-DateTime' => in days
          // Date + '-Date' => in days

          // Ensure that this is really '-Date' - Binding should always catch this, but let's make sure...
          // Contracts.Assert(node.Right.AsUnaryOpLit().VerifyValue().Op == UnaryOp.Minus);
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.DateDifference, left, right)
        } else if (rightType == DType.Time) {
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateAndTime, left, right)
        } else {
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateAndDay, left, right)
        }

      case DKind.Time:
        if (rightType == DType.Date) {
          // Time + Date => DateTime
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateAndTime, right, left)
        } else if (rightType == DType.Time) {
          // Time + '-Time' => in ms
          // Ensure that this is really '-Time' - Binding should always catch this, but let's make sure...
          // Contracts.Assert(node.Right.AsUnaryOpLit().VerifyValue().Op == UnaryOp.Minus);
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddNumbers, left, right)
        } else {
          // Time + Number
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddTimeAndMilliseconds, left, right)
        }

      case DKind.DateTime:
        if (rightType == DType.DateTime || rightType == DType.Date) {
          // DateTime + '-DateTime' => in days
          // DateTime + '-Date' => in days

          // Ensure that this is really '-Date' - Binding should always catch this, but let's make sure...
          // Contracts.Assert(node.Right.AsUnaryOpLit().VerifyValue().Op == UnaryOp.Minus);
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.DateDifference, left, right)
        } else {
          return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateTimeAndDay, left, right)
        }

      default:
        switch (rightType.kind) {
          case DKind.Date:
            // Number + Date
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateAndDay, right, left)
          case DKind.Time:
            // Number + Date
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddTimeAndMilliseconds, right, left)
          case DKind.DateTime:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddDateTimeAndDay, right, left)
          default:
            // Number + Number
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.AddNumbers, left, right)
        }
    }
  }

  private static GetBooleanBinaryOp(
    context: IRTranslatorContext,
    node: TexlBinaryOpNode,
    left: IntermediateNode,
    right: IntermediateNode,
    leftType: DType,
    rightType: DType,
  ): IntermediateNode {
    let kindToUse = leftType.accepts(rightType) ? leftType.kind : rightType.kind

    if (!leftType.accepts(rightType) && !rightType.accepts(leftType)) {
      // There is coercion involved, pick the coerced type.
      let result = context.Binding.tryGetCoercedType(node.left)
      const leftCoerced = result[1]
      if (result[0]) {
        kindToUse = leftCoerced.kind
      } else {
        result = context.Binding.tryGetCoercedType(node.left)
        const rightCoerced = result[1]
        if (result[0]) {
          kindToUse = rightCoerced.kind
        } else {
          throw new Error('NotSupportedException')
        }
      }
    }

    switch (kindToUse) {
      case DKind.Number:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqNumbers, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqNumbers, left, right)
          case BinaryOp.Less:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LtNumbers, left, right)
          case BinaryOp.LessEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LeqNumbers, left, right)
          case BinaryOp.Greater:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GtNumbers, left, right)
          case BinaryOp.GreaterEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GeqNumbers, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Date:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqDate, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqDate, left, right)
          case BinaryOp.Less:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LtDate, left, right)
          case BinaryOp.LessEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LeqDate, left, right)
          case BinaryOp.Greater:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GtDate, left, right)
          case BinaryOp.GreaterEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GeqDate, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.DateTime:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqDateTime, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqDateTime, left, right)
          case BinaryOp.Less:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LtDateTime, left, right)
          case BinaryOp.LessEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LeqDateTime, left, right)
          case BinaryOp.Greater:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GtDateTime, left, right)
          case BinaryOp.GreaterEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GeqDateTime, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Time:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqTime, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqTime, left, right)
          case BinaryOp.Less:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LtTime, left, right)
          case BinaryOp.LessEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.LeqTime, left, right)
          case BinaryOp.Greater:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GtTime, left, right)
          case BinaryOp.GreaterEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.GeqTime, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Boolean:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqBoolean, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqBoolean, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.String:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqText, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqText, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Hyperlink:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqHyperlink, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqHyperlink, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Currency:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqCurrency, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqCurrency, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Image:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqImage, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqImage, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Color:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqColor, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqColor, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Media:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqMedia, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqMedia, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Blob:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqBlob, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqBlob, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.Guid:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqGuid, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqGuid, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.ObjNull:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqNull, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqNull, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      case DKind.OptionSetValue:
        switch (node.op) {
          case BinaryOp.NotEqual:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.NeqOptionSetValue, left, right)
          case BinaryOp.Equal:
            return new BinaryOpNode(context.getIRContext(node), BinaryOpKind.EqOptionSetValue, left, right)
          default:
            throw new Error('NotSupportedException')
        }

      default:
        throw new Error('Not supported comparison op on type ' + kindToUse.toString())
    }
  }
}
