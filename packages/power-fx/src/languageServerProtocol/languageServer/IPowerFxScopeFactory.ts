import { IPowerFxScope } from '../../public'
import { TextDocumentUri } from '../protocol/TextDocumentUri'

export interface IPowerFxScopeFactory {
  GetOrCreateInstance(documentUri: TextDocumentUri): IPowerFxScope
}
