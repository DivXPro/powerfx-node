import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { OperationCapabilityMetadata } from '../../functions/delegation'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export abstract class StringTwoArgFunction extends BuiltinFunction {
  public get useParentScopeForArgumentSuggestions() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(
    name: string,
    description: StringGetter,
    returnType: DType = DType.Boolean
  ) {
    super(
      undefined,
      name,
      undefined,
      description,
      FunctionCategories.Text,
      returnType,
      0,
      2,
      2,
      DType.String,
      DType.String
    )
  }

  protected isRowScopedServerDelegatableHelper(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ): boolean {
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

    let args = callNode.args.children
    // Contracts.Assert(args.Length == MinArity);

    if (binding.isRowScope(args[1])) {
      binding.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        args[1],
        TexlStrings.SuggestRemoteExecutionHint_StringMatchSecondParam,
        this.name
      )
      return false
    }

    for (const arg of args) {
      const argKind = arg.kind
      switch (argKind) {
        case NodeKind.FirstName:
          let firstNameStrategy = this.getFirstNameNodeDelegationStrategy()
          if (
            !firstNameStrategy.isValidFirstNameNode(
              arg.asFirstName(),
              binding,
              null
            )
          ) {
            return false
          }

          break
        case NodeKind.Call:
          if (
            !metadata.isDelegationSupportedByTable(
              this.functionDelegationCapability
            )
          ) {
            return false
          }

          let cNodeStrategy = this.getCallNodeDelegationStrategy()
          if (!cNodeStrategy.isValidCallNode(arg.asCall(), binding, metadata)) {
            return false
          }

          break
        case NodeKind.StrLit:
          break
        case NodeKind.DottedName: {
          let dottedStrategy = this.getDottedNameNodeDelegationStrategy()
          return dottedStrategy.isValidDottedNameNode(
            arg.asDottedName(),
            binding,
            metadata,
            null
          )
        }

        default:
          return false
      }
    }

    return true
  }

  public hasSuggestionsForParam(index: number): boolean {
    return index == 0
  }
}
