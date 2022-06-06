import { IDelegationMetadata } from '../../functions/delegation/IDelegationMetadata'
import { DType } from '../../types/DType'
import { DataSourceKind } from '../DataSourceKind'
import { IExternalDataEntityMetadataProvider } from '../delegation/IExternalDataEntityMetadataProvider'
import { IExternalEntity } from './IExternalEntity'
import { IExternalTableMetadata } from './IExternalTableMetadata'
import { DataSource } from '../../interpreter/external/DataSource'
import { TabularDataSource } from '../../interpreter/external/TabularDataSource'

export interface IExternalDataSource extends IExternalEntity {
  schema: DType
  name: string
  isSelectable: boolean
  isDelegatable: boolean
  requiresAsync: boolean
  dataEntityMetadataProvider: IExternalDataEntityMetadataProvider
  isPageable: boolean
  kind: DataSourceKind
  tableMetadata: IExternalTableMetadata
  delegationMetadata: IDelegationMetadata
  scopeId: string
  isComponentScoped: boolean
}

export function IsIExternalDataSource(data: any): data is IExternalDataSource {
  return data instanceof DataSource || data instanceof TabularDataSource
}
