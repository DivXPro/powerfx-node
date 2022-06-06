import { IExternalDataSource } from '../entities/external/IExternalDataSource'
import { ExpandPath } from './ExpandPath'
import { DataExpandInfo } from '../interpreter/external/DataExpandInfo'

export interface IExpandInfo {
  identity: string
  isTable: boolean
  name: string
  polymorphicParent: string
  parentDataSource: IExternalDataSource
  expandPath: ExpandPath
  updateEntityInfo(dataSource: IExternalDataSource, relatedEntityPath: string): void
  clone(): IExpandInfo
  toDebugString(): string
  equals(other: any): boolean
}

export function IsIExpandInfo(data: any): data is IExpandInfo {
  return data instanceof DataExpandInfo
}
