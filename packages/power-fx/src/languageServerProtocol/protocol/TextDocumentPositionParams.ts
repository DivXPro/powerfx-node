import { Position } from './Position'
import { TextDocumentIdentifier } from './TextDocumentIdentifier'

export class TextDocumentPositionParams {
  constructor() {
    this.textDocument = new TextDocumentIdentifier()
    this.position = new Position()
  }

  /// <summary>
  /// The text document.
  /// </summary>
  public textDocument: TextDocumentIdentifier

  /// <summary>
  /// The position inside the text document.
  /// </summary>
  public position: Position
}
