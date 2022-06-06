// Variadic logical operator functions:
//  And(cond:b, cond:b, ...) : b
//  Or(cond:b, cond:b, ...) : b

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Equivalent Excel functions: And, Or.
export class VariadicLogicalFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get isStrict() {
    return false
  }

  readonly _isAnd: boolean

  constructor(isAnd: boolean) {
    super(
      undefined,
      isAnd ? 'And' : 'Or',
      undefined,
      isAnd ? TexlStrings.AboutAnd : TexlStrings.AboutOr,
      FunctionCategories.Logical,
      DType.Boolean,
      0,
      0,
      Number.MAX_SAFE_INTEGER,
      DType.Boolean,
    )
    this._isAnd = isAnd
  }

  public isLazyEvalParam(index: number) {
    return index > 0
  }

  public getSignatures() {
    return [
      [TexlStrings.LogicalFuncParam],
      [TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam],
      [TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam],
    ]
    // Enumerate just the base overloads (the first 3 possibilities).
    // yield return new[] { TexlStrings.LogicalFuncParam };
    // yield return new[] { TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam };
    // yield return new[] { TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam, TexlStrings.LogicalFuncParam };
  }

  // And / Or functions are implicit here if filter capability is supported. Hence we just declare capability filter here.
  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.Filter)
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return this.getGenericSignatures(arity, TexlStrings.LogicalFuncParam)
    }

    return super.getSignaturesAtArity(arity)
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let nodeToCoercedTypeMap = new Dictionary<TexlNode, DType>()
    const count = args.length

    // Check the args.
    let fArgsValid = true
    for (let i = 0; i < count; i++) {
      const rst = this.checkType(args[i], argTypes[i], DType.Boolean, errors)
      const matchedWithCoercion = rst[1]
      fArgsValid &&= rst[0]
      if (matchedWithCoercion) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, args[i], DType.Boolean)
      }
    }

    const returnType = this.returnType

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    if (
      binding.errorContainer.hasErrors(callNode) ||
      !this.checkArgsCount(callNode, binding) ||
      !binding.isRowScope(callNode)
    ) {
      return false
    }

    const args = callNode.args.children
    // Contracts.Assert(args.Length >= MinArity);

    const funcDelegationCapability = new DelegationCapability(
      this.functionDelegationCapability.capabilities |
        (this._isAnd ? DelegationCapability.And : DelegationCapability.Or),
    )
    if (!metadata.isDelegationSupportedByTable(funcDelegationCapability)) {
      return false
    }

    for (const arg of args) {
      var argKind = arg.kind
      switch (argKind) {
        case NodeKind.FirstName: {
          const firstNameStrategy = this.getFirstNameNodeDelegationStrategy()
          if (!firstNameStrategy.isValidFirstNameNode(arg.asFirstName(), binding, null)) {
            return false
          }

          break
        }

        case NodeKind.Call: {
          const cNodeStrategy = this.getCallNodeDelegationStrategy()
          if (!cNodeStrategy.isValidCallNode(arg.asCall(), binding, metadata)) {
            this.suggestDelegationHint(arg, binding)
            return false
          }

          break
        }

        case NodeKind.DottedName: {
          const dottedStrategy = this.getDottedNameNodeDelegationStrategy()
          if (!dottedStrategy.isValidDottedNameNode(arg.asDottedName(), binding, metadata, null)) {
            this.suggestDelegationHint(arg, binding)
            return false
          }

          break
        }

        case NodeKind.BinaryOp: {
          const opNode = arg.asBinaryOp()
          const binaryOpNodeValidationStrategy = this.getOpDelegationStrategy(opNode.op, opNode)
          if (!binaryOpNodeValidationStrategy.isSupportedOpNode(opNode, metadata, binding)) {
            this.suggestDelegationHint(arg, binding)
            return false
          }

          break
        }

        case NodeKind.UnaryOp: {
          const opNode = arg.asUnaryOpLit()
          const unaryOpNodeValidationStrategy = this.getOpDelegationStrategyOfUnaryOp(opNode.op)
          if (!unaryOpNodeValidationStrategy.isSupportedOpNode(opNode, metadata, binding)) {
            this.suggestDelegationHint(arg, binding)
            return false
          }

          break
        }

        case NodeKind.BoolLit:
          break
        default:
          return false
      }
    }

    return true
  }
}
