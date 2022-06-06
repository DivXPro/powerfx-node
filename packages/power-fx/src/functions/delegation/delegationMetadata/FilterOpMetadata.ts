import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

export class FilterOpMetadata extends OperationCapabilityMetadata {
  private readonly _columnCapabilities: Dictionary<DPath, DelegationCapability>
  private readonly _columnRestrictions: Dictionary<DPath, DelegationCapability>
  private readonly _filterFunctionsSupportedByTable?: DelegationCapability

  // Filter functions supported at the table level.
  // If no capability at column level specified then this would be the default filter functionality supported by column.
  private readonly _defaultCapabilities: DelegationCapability

  constructor(
    tableSchema: DType,
    columnRestrictions: Dictionary<DPath, DelegationCapability>,
    columnCapabilities: Dictionary<DPath, DelegationCapability>,
    filterFunctionsSupportedByAllColumns: DelegationCapability,
    filterFunctionsSupportedByTable?: DelegationCapability,
  ) {
    // Contracts.AssertValue(columnRestrictions);
    // Contracts.AssertValue(columnCapabilities);
    super(tableSchema)
    this._columnCapabilities = columnCapabilities
    this._columnRestrictions = columnRestrictions
    this._filterFunctionsSupportedByTable = filterFunctionsSupportedByTable
    this._defaultCapabilities = filterFunctionsSupportedByAllColumns
    if (this._filterFunctionsSupportedByTable != null) {
      this._defaultCapabilities = DelegationCapability.LogicOr(
        filterFunctionsSupportedByAllColumns,
        new DelegationCapability(DelegationCapability.Filter),
      )
    }
  }

  protected get columnRestrictions() {
    return this._columnRestrictions
  }

  public get defaultColumnCapabilities() {
    return this._defaultCapabilities
  }

  public get tableCapabilities() {
    if (this._filterFunctionsSupportedByTable != null) {
      return this._filterFunctionsSupportedByTable
    } else {
      // If there are no capabilities defined at column level then filter is not supported.
      // Otherwise this simply means that filter operators at table level are not supported.
      // For example, Filter(CDS, Lower(Col1) != Lower(Col2)), here != operator at table level needs to be supported as it's not operating on any column directly.
      if (this.defaultColumnCapabilities.capabilities == DelegationCapability.None) {
        return new DelegationCapability(DelegationCapability.None)
      } else {
        return new DelegationCapability(DelegationCapability.Filter)
      }
    }
  }

  public tryGetColumnCapabilities(columnPath: DPath): [boolean, DelegationCapability] {
    // Contracts.AssertValid(columnPath);

    // See if there is a specific capability defined for column.
    // If not then just return default one.
    const result = this._columnCapabilities.tryGetValue(columnPath)
    let capabilities = result[1]
    if (!result[0]) {
      return super.tryGetColumnCapabilities(columnPath)
    }

    // If metadata specified any restrictions for this column then apply those
    // before returning capabilities.
    const result2 = this.tryGetColumnRestrictions(columnPath)
    let restrictions = result2[1]
    if (this.tryGetColumnRestrictions(columnPath)) {
      capabilities = DelegationCapability.LogicAnd(capabilities, DelegationCapability.BitwiseComplement(restrictions))
    }

    return [true, capabilities]
  }

  public isDelegationSupportedByTable(delegationCapability: DelegationCapability): boolean {
    if (this._filterFunctionsSupportedByTable != null) {
      return this._filterFunctionsSupportedByTable.hasCapability(delegationCapability.capabilities)
    } else {
      return super.isDelegationSupportedByTable(
        delegationCapability,
      ) /* This is needed for compatibility with older metadata */
    }
  }

  public isColumnSearchable(columnPath: DPath): boolean {
    // Contracts.AssertValid(columnPath);

    return (
      this.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(DelegationCapability.Filter | DelegationCapability.Contains),
      ) ||
      this.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(
          DelegationCapability.Filter | DelegationCapability.IndexOf | DelegationCapability.GreaterThan,
        ),
      ) ||
      this.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(
          DelegationCapability.Filter | DelegationCapability.SubStringOf | DelegationCapability.Equal,
        ),
      )
    )
  }
}
