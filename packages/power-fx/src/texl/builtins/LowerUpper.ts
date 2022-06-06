import { TexlBinding } from '../../binding'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode } from '../../syntax'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StringOneArgFunction, StringOneArgTableFunction } from './StringOneArgFunction'

export class LowerUpperFunction extends StringOneArgFunction {
  private readonly _isLower: boolean

  constructor(isLower: boolean) {
    super(
      isLower ? 'Lower' : 'Upper',
      isLower ? TexlStrings.AboutLower : TexlStrings.AboutUpper,
      FunctionCategories.Text,
    )
    this._isLower = isLower
  }

  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(this._isLower ? DelegationCapability.Lower : DelegationCapability.Upper)
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    return false
  }
}

// Lower(arg:*[s])
// Upper(arg:*[s])
export class LowerUpperTFunction extends StringOneArgTableFunction {
  constructor(isLower: boolean) {
    super(
      isLower ? 'Lower' : 'Upper',
      isLower ? TexlStrings.AboutLowerT : TexlStrings.AboutUpperT,
      FunctionCategories.Table,
    )
  }
}
