import { DType } from '../types/DType'
import { TypedName } from '../types/TypedName'
import { DName } from '../utils/DName'

export class AllowedValuesMetadata {
  private static readonly ValueColumnName = new DName('Value')

  private _valuesSchema: DType

  public static CreateForValue(valueType: DType): AllowedValuesMetadata {
    // Contracts.Assert(valueType.IsValid);
    return new AllowedValuesMetadata(DType.CreateTable(new TypedName(valueType, AllowedValuesMetadata.ValueColumnName)))
  }

  constructor(valuesSchema: DType) {
    // Contracts.Assert(valuesSchema.IsTable);
    // Contracts.Assert(valuesSchema.Contains(ValueColumnName));

    this._valuesSchema = valuesSchema
  }

  /// <summary>
  /// The schema of the table returned from the document function DataSourceInfo(DS, DataSourceInfo.AllowedValues, "columnName").
  /// </summary>
  public get valuesScheam() {
    return this._valuesSchema
  }
}
