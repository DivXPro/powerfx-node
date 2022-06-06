import { IDelegationMetadata } from '../../functions/delegation/IDelegationMetadata'
import { DType } from '../../types/DType'
import { DataSourceKind } from '../DataSourceKind'
import { IExternalDataEntityMetadataProvider } from '../delegation/IExternalDataEntityMetadataProvider'
import { IExternalEntity } from './IExternalEntity'
import { IExternalTableMetadata } from './IExternalTableMetadata'
import { DataSource } from '../../interpreter/external/DataSource'
import { TabularDataSource } from '../../interpreter/external/TabularDataSource'
import { DName } from '../../utils'

export interface IExternalFlow {
  name: string
  displayName: string
  inboundSchema: DType
  outboundSchema: DType
}
