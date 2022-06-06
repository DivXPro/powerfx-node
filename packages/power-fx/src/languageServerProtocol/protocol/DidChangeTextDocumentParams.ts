import { TextDocumentContentChangeEvent } from './TextDocumentContentChangeEvent'
import { VersionedTextDocumentIdentifier } from './VersionedTextDocumentIdentifier'

export class DidChangeTextDocumentParams {
  /// <summary>
  /// The document that did change.The version number points
  /// to the version after all provided content changes have
  /// been applied.
  /// </summary>
  public textDocument: VersionedTextDocumentIdentifier = new VersionedTextDocumentIdentifier()

  /// <summary>
  /// The actual content changes.
  /// </summary>
  public contentChanges: TextDocumentContentChangeEvent[] = []
}
