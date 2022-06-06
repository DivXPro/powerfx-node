import { IExternalFlow } from '../../entities/external/IExternalFlow'
import { IExternalFlowDefinition } from '../../entities/delegation/IExernalFlowDefinition'
import { makeDType } from '../../meta'

export interface IFlowProps {
  displayName: string
  name: string
  flowDefinition: IExternalFlowDefinition
}

export class Flow implements IExternalFlow {
  name: string
  displayName: string
  flowDefinition: IExternalFlowDefinition

  constructor(props: IFlowProps) {
    this.name = props.name
    this.displayName = props.displayName
    this.flowDefinition = props.flowDefinition
  }

  get inboundSchema() {
    return makeDType(this.flowDefinition.inbound)
  }

  get outboundSchema() {
    return makeDType(this.flowDefinition.inbound)
  }
}
