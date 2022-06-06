import { IExternalDataSource } from '../../entities/external/IExternalDataSource'
import { DName } from '../../utils'
import { IExternalDataEntityMetadataProvider } from '../../entities/delegation/IExternalDataEntityMetadataProvider'
import { IDelegationMetadata } from '../../functions/delegation'
import { DataSourceKind } from '../../entities/DataSourceKind'
import { DType, TypedName } from '../../types'
import { TableMetadata } from './TableMetadata'
import { NamedFormulaType, RecordType } from '../../public'

export interface IDataSourceProps {
  entityName: DName
  name: string
  kind: DataSourceKind
  scopeId: string
  tableMetadata: TableMetadata
  isDelegatable: boolean
  isPageable: boolean
  isSelectable: boolean
}

export class DataSource implements IExternalDataSource {
  dataEntityMetadataProvider: IExternalDataEntityMetadataProvider
  delegationMetadata: IDelegationMetadata
  entityName: DName
  isComponentScoped: boolean
  isDelegatable: boolean
  isPageable: boolean
  isSelectable: boolean
  kind: DataSourceKind
  name: string
  requiresAsync: boolean
  scopeId: string
  tableMetadata: TableMetadata

  constructor(props: IDataSourceProps) {
    this.entityName = props.entityName
    this.name = props.name
    this.kind = props.kind
    this.scopeId = props.scopeId
    this.tableMetadata = props.tableMetadata
    this.isDelegatable = props.isDelegatable
    this.isPageable = props.isPageable
    this.isSelectable = props.isSelectable
  }

  public get schema(): DType {
    const dataSourceType = new RecordType()
    for (const column of this.tableMetadata.columns) {
      const typedName = new TypedName(column.type, new DName(column.name))
      dataSourceType.add(new NamedFormulaType(typedName, column.displayName))
    }
    return dataSourceType._type
  }

  public equals(other: any) {
    if (other instanceof DataSource) {
      return (
        this.entityName === other.entityName &&
        this.name === other.name &&
        this.kind === other.kind &&
        this.scopeId === other.scopeId &&
        this.schema.equals(other.schema)
      )
    }
    return false
  }
}
