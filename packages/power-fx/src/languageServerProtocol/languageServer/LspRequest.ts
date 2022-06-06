import { CodeActionParams } from '../protocol/CodeActionParams'
import { CompletionParams } from '../protocol/CompletionParams'
import { DidChangeTextDocumentParams } from '../protocol/DidChangeTextDocumentParams'
import { DidOpenTextDocumentParams } from '../protocol/DidOpenTextDocumentParams'
import { InitialFixupParams } from '../protocol/InitialFixupParams'
import { SignatureHelpParams } from '../protocol/SignatureHelpParams'

export interface LspRequest {
  id?: string
  method: string
  params:
    | DidOpenTextDocumentParams
    | DidChangeTextDocumentParams
    | CompletionParams
    | SignatureHelpParams
    | InitialFixupParams
    | CodeActionParams
}
