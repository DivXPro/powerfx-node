import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

// Defines group operation metadata.
export class GroupOpMetadata extends OperationCapabilityMetadata {
  private readonly _columnRestrictions: Dictionary<DPath, DelegationCapability>

  constructor(schema: DType, columnRestrictions: Dictionary<DPath, DelegationCapability>) {
    // Contracts.AssertValue(columnRestrictions);
    super(schema)
    this._columnRestrictions = columnRestrictions
  }

  protected get columnRestrictions() {
    return this._columnRestrictions
  }

  public get defaultColumnCapabilities() {
    return new DelegationCapability(DelegationCapability.Group)
  }

  public get tableCapabilities() {
    return this.defaultColumnCapabilities
  }
}
