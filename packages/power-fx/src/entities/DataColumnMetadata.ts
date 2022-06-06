import { DType } from '../types/DType'
import { ColumnMetadata } from './ColumnMetadata'
import { DataTableMetadata } from './DataTableMetadata'
import { IDataColumnMetadata } from './IDataColumnMetadata'

interface IDataColumnMetadataWithColumnMetadata {
  columnMetadata: ColumnMetadata
  tableMetadata: DataTableMetadata
}

interface IDataColumnMetadataNoColumMetadata {
  tableMetadata: DataTableMetadata
  name: string
  type: DType
}

declare type DataColumnMetadataProps = IDataColumnMetadataWithColumnMetadata | IDataColumnMetadataNoColumMetadata

export class DataColumnMetadata implements IDataColumnMetadata {
  private readonly columnMetadata?: ColumnMetadata

  public isSearchable: boolean
  public isExpandEntity: boolean
  public isSearchRequired: boolean
  public name: string
  public parentTableMetadata: DataTableMetadata
  public type: DType

  constructor(props: DataColumnMetadataProps) {
    // Contracts.AssertValue(columnMetadata);
    // Contracts.AssertValue(tableMetadata);

    this.parentTableMetadata = props.tableMetadata
    const isWithColumn = (props as IDataColumnMetadataWithColumnMetadata).columnMetadata != null
    if (isWithColumn) {
      this.columnMetadata = (props as IDataColumnMetadataWithColumnMetadata).columnMetadata
      this.type = this.columnMetadata.type
      this.name = this.columnMetadata.name
    } else {
      this.type = (props as IDataColumnMetadataNoColumMetadata).type
      this.name = (props as IDataColumnMetadataNoColumMetadata).name
    }
    this.isSearchable = this.columnMetadata?.lookupMetadata != null && this.columnMetadata.lookupMetadata.isSearchable
    this.isSearchRequired =
      this.columnMetadata?.lookupMetadata != null && this.columnMetadata.lookupMetadata.isSearchRequired
    this.isExpandEntity = false
  }
}
