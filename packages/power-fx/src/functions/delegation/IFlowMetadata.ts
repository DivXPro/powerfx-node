import { IExternalTableDefinition } from '../../entities/delegation/IExternalTableDefinition'
import { DType } from '../../types/DType'
import { BidirectionalDictionary } from '../../utilityDataStructures/BidirectionalDictionary'
import { IDelegationMetadata } from './IDelegationMetadata'
import { IFieldMeta } from '@toy-box/meta-schema'

export interface IFlowMetadata {
  name: string
  identity: string
  inboundSchema: DType
  outboundSchema: DType
  inboundMeta: IFieldMeta
  outboundMeta: IFieldMeta
  isValid: boolean
}
