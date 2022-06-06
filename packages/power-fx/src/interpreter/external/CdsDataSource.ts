import { IExternalCdsDataSource } from '../../entities/external/IExternalCdsDataSource'
import { ITabularDataSourceProps, TabularDataSource } from './TabularDataSource'
import { IExternalDocument } from '../../app/IExternalDocument'
import { IExternalTableDefinition } from '../../entities/delegation/IExternalTableDefinition'

export interface ICdsDataSourceProps extends ITabularDataSourceProps {
  datasetName: string
  document: IExternalDocument
  primaryNameField: string
  tableDefinition: IExternalTableDefinition
}

export class CdsDataSource extends TabularDataSource implements IExternalCdsDataSource {
  datasetName: string
  document: IExternalDocument
  primaryNameField: string
  tableDefinition: IExternalTableDefinition

  constructor(props: ICdsDataSourceProps) {
    super(props)
    this.datasetName = props.datasetName
    this.document = props.document
    this.primaryNameField = props.primaryNameField
    this.tableDefinition = props.tableDefinition
  }

  tryGetRelatedColumn(selectColumnName: string, expandsTableDefinition?: IExternalTableDefinition): [boolean, string] {
    if (expandsTableDefinition) {
      return [false, '']
    }
    return [false, '']
  }
}
