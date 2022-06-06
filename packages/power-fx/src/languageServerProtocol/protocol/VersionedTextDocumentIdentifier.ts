import { TextDocumentIdentifier } from './TextDocumentIdentifier'

export class VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  /// <summary>
  /// The version number of this document.
  ///
  /// The version number of a document will increase after each change,
  /// including undo/redo. The number doesn't need to be consecutive.
  /// </summary>
  public version?: number
}
