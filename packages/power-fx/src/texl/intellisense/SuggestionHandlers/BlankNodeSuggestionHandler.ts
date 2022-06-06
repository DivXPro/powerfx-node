import { NodeKind } from '../../../syntax/NodeKind'
import { ErrorNodeSuggestionHandlerBase } from './ErrorNodeSuggestionHandlerBase'

// internal partial class Intellisense {
export class BlankNodeSuggestionHandler extends ErrorNodeSuggestionHandlerBase {
  constructor() {
    super(NodeKind.Blank)
  }
}
// }
