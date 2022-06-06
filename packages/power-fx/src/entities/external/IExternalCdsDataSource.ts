import { IExternalDocument } from '../../app/IExternalDocument'
import { IExternalTableDefinition } from '../delegation/IExternalTableDefinition'
import { IExternalTabularDataSource, IsIExternalTabularDataSource } from './IExternalTabularDataSource'

export interface IExternalCdsDataSource extends IExternalTabularDataSource {
  primaryNameField: string
  datasetName: string
  document: IExternalDocument
  tableDefinition: IExternalTableDefinition
  tryGetRelatedColumn(selectColumnName: string, expandsTableDefinition?: IExternalTableDefinition): [boolean, string]
}

export function IsIExternalCdsDataSource(obj: any): boolean {
  if (IsIExternalTabularDataSource(obj)) {
    return true
  }
  return false
}
