import { DType } from '../types/DType'
import { DataTableMetadata } from './DataTableMetadata'

export interface IDataColumnMetadata {
  name: string
  type: DType
  isSearchable: boolean
  isSearchRequired: boolean
  isExpandEntity: boolean
  parentTableMetadata: DataTableMetadata
}
