import { CompletionTriggerKind } from './CompletionTriggerKind'

export class CompletionContext {
  constructor() {
    this.triggerKind = CompletionTriggerKind.Invoked
    this.triggerCharacter = ''
  }

  /// <summary>
  /// How the completion was triggered.
  /// </summary>
  public triggerKind: CompletionTriggerKind

  /// <summary>
  /// The trigger character (a single character) that has trigger code
  /// complete. Is undefined if
  /// `triggerKind !== CompletionTriggerKind.TriggerCharacter`
  /// </summary>
  public triggerCharacter?: string
}
