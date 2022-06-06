import { NodeKind } from '../../../syntax/NodeKind'
import { ErrorNodeSuggestionHandlerBase } from './ErrorNodeSuggestionHandlerBase'

//  internal partial class Intellisense {
export class ErrorNodeSuggestionHandler extends ErrorNodeSuggestionHandlerBase {
  constructor() {
    super(NodeKind.Error)
  }
}
// }
