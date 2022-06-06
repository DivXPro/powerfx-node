import { TexlLexer } from '../../../lexer'
import { NodeKind } from '../../../syntax/NodeKind'
import { BoolLitNode, TexlNode } from '../../../syntax/nodes'
import { DType } from '../../../types'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export class BoolLitNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.BoolLit)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos
    let boolNode: BoolLitNode = curNode.castBoolLit()
    let tokenSpan = curNode.token.Span

    if (cursorPos < tokenSpan.min) {
      // Cursor is before the token start.
      IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, curNode)
    } else if (cursorPos <= tokenSpan.lim) {
      // Cursor is in the middle of the token.
      let replacementLength = tokenSpan.min == cursorPos ? 0 : tokenSpan.lim - tokenSpan.min
      intellisenseData.SetMatchArea(tokenSpan.min, cursorPos, replacementLength)
      intellisenseData.BoundTo = boolNode.value ? TexlLexer.KeywordTrue : TexlLexer.KeywordFalse
      IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, curNode)
    } else if (IntellisenseHelper.CanSuggestAfterValue(cursorPos, intellisenseData.Script)) {
      // Verify that cursor is after a space after the current node's token.
      // Suggest binary keywords.
      IntellisenseHelper.AddSuggestionsForAfterValue(intellisenseData, DType.Boolean)
    }

    return true
  }
}
// }
