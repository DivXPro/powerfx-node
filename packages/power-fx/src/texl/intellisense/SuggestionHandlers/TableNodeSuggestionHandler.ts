import { TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DType } from '../../../types'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

//  internal partial class Intellisense {
export class TableNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.Table)
  }

  public TryAddSuggestionsForNodeKind(
    intellisenseData: IntellisenseData
  ): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos

    let tokenSpan = curNode.token.Span

    // Only suggest after table nodes
    if (cursorPos <= tokenSpan.lim) return true

    if (
      IntellisenseHelper.CanSuggestAfterValue(
        cursorPos,
        intellisenseData.Script
      )
    ) {
      // Verify that cursor is after a space after the current node's token.
      // Suggest binary keywords.
      IntellisenseHelper.AddSuggestionsForAfterValue(
        intellisenseData,
        DType.EmptyTable
      )
    }

    return true
  }
}
// }
