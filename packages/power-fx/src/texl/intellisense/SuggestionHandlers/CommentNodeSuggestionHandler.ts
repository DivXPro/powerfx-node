import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { ISuggestionHandler } from './ISuggestionHandler'

//  internal partial class Intellisense {
export class CommentNodeSuggestionHandler implements ISuggestionHandler {
  public Run(intellisenseData: IntellisenseData) {
    // Contracts.AssertValue(intellisenseData);

    let cursorPos = intellisenseData.CursorPos
    let isCursorInsideComment: boolean = intellisenseData.Comments.some(
      (com) => com.Span.min <= cursorPos && com.Span.lim >= cursorPos,
    ) //.some();
    if (isCursorInsideComment) {
      // No intellisense for editing comment
      return true
    }

    return false
  }
}
// }
