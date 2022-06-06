import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { ArgValidators } from '../../functions/functionArgValidators'
import { SignatureConstraint } from '../../functions/SignatureConstraint'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode, FirstNameNode, TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

/// <summary>
/// SwitchFunction evaluates first argument (clled the expression) against a list of values,
/// and returns the result corresponding to the first matching value. If there is no match,
/// an optional default value(which is last argument if number of arguments are even) is returned.
/// Syntax:
/// Switch(Value to switch,Value to match 1...[2-N], Value to return for match1...[2-N], [Value to return if there's no match]).
/// </summary>
export class SwitchFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  // Note, switch has a very custom checkinvocation implementation
  // We do not support coercion for the 1st param, or the match params, only the result params.
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Switch',
      undefined,
      TexlStrings.AboutSwitch,
      FunctionCategories.Logical,
      DType.Unknown,
      0,
      3,
      Number.MAX_SAFE_INTEGER,
    )
    // If(cond1, value1, cond2, value2, ..., condN, valueN, [valueFalse], ...)
    // Switch(switch_value, match_value1, match_result1, match_value2, match_result2, ..., match_valueN, match_resultN, [default_result], ...)
    this.signatureConstraint = new SignatureConstraint(5, 2, 0, 9)
  }

  // Return all signatures for switch function.
  public getSignatures(): Array<StringGetter[]> {
    return [
      [TexlStrings.SwitchExpression, TexlStrings.SwitchCaseExpr, TexlStrings.SwitchCaseArg],
      [
        TexlStrings.SwitchExpression,
        TexlStrings.SwitchCaseExpr,
        TexlStrings.SwitchCaseArg,
        TexlStrings.SwitchDefaultReturn,
      ],
    ]
  }

  public isLazyEvalParam(index: number) {
    return index > 0
  }

  // Return all signatures for switch function with at most 'arity' parameters.
  public getSignaturesAtArity(arity: number): Array<StringGetter[]> {
    if (arity < 5) {
      return super.getSignaturesAtArity(arity)
    }

    // Limit the argCount avoiding potential OOM
    const argCount =
      arity > this.signatureConstraint.repeatTopLength
        ? this.signatureConstraint.repeatTopLength + ((arity & 1) ^ 1)
        : arity
    const signature: StringGetter[] = []
    const fEven = (argCount & 1) == 0
    const cargCur = fEven ? argCount - 1 : argCount
    signature[0] = TexlStrings.SwitchExpression
    for (let iarg = 1; iarg < cargCur; iarg += 2) {
      signature[iarg] = TexlStrings.SwitchCaseExpr
      signature[iarg + 1] = TexlStrings.SwitchCaseArg
    }

    if (fEven) {
      signature[cargCur] = TexlStrings.SwitchDefaultReturn
    }

    return [signature]
  }

  // Type check an invocation of the function with the specified args (and their corresponding types).
  // Return true if everything aligns, false otherwise.
  // This override does not post any document errors (i.e. it performs the typechecks quietly).
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    const count = args.length
    // Check the switch expression type matches all case expression types in list.
    let fArgsValid = true
    for (let i = 1; i < count - 1; i += 2) {
      if (!argTypes[0].accepts(argTypes[i]) && !argTypes[i].accepts(argTypes[0])) {
        // Type mismatch; using CheckType to fill the errors collection
        let validExpectedType = this.checkType(args[i], argTypes[i], argTypes[0], errors, false)[0]
        if (validExpectedType) {
          // Check on the opposite direction
          validExpectedType = this.checkType(args[0], argTypes[0], argTypes[i], errors, false)[0]
        }

        fArgsValid &&= validExpectedType
      }
    }

    let type = this.returnType
    let nodeToCoercedTypeMap = undefined
    let returnType: DType

    // Are we on a behavior property?
    const isBehavior = binding.isBehavior

    // Compute the result type by joining the types of all non-predicate args.
    // Contracts.Assert(type == DType.Unknown);
    for (let i = 2; i < count; ) {
      const nodeArg = args[i]
      const typeArg = argTypes[i]
      if (typeArg.isError) {
        errors.ensureError(args[i], TexlStrings.ErrTypeError)
      }

      var typeSuper = DType.Supertype(type, typeArg)

      if (!typeSuper.isError) {
        type = typeSuper
      } else if (type.kind == DKind.Unknown) {
        type = typeSuper
        fArgsValid = false
      } else if (!type.isError) {
        if (typeArg.coercesTo(type)) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, nodeArg, type)
        } else if (!isBehavior) {
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            nodeArg,
            TexlStrings.ErrBadType_ExpectedType_ProvidedType,
            type.getKindString(),
            typeArg.getKindString(),
          )
          fArgsValid = false
        }
      } else if (typeArg.kind != DKind.Unknown) {
        type = typeArg
        fArgsValid = false
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }
    // Update the return type based on the specified invocation args.
    returnType = type

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  private tryGetDSNodes(binding: TexlBinding, args: TexlNode[]): [boolean, Array<FirstNameNode>] {
    let dsNodes: Array<FirstNameNode> = []

    const count = args.length
    for (let i = 2; i < count; ) {
      const nodeArg = args[i]
      const result = ArgValidators.DataSourceArgNodeValidator.tryGetValidValue(nodeArg, binding)
      const tmpDsNodes = result[1]
      if (result[0]) {
        for (const node of tmpDsNodes) {
          dsNodes.push(node)
        }
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }

    return [dsNodes.length > 0, dsNodes]
  }

  public tryGetDataSourceNodes(callNode: CallNode, binding: TexlBinding): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let dsNodes: Array<FirstNameNode> = []
    if (callNode.args.count < 2) {
      return [false, dsNodes]
    }

    const args = callNode.args.children
    return this.tryGetDSNodes(binding, args)
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding): boolean {
    const result = this.tryGetDataSourceNodes(callNode, binding)
    const dsNodes = result[1]
    if (!result[0]) {
      return false
    }

    const args = callNode.args.children
    const count = args.length

    for (let i = 2; i < count; ) {
      if (!binding.isPageable(args[i])) {
        return false
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }

    return true
  }
}
