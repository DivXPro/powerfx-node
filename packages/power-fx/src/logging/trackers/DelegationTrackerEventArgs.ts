import { TexlBinding } from '../../binding/Binder'
import { TexlFunction } from '../../functions/TexlFunction'
import { TexlNode } from '../../syntax'
import { DelegationStatus } from './DelegationStatus'
import { DelegationTelemetryInfo } from './DelegationTelemetryInfo'

export interface IDelegationTrackerEventArgs {
  status: DelegationStatus
  node: TexlNode
  binding: TexlBinding
  func: TexlFunction
  logInfo: DelegationTelemetryInfo
}

export class DelegationTrackerEventArgs implements IDelegationTrackerEventArgs {
  public status: DelegationStatus
  public node: TexlNode
  public binding: TexlBinding
  public func: TexlFunction
  public logInfo: DelegationTelemetryInfo

  constructor(
    status: DelegationStatus,
    node: TexlNode,
    binding: TexlBinding,
    func: TexlFunction,
    logInfo?: DelegationTelemetryInfo,
  ) {
    // Contracts.AssertValue(node)
    // Contracts.AssertValue(binding)
    // Contracts.AssertValueOrNull(func)
    // Contracts.AssertValueOrNull(logInfo)

    this.status = status
    this.node = node
    this.binding = binding
    this.func = func
    this.logInfo = logInfo
  }
}
