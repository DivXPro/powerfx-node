import { ExpandPath, IExpandInfo } from '../../types'
import { MetaDataSource } from './MetaDataSource'

export interface IDataExpandInfoProps {
  identity: string
  expandPath: ExpandPath
  isTable: boolean
  name: string
  parentDataSource: MetaDataSource
  polymorphicParent: string
}

export class MetaDataExpandInfo implements IExpandInfo {
  expandPath: ExpandPath
  identity: string
  isTable: boolean
  name: string
  parentDataSource: MetaDataSource
  polymorphicParent: string

  constructor(props: IDataExpandInfoProps) {
    this.identity = props.identity
    this.expandPath = props.expandPath
    this.isTable = props.isTable
    this.name = props.name
    this.parentDataSource = props.parentDataSource
    this.polymorphicParent = props.polymorphicParent
  }

  clone() {
    return new MetaDataExpandInfo({
      identity: this.identity,
      expandPath: this.expandPath,
      isTable: this.isTable,
      name: this.name,
      parentDataSource: this.parentDataSource,
      polymorphicParent: this.polymorphicParent,
    })
  }

  equals(other: IExpandInfo): boolean {
    return (
      this.identity === other.identity &&
      this.name === other.name &&
      this.isTable === other.isTable &&
      this.polymorphicParent === other.polymorphicParent &&
      this.expandPath.equals(other.expandPath) &&
      this.parentDataSource.equals(other.parentDataSource)
    )
  }

  toDebugString(): string {
    return ''
  }

  updateEntityInfo(dataSource: MetaDataSource, relatedEntityPath: string) {
    const result = dataSource.tableMetadata.tryGetColumn(relatedEntityPath)
    const column = result[1]
    if (result[0]) {
      this.identity = column.name
      this.name = column.displayName
      this.parentDataSource = dataSource
      this.polymorphicParent = dataSource.name
    }
  }
}
