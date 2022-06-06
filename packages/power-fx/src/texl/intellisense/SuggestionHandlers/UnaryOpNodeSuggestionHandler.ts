import { TexlParser } from '../../../parser'
import { NodeKind } from '../../../syntax/NodeKind'
import { TexlNode, UnaryOpNode } from '../../../syntax/nodes'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export class UnaryOpNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.UnaryOp)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos
    // Cursor is in the operation token or before.
    // Suggest all value possibilities.
    let unaryOpNode: UnaryOpNode = curNode.castUnaryOp()
    let tokenSpan = unaryOpNode.token.Span

    if (cursorPos < tokenSpan.min) return false

    // Contracts.Assert(cursorPos >= tokenSpan.Min || cursorPos <= tokenSpan.Lim);

    let keyword: string = TexlParser.GetTokString(unaryOpNode.token.Kind)
    // Contracts.Assert(intellisenseData.MatchingLength <= keyword.Length);

    let replacementLength = tokenSpan.min == cursorPos ? 0 : tokenSpan.lim - tokenSpan.min
    intellisenseData.SetMatchArea(tokenSpan.min, cursorPos, replacementLength)
    intellisenseData.BoundTo = intellisenseData.MatchingLength == 0 ? '' : keyword
    IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, curNode)

    return true
  }
}
// }
