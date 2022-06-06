import { TexlBinding } from '../../binding/Binder'
import { TexlFunction } from '../../functions/TexlFunction'
import { TexlNode } from '../../syntax'
import { EventHandler } from '../../utils/EventHandler'
import { DelegationStatus } from './DelegationStatus'
import { DelegationTelemetryInfo } from './DelegationTelemetryInfo'
import { DelegationTrackerEventArgs, IDelegationTrackerEventArgs } from './DelegationTrackerEventArgs'
import { AddSuggestionMessageEventArgs, IAddSuggestionMessageEventArgs } from './SuggestionTrackerEventArgs'

export class TrackingProvider {
  public static readonly Instance = new TrackingProvider()
  addSuggestionEvent: EventHandler<IAddSuggestionMessageEventArgs>
  delegationTrackerEvent: EventHandler<IDelegationTrackerEventArgs>

  addSuggestionMessage(message: string, node: TexlNode, binding: TexlBinding) {
    this.addSuggestionEvent?.invoke(this, new AddSuggestionMessageEventArgs(message, node, binding))
  }

  setDelegationTrackerStatus(
    status: DelegationStatus,
    node: TexlNode,
    binding: TexlBinding,
    func: TexlFunction,
    logInfo?: DelegationTelemetryInfo,
  ) {
    this.delegationTrackerEvent?.invoke(this, new DelegationTrackerEventArgs(status, node, binding, func, logInfo))
  }
}
