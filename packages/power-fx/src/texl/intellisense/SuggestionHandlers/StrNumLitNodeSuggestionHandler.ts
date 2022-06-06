import { NodeKind } from '../../../syntax/NodeKind'
import { TexlNode } from '../../../syntax/nodes'
import { DType } from '../../../types'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { ISuggestionHandler } from './ISuggestionHandler'

//  internal partial class Intellisense {
export class StrNumLitNodeSuggestionHandler implements ISuggestionHandler {
  constructor() {}

  /// <summary>
  /// Adds suggestions as appropriate to the internal Suggestions and SubstringSuggestions lists of intellisenseData.
  /// Returns true if intellisenseData is handled and no more suggestions are to be found and false otherwise.
  /// </summary>
  public Run(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(intellisenseData.CurNode);

    if (intellisenseData.CurNode.kind != NodeKind.StrLit && intellisenseData.CurNode.kind != NodeKind.NumLit)
      return false

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos
    let tokenSpan = curNode.token.Span
    // Should not suggest anything if the cursor is before the string/number.
    if (cursorPos > tokenSpan.lim && IntellisenseHelper.CanSuggestAfterValue(cursorPos, intellisenseData.Script)) {
      // Cursor is after the current node's token.
      // Suggest binary kewords.
      let operandType: DType = curNode.kind == NodeKind.StrLit ? DType.String : DType.Number
      IntellisenseHelper.AddSuggestionsForAfterValue(intellisenseData, operandType)
    } else if (cursorPos > tokenSpan.min) {
      // Cursor is in the middle of the token, Suggest Globals matching the input string or number.
      let replacementLength: number = tokenSpan.lim - tokenSpan.min
      intellisenseData.SetMatchArea(tokenSpan.min, cursorPos, replacementLength)
      IntellisenseHelper.AddSuggestionsForGlobals(intellisenseData)
    }
    return true
  }
}
// }
