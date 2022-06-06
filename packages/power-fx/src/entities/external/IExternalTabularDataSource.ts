import { IExpandInfo } from '../../types/IExpandInfo'
import { IDisplayMapped } from '../IDisplpyMapped'
import { IExternalDataSource } from './IExternalDataSource'
import { TabularDataQueryOptions } from '../queryOptions/TabularDataQueryOptions'

export interface IExternalTabularDataSource extends IExternalDataSource, IDisplayMapped<string> {
  queryOptions: TabularDataQueryOptions
  getKeyColumns(expandInfo?: IExpandInfo): Array<string>
  canIncludeSelect(selectColumnName: string, expandInfo?: IExpandInfo): boolean
  canIncludeExpand(expandToAdd: IExpandInfo, parentExpandInfo?: IExpandInfo): boolean
}

// TODO:
export function IsIExternalTabularDataSource(data: any): data is IExternalTabularDataSource {
  return false
}
