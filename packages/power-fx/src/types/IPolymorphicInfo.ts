import { IExternalDataSource } from '../entities/external/IExternalDataSource'
import { IExpandInfo } from './IExpandInfo'

export interface IPolymorphicInfo {
  targetTables: string[]
  targetFields: string[]
  isTable: boolean
  name: string
  parentDataSource: IExternalDataSource
  expands: IExpandInfo[]
  tryGetExpandInfo(targetTable: string): IExpandInfo
  clone(): IPolymorphicInfo
  toDebugString(): string
}
