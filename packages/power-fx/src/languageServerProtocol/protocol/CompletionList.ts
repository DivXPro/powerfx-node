import { CompletionItem } from './CompletionItem'

export class CompletionList {
  constructor() {
    this.Items = []
  }

  /// <summary>
  /// This list is not complete. Further typing should result in recomputing
  /// this list.
  /// </summary>
  public IsIncomplete: boolean

  /// <summary>
  /// The completion items.
  /// </summary>
  public Items: CompletionItem[]
}
