//  internal partial class Intellisense {
/// <summary>
/// Suggests operators that can be used on a value of type record or table.  E.g. In, As

import { NodeKind } from '../../../syntax/NodeKind'
import { TexlNode } from '../../../syntax/nodes'
import { DType } from '../../../types'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

/// </summary>
export class RecordNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.Record)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos

    var tokenSpan = curNode.token.Span

    // Only suggest after record nodes
    if (cursorPos <= tokenSpan.lim) return true

    if (IntellisenseHelper.CanSuggestAfterValue(cursorPos, intellisenseData.Script)) {
      // Verify that cursor is after a space after the current node's token.
      // Suggest binary keywords.
      IntellisenseHelper.AddSuggestionsForAfterValue(intellisenseData, DType.EmptyTable)
    }

    return true
  }
}
// }
