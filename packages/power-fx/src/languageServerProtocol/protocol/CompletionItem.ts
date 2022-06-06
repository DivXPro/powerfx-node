import { CompletionItemKind } from './CompletionItemKind'

export class CompletionItem {
  constructor() {
    this.label = ''
    this.kind = CompletionItemKind.Text
    this.detail = ''
    this.documentation = ''
  }

  /// <summary>
  /// The label of this completion item. By default
  /// also the text that is inserted when selecting
  /// this completion.
  /// </summary>
  public label: string

  /// <summary>
  /// The kind of this completion item. Based of the kind
  /// an icon is chosen by the editor. The standardized set
  /// of available values is defined in `CompletionItemKind`.
  /// </summary>
  public kind: CompletionItemKind

  /// <summary>
  /// A human-readable string with additional information
  /// about this item, like type or symbol information.
  /// </summary>
  public detail: string

  /// <summary>
  /// A human-readable string that represents a doc-comment.
  /// </summary>
  public documentation: string
}
