import { CompletionContext } from './CompletionContext'
import { TextDocumentPositionParams } from './TextDocumentPositionParams'

export class CompletionParams extends TextDocumentPositionParams {
  constructor() {
    super()
    this.context = new CompletionContext()
  }

  /// <summary>
  /// The completion context. This is only available if the client specifies
  /// to send this using the client capability
  /// `completion.contextSupport === true`
  /// </summary>
  public context: CompletionContext
}
