import { EventHandler } from '../utils/EventHandler'
import { EndScenarioEventArgs, IEndScenarioEventArgs, ITrackEventArgs, TrackEventArgs } from './EventArgs'

export class EventHandlers {
  public trackEvent: EventHandler<ITrackEventArgs>
  public scenarioStartEvent: EventHandler<ITrackEventArgs>
  public scenarioEndEvent: EventHandler<IEndScenarioEventArgs>
  public failScenarioEvent: EventHandler<IEndScenarioEventArgs>

  raiseTrackEvent(eventName: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(eventName);
    // Contracts.AssertNonEmpty(serializedJson);

    this.trackEvent?.invoke(this, new TrackEventArgs(eventName, serializedJson))
  }

  raiseStartScenario(eventName: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(eventName);
    // Contracts.AssertNonEmpty(serializedJson);

    this.scenarioStartEvent?.invoke(this, new TrackEventArgs(eventName, serializedJson))
  }

  raiseEndScenario(scenarioGuid: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(scenarioGuid);
    // Contracts.AssertNonEmpty(serializedJson);

    this.scenarioEndEvent?.invoke(this, new EndScenarioEventArgs(scenarioGuid, serializedJson))
  }

  raiseFailScenario(scenarioGuid: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(scenarioGuid)
    // Contracts.AssertNonEmpty(serializedJson)

    this.failScenarioEvent?.invoke(this, new EndScenarioEventArgs(scenarioGuid, serializedJson))
  }
}
