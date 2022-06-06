import { TexlBinding } from '../../binding'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode } from '../../syntax'
import { StringTwoArgFunction } from './StringTwoArgFunction'

export class EndsWithFunction extends StringTwoArgFunction {
  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(DelegationCapability.EndsWith)
  }

  constructor() {
    super('EndsWith', TexlStrings.AboutEndsWith)
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    return super.isRowScopedServerDelegatableHelper(callNode, binding, metadata)
  }

  public getSignatures() {
    return [[TexlStrings.EndsWithArg1, TexlStrings.EndsWithArg2]]
  }

  // TASK: 856362
  // Add overload for single-column table as the input for both endsWith and startsWith.
}
