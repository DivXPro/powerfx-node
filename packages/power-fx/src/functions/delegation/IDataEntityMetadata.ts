import { IExternalTableDefinition } from '../../entities/delegation/IExternalTableDefinition'
import { DType } from '../../types/DType'
import { BidirectionalDictionary } from '../../utilityDataStructures/BidirectionalDictionary'
import { IDelegationMetadata } from './IDelegationMetadata'

export interface IDataEntityMetadata {
  entityName: string
  schema: DType
  loadClientSemantics(isPrimaryTable?: boolean): void
  setClientSemantics(tableDefinitaion: IExternalTableDefinition): void

  displayNameMapping: BidirectionalDictionary<string, string>
  previousDisplayNameMapping: BidirectionalDictionary<string, string>
  isConvertingDisplayNameMapping: boolean
  delegationMetadata: IDelegationMetadata
  entityDefinition: IExternalTableDefinition
  datasetName: string
  isValid: boolean
  originalDataDescriptionJson: string
  internalRepresentationJson: string

  actualizeTemplate(datasetName: string, entityName?: string): void
  toJsonDefinition(): string
}
