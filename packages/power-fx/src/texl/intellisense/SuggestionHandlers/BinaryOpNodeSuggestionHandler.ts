import { BinaryOp, TexlLexer } from '../../../lexer'
import { TexlParser } from '../../../parser'
import { BinaryOpNode, TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { SuggestionIconKind } from '../SuggestionIconKind'
import { SuggestionKind } from '../SuggestionKind'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export class BinaryOpNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.BinaryOp)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    // Cursor is in the operation token.
    // Suggest binary operators.
    let binaryOpNode: BinaryOpNode = curNode.castBinaryOp()
    let tokenSpan = binaryOpNode.token.Span

    let keyword: string =
      binaryOpNode.op == BinaryOp.Error
        ? tokenSpan.getFragment(intellisenseData.Script)
        : TexlParser.GetTokString(binaryOpNode.token.Kind)
    let replacementLength: number = tokenSpan.min == intellisenseData.CursorPos ? 0 : tokenSpan.lim - tokenSpan.min
    intellisenseData.SetMatchArea(tokenSpan.min, intellisenseData.CursorPos, replacementLength)
    intellisenseData.BoundTo = binaryOpNode.op == BinaryOp.Error ? '' : keyword
    BinaryOpNodeSuggestionHandler.AddSuggestionsForBinaryOperatorKeyWords(intellisenseData)

    return true
  }

  public static AddSuggestionsForBinaryOperatorKeyWords(intellisenseData: IntellisenseData): void {
    // Contracts.AssertValue(intellisenseData);

    // TASK: 76039: Intellisense: Update intellisense to filter suggestions based on the expected type of the text being typed in UI
    IntellisenseHelper.AddSuggestionsForMatches(
      intellisenseData,
      TexlLexer.LocalizedInstance.getBinaryOperatorKeywords(),
      SuggestionKind.BinaryOperator,
      SuggestionIconKind.Other,
      false,
    )
  }
}
// }
