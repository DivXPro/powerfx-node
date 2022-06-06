import { CodeActionContext } from './CodeActionContext'
import { range } from './Range'
import { TextDocumentIdentifier } from './TextDocumentIdentifier'

export class CodeActionParams {
  /// <summary>
  /// ctor
  /// </summary>
  constructor() {
    this.context = new CodeActionContext()
  }

  /// <summary>
  /// Gets or sets text document object.
  /// </summary>
  public textDocument: TextDocumentIdentifier

  /// <summary>
  /// Gets or sets current editor value range object.
  /// </summary>
  public range: range

  /// <summary>
  /// Code action context carries additonal information.
  /// </summary>
  public context: CodeActionContext
}
