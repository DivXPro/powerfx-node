import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

// Defines sort operation metadata.
export class SortOpMetadata extends OperationCapabilityMetadata {
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
    return new DelegationCapability(DelegationCapability.Sort)
  }

  public get tableCapabilities() {
    return this.defaultColumnCapabilities
  }

  // Returns true if column is marked as AscendingOnly.
  public isColumnAscendingOnly(columnPath: DPath): boolean {
    // Contracts.AssertValid(columnPath);
    const result = this.tryGetColumnRestrictions(columnPath)
    const columnRestrictions = result[1]
    if (!result[0]) {
      return false
    }

    return columnRestrictions.hasCapability(DelegationCapability.SortAscendingOnly)
  }
}
