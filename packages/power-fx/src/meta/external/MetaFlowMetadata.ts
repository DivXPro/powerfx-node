import { IFlowMetadata } from '../../functions/delegation/IFlowMetadata'
import { IFieldMeta } from '@toy-box/meta-schema'
import { makeDType } from '../metaType'
import { Flow } from '../../interpreter/external/Flow'
import { DName } from '../../utils'

export interface IMetaFlowMetadataProps {
  identity: string
  name: string
  flow: Flow
}
export class MetaFlowMetadata implements IFlowMetadata {
  identity: string
  name: string
  flow: Flow

  constructor(props: IMetaFlowMetadataProps) {
    this.identity = props.identity
    this.name = props.name
    this.flow = props.flow
  }

  get outboundMeta() {
    return this.flow.flowDefinition.outbound
  }

  get inboundMeta() {
    return this.flow.flowDefinition.inbound
  }

  get outboundSchema() {
    return this.flow.outboundSchema
  }

  get inboundSchema() {
    return this.flow.inboundSchema
  }

  get isValid() {
    return this.identity != null && this.name != null
  }
}
