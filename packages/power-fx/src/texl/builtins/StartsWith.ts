// StartsWith(text:s, start:s):b

import { TexlBinding } from '../../binding'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode } from '../../syntax/nodes'
import { StringTwoArgFunction } from './StringTwoArgFunction'

// Checks if the text starts with the start string.
export class StartsWithFunction extends StringTwoArgFunction {
  // public override DelegationCapability FunctionDelegationCapability => DelegationCapability.StartsWith;

  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.StartsWith)
  }

  constructor() {
    super('StartsWith', TexlStrings.AboutStartsWith)
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    return super.isRowScopedServerDelegatableHelper(callNode, binding, metadata)
  }

  public getSignatures() {
    return [[TexlStrings.StartsWithArg1, TexlStrings.StartsWithArg2]]
  }

  // TASK: 856362
  // Add overload for single-column table as the input.
}
