import { SignatureHelpContext } from './SignatureHelpContext'
import { TextDocumentPositionParams } from './TextDocumentPositionParams'

export class SignatureHelpParams extends TextDocumentPositionParams {
  /// <summary>
  /// The signature help context. This is only available if the client
  /// specifies to send this using the client capability
  /// `textDocument.signatureHelp.contextSupport === true`
  /// </summary>
  public context: SignatureHelpContext
}
