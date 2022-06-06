export interface ITrackEventArgs {
  eventName: string
  serializedJson: string
}

export interface IEndScenarioEventArgs {
  scenarioGuid: string
  serializedJson: string
}

export class TrackEventArgs implements ITrackEventArgs {
  eventName: string
  serializedJson: string

  constructor(eventName: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(eventName);
    // Contracts.AssertNonEmpty(serializedJson);

    this.eventName = eventName
    this.serializedJson = serializedJson
  }
}

export class EndScenarioEventArgs implements IEndScenarioEventArgs {
  scenarioGuid: string
  serializedJson: string

  constructor(scenarioGuid: string, serializedJson: string) {
    // Contracts.AssertNonEmpty(scenarioGuid)
    // Contracts.AssertNonEmpty(serializedJson)

    this.scenarioGuid = scenarioGuid
    this.serializedJson = serializedJson
  }
}
