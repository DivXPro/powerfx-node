import { ITabularDataSourceProps } from './MetaTabularDataSource'
import { IExternalCdsDataSource } from '../../entities/external'
import { IExternalDocument } from '../../app'
import { IExternalTableDefinition } from '../../entities/delegation'
import { IObjectMeta } from '@toy-box/meta-schema'
import { DType } from '../../types'
import { makeDType } from '../metaType'
import { MetaTabularDataSource } from './MetaTabularDataSource'

export interface IMetaCdsDataSourceProps extends ITabularDataSourceProps {
  datasetName: string
  document: IExternalDocument
  tableDefinition: IExternalTableDefinition
}

export class MetaCdsDataSource extends MetaTabularDataSource implements IExternalCdsDataSource {
  public readonly datasetName: string
  public readonly document: IExternalDocument
  public readonly tableDefinition: IExternalTableDefinition

  tryGetRelatedColumn(selectColumnName: string, expandsTableDefinition?: IExternalTableDefinition): [boolean, string] {
    return [false, '']
  }

  constructor(props: IMetaCdsDataSourceProps) {
    super(props)
    this.datasetName = props.datasetName
    this.document = props.document
  }

  get primaryNameField() {
    return this.tableDefinition.titleKey
  }

  static MakeTableDefinition(metaSchema: IObjectMeta): IExternalTableDefinition {
    // const attributes: Record<string, DType> = {}
    // Object.keys(metaSchema.properties).forEach((key) => {
    //   attributes[key] = makeDType(metaSchema.properties[key])
    // })
    return metaSchema
  }
}
