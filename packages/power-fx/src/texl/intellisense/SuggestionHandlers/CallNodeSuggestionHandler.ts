import TexlLexer from '../../../lexer/TexlLexer'
import { CallNode, TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export class CallNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.Call)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos

    let callNode: CallNode = curNode.castCall()
    let spanMin: number = callNode.head.token.Span.min
    let spanLim: number = callNode.head.token.Span.lim

    // Handling the special case for service functions with non-empty namespaces.
    // We have to consider the namespace as the begining of the callNode for intellisense purposes.
    if (callNode.headNode != null) {
      let dottedNode = callNode.headNode.asDottedName()
      spanMin = dottedNode.left.token.Span.min
      spanLim = dottedNode.right.token.Span.lim
    }

    if (cursorPos < spanMin) {
      // Cursor is before the head
      // i.e. "| Filter(....)"
      // Suggest possibilities that can result in a value.
      IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, callNode)
    } else if (cursorPos <= spanLim) {
      // Cursor is in the head.
      // Suggest function names.
      // Get the matching string as a substring from the script so that the whitespace is preserved.
      let replacementLength: number = IntellisenseHelper.GetReplacementLength(
        intellisenseData,
        spanMin,
        spanLim,
        intellisenseData.Binding.nameResolver.functions.map((f) => f.name),
      )

      // If we are replacing the full token, also include the opening paren (since this will be provided by the suggestion)
      if (replacementLength == spanLim - spanMin)
        replacementLength = replacementLength + TexlLexer.PunctuatorParenOpen.length

      intellisenseData.SetMatchArea(spanMin, cursorPos, replacementLength)
      intellisenseData.BoundTo = intellisenseData.Binding.errorContainer.hasErrors(callNode)
        ? ''
        : callNode.head.name.value
      IntellisenseHelper.AddSuggestionsForFunctions(intellisenseData)
    } else if (callNode.token.Span.lim > cursorPos || callNode.parenClose == null)
      // Handling the erroneous case when user enters a space after functionName and cursor is after space.
      // Cursor is before the open paren of the function.
      // Eg: "Filter | (" AND "Filter | (some Table, some predicate)"
      return false
    else {
      // If there was no closed parenthesis we would have an error node.
      // Contracts.Assert(callNode.ParenClose != null);

      if (cursorPos <= callNode.parenClose.Span.min) {
        // Cursor position is before the closed parenthesis and there are no arguments.
        // If there were arguments FindNode should have returned one of those.
        if (intellisenseData.CurFunc != null && intellisenseData.CurFunc.maxArity > 0)
          IntellisenseHelper.AddSuggestionsForTopLevel(intellisenseData, callNode)
      } else if (IntellisenseHelper.CanSuggestAfterValue(cursorPos, intellisenseData.Script)) {
        // Verify that cursor is after a space after the closed parenthesis and
        // suggest binary operators.
        IntellisenseHelper.AddSuggestionsForAfterValue(intellisenseData, intellisenseData.Binding.getType(callNode))
      }
    }

    return true
  }
}
// }
