import { Flow } from '../../interpreter/external/Flow'
import { IFlowInfo } from '../../types/IFlowInfo'

export interface IFlowInfoProps {
  identity: string
  name: string
  flow: Flow
}

export class MetaFlowInfo implements IFlowInfo {
  identity: string
  name: string
  flow: Flow

  constructor(props: IFlowInfoProps) {
    this.identity = props.identity
    this.name = props.name
    this.flow = props.flow
  }

  clone(): IFlowInfo {
    return new MetaFlowInfo({
      identity: this.identity,
      name: this.name,
      flow: this.flow,
    })
  }

  equals(other: any): boolean {
    return false
  }

  toDebugString(): string {
    return JSON.stringify(this)
  }
}
