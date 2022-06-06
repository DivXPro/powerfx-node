import { IErrorContainer } from '../app/errorContainers/IErrorContainer'
import { DocumentErrorSeverity } from '../errors'
import { TexlStrings } from '../localization'
import { TexlNode } from '../syntax'
import { NodeKind } from '../syntax/NodeKind'
import { DKind } from '../types/DKind'
import { DType } from '../types/DType'
import { TexlFunction } from './TexlFunction'

export class FunctionScopeInfo {
  protected _function: TexlFunction

  /// <summary>
  /// True if the function uses potentially all the fields in each row to produce
  /// the final result, or false otherwise.
  /// For example, Filter uses all the fields, and produces a value that depends
  /// on all the fields. So does AddColumns, DropColumns, etc.
  /// However, Sum/Min/Max/Average/etc use only the fields specified in predicates.
  /// </summary>
  public usesAllFieldsInScope: boolean
  /// <summary>
  /// True if the function supports async lambdas, or false otherwise.
  /// </summary>
  public supportsAsyncLambdas: boolean

  /// <summary>
  /// If false, the author will be warned when inputting predicates that
  /// do not reference the input table.
  /// </summary>
  public acceptsLiteralPredicates: boolean

  /// <summary>
  /// True indicates that the function performs some sort of iteration over
  /// the scope data source, applying the lambda. This is used to determine what
  /// default behavior to block (such as refusing lambdas that modify the scope).
  /// </summary>
  public iteratesOverScope: boolean

  /// <summary>
  /// Null if this is a row scope, but if it's a constant row scope this will
  /// be the constant scope of the function.
  /// </summary>
  public scopeType: DType

  public appliesToArgument: (arg: number) => boolean

  // True indicates that this function cannot guarantee that it will iterate over the datasource in order.
  // This means it should not allow lambdas that operate on the same data multiple times, as this will
  // cause nondeterministic behavior.
  public get hasNondeterministicOperationOrder() {
    return this.iteratesOverScope && this.supportsAsyncLambdas
  }

  constructor(
    fn: TexlFunction,
    usesAllFieldsInScope = true,
    supportsAsyncLambdas = true,
    acceptsLiteralPredicates = true,
    iteratesOverScope = true,
    scopeType?: DType,
    appliesToArgument?: (arg: number) => boolean,
  ) {
    this.usesAllFieldsInScope = usesAllFieldsInScope
    this.supportsAsyncLambdas = supportsAsyncLambdas
    this.acceptsLiteralPredicates = acceptsLiteralPredicates
    this.iteratesOverScope = iteratesOverScope
    this.scopeType = scopeType
    this._function = fn
    this.appliesToArgument = appliesToArgument ?? ((i) => i > 0)
  }

  // Typecheck an input for this function, and get the cursor type for an invocation with that input.
  // arg0 and arg0Type correspond to the input and its type.
  // The cursor type for aggregate functions is generally the type of a row in the input schema (table),
  // for example Table in an invocation Average(Table, valueFunction).
  // Returns true on success, false if the input or its type are invalid with respect to this function's declaration
  // (and populate the error container accordingly).
  public checkInput(
    inputNode: TexlNode,
    inputSchema: DType,
    errors: IErrorContainer = TexlFunction.DefaultErrorContainer,
  ): [boolean, DType] {
    // Contracts.AssertValue(inputNode);
    // Contracts.Assert(inputSchema.IsValid);
    // Contracts.AssertValue(errors);
    const callNode = inputNode.parent.castList().parent.castCall()
    // Contracts.AssertValue(callNode);

    let typeScope = inputSchema

    let fArgsValid = true

    if (this._function.paramTypes.length == 0) {
      switch (typeScope.kind) {
        case DKind.Record:
          break
        case DKind.Error:
          fArgsValid = false
          errors.ensureError(inputNode, TexlStrings.ErrBadType)
          break
        default:
          fArgsValid = false
          errors.error(callNode, TexlStrings.ErrBadType)
          break
      }
    } else if (this._function.paramTypes[0].isTable) {
      if (!typeScope.isTable) {
        errors.error(callNode, TexlStrings.ErrNeedTable_Func, this._function.name)
        fArgsValid = false
      }

      // This assumes that the lambdas operate on the individual records
      // of the table, not the entire table.
      let fError = false
      const rst = typeScope.toRecordWithError()
      typeScope = rst[0]
      fError = rst[1]
      // typeScope = typeScope.toRecord(ref fError);
      fArgsValid &&= !fError
    } else {
      // Contracts.Assert(_function.ParamTypes[0].IsRecord);
      if (!typeScope.isRecord) {
        errors.error(callNode, TexlStrings.ErrNeedRecord_Func, this._function.name)
        let fError = false
        const rst = typeScope.toRecordWithError()
        typeScope = rst[0]
        fError = rst[1]
        fArgsValid = false
      }
    }

    return [fArgsValid, typeScope]
  }

  public checkLiteralPredicates(args: TexlNode[], errors: IErrorContainer) {
    // Contracts.AssertValue(args)
    // Contracts.AssertValue(errors)

    if (!this.acceptsLiteralPredicates) {
      for (var i = 0; i < args.length; i++) {
        if (this._function.isLambdaParam(i)) {
          if (args[i].kind == NodeKind.BoolLit || args[i].kind == NodeKind.NumLit || args[i].kind == NodeKind.StrLit) {
            errors.ensureErrorWithSeverity(DocumentErrorSeverity.Warning, args[i], TexlStrings.WarnLiteralPredicate)
          }
        }
      }
    }
  }
}
