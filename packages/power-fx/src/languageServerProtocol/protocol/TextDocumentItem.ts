import { TextDocumentUri } from './TextDocumentUri'

export class TextDocumentItem {
  constructor() {
    // this.Uri = new TextDocumentUri(),
    this.languageId = ''
    this.text = ''
  }

  /// <summary>
  /// The text document's URI.
  /// </summary>
  public uri: TextDocumentUri

  /// <summary>
  /// The text document's language identifier.
  /// </summary>
  public languageId?: string

  /// <summary>
  /// The version number of this document (it will increase after each
  /// change, including undo/redo).
  /// </summary>
  public version?: number

  /// <summary>
  /// The content of the opened text document.
  /// </summary>
  public text?: string
}
