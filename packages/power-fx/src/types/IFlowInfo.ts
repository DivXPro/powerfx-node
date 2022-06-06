import { IExternalFlow } from '../entities/external/IExternalFlow'
import { MetaFlowInfo } from '../meta/external/MetaFlowInfo'

export interface IFlowInfo {
  identity: string
  name: string
  flow: IExternalFlow
  clone(): IFlowInfo
  toDebugString(): string
  equals(other: any): boolean
}

export function IsIFlowInfo(data: any): data is IFlowInfo {
  return data instanceof MetaFlowInfo
}
