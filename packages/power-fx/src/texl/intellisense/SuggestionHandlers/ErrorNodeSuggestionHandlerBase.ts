import { TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export abstract class ErrorNodeSuggestionHandlerBase extends NodeKindSuggestionHandler {
  constructor(kind: NodeKind) {
    super(kind)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    // For Error Kind, suggest top level values only in the context of a callNode and
    // ThisItemProperties only in the context of thisItem.
    let curNode: TexlNode = intellisenseData.CurNode

    // Three methods that implement custom behavior here, one that adds suggestions before
    // top level suggestions are added, one after, and one to handle the case where there aren't
    // any top level suggestions to add.
    if (intellisenseData.AddSuggestionsBeforeTopLevelErrorNodeSuggestions()) return true

    if (!IntellisenseHelper.AddSuggestionsForTopLevel(intellisenseData, curNode)) {
      intellisenseData.AddAlternativeTopLevelSuggestionsForErrorNode()
    }

    intellisenseData.AddSuggestionsAfterTopLevelErrorNodeSuggestions()
    return true
  }
}
// }
