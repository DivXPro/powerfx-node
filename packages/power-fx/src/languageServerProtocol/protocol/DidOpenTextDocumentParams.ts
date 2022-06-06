import { TextDocumentItem } from './TextDocumentItem'

export class DidOpenTextDocumentParams {
  constructor() {
    this.textDocument = new TextDocumentItem()
  }

  /// <summary>
  /// The document that was opened.
  /// </summary>
  public textDocument: TextDocumentItem
}
