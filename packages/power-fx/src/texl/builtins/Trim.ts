import { TexlBinding } from '../../binding'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode } from '../../syntax'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StringOneArgFunction, StringOneArgTableFunction } from './StringOneArgFunction'

// Trim(arg:s)
export class TrimFunction extends StringOneArgFunction {
  constructor() {
    super('Trim', TexlStrings.AboutTrim, FunctionCategories.Text)
  }
}

// Trim(arg:*[s])
export class TrimTFunction extends StringOneArgTableFunction {
  constructor() {
    super('Trim', TexlStrings.AboutTrim, FunctionCategories.Table)
  }
}

// TrimEnds(arg:s)
export class TrimEndsFunction extends StringOneArgFunction {
  constructor() {
    super('TrimEnds', TexlStrings.AboutTrimEnds, FunctionCategories.Text)
  }

  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(DelegationCapability.Trim)
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    return super.isRowScopedServerDelegatable(callNode, binding, metadata)
  }
}

// Trim(arg:*[s])
export class TrimEndsTFunction extends StringOneArgTableFunction {
  constructor() {
    super('TrimEnds', TexlStrings.AboutTrimEnds, FunctionCategories.Table)
  }
}
