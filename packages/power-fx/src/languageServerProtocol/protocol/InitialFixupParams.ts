import { TextDocumentItem } from './TextDocumentItem'

export class InitialFixupParams {
  /// <summary>
  /// The document that was opened.
  /// </summary>
  public textDocument: TextDocumentItem
}
