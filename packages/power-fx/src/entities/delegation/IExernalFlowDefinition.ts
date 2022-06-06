import { IFieldMeta } from '@toy-box/meta-schema'

export interface IExternalFlowDefinition {
  name: string
  displayName: string
  inbound: IFieldMeta
  outbound: IFieldMeta
}
