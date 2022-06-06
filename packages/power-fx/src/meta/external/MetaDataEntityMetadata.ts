import { IDataEntityMetadata, IDelegationMetadata } from '../../functions/delegation'
import { BidirectionalDictionary } from '../../utilityDataStructures/BidirectionalDictionary'
import { IExternalTableDefinition } from '../../entities/delegation'
import { DType } from '../../types'
import { IObjectMeta } from '@toy-box/meta-schema'
import { makeDType } from '../metaType'

export interface IMetaDataEntityMetadataProps {
  datasetName: string
  entityName: string
  entityDefinition: IExternalTableDefinition
}

export class MetaDataEntityMetadata implements IDataEntityMetadata {
  datasetName: string
  delegationMetadata: IDelegationMetadata
  entityDefinition: IExternalTableDefinition
  entityName: string
  internalRepresentationJson: string
  isConvertingDisplayNameMapping: boolean
  isValid: boolean
  originalDataDescriptionJson: string
  // previousDisplayNameMapping: BidirectionalDictionary<string, string>

  constructor(props: IMetaDataEntityMetadataProps) {
    this.datasetName = props.datasetName
    this.entityName = props.entityName
    this.entityDefinition = props.entityDefinition
  }

  get schema() {
    return makeDType(this.entityDefinition)
  }

  get displayNameMapping() {
    const mapping = new BidirectionalDictionary<string, string>()
    Object.keys(this.entityDefinition.properties).forEach((key) => {
      mapping.add(key, this.entityDefinition.properties[key].name)
    })
    return mapping
  }

  get previousDisplayNameMapping() {
    return this.displayNameMapping
  }

  actualizeTemplate(datasetName: string, entityName?: string): void {}

  loadClientSemantics(isPrimaryTable?: boolean): void {}

  setClientSemantics(tableDefinitaion: IExternalTableDefinition): void {
    this.entityDefinition = tableDefinitaion
  }

  toJsonDefinition(): string {
    return JSON.stringify(this.entityDefinition)
  }
}
