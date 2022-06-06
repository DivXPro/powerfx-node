import { CallInfo } from '../../../binding/bindingInfo'
import { TexlFunction } from '../../../functions/TexlFunction'
import { TexlLexer } from '../../../lexer'
import { Identifier } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { CallNode, ListNode, RecordNode, TexlNode } from '../../../syntax/nodes'
import { DType } from '../../../types'
import { DName, DPath } from '../../../utils'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { SuggestionIconKind } from '../SuggestionIconKind'
import { SuggestionKind } from '../SuggestionKind'
import { ISuggestionHandler } from './ISuggestionHandler'

//  internal partial class Intellisense {
export class FunctionRecordNameSuggestionHandler implements ISuggestionHandler {
  /// <summary>
  /// Adds suggestions as appropriate to the internal Suggestions and SubstringSuggestions lists of intellisenseData.
  /// Returns true if intellisenseData is handled and no more suggestions are to be found and false otherwise.
  /// </summary>
  public Run(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let TryGetRecordNodeWithinACallNodeRes = FunctionRecordNameSuggestionHandler.TryGetRecordNodeWithinACallNode(
      intellisenseData.CurNode,
    )
    let recordNode: RecordNode = TryGetRecordNodeWithinACallNodeRes[1]
    let callNode: CallNode = TryGetRecordNodeWithinACallNodeRes[2]
    if (!TryGetRecordNodeWithinACallNodeRes[0]) return false

    // For the special case of an identifier of a record which is an argument of a function, we can
    // utilize the data provided to suggest relevant column names
    let cursorPos: number = intellisenseData.CursorPos

    let suggestionsAdded: boolean = false
    // Contracts.AssertValue(recordNode);
    // Contracts.AssertValue(callNode);

    let columnName: Identifier = FunctionRecordNameSuggestionHandler.GetRecordIdentifierForCursorPosition(
      cursorPos,
      recordNode,
      intellisenseData.Script,
    )
    if (columnName == null) return false

    if (columnName.token.Span.min <= cursorPos) {
      let tokenSpan = columnName.token.Span
      let replacementLength: number = tokenSpan.min == cursorPos ? 0 : tokenSpan.lim - tokenSpan.min
      intellisenseData.SetMatchArea(tokenSpan.min, cursorPos, replacementLength)
    }

    let info: CallInfo = intellisenseData.Binding.getInfo(callNode)
    let func = info.function
    if (func == null || !intellisenseData.IsFunctionElligibleForRecordSuggestions(func)) return false

    // Adding suggestions for callNode arguments which reference a collection's columns
    if (func.canSuggestInputColumns) {
      let aggregateType: DType = this.GetAggregateType(func, callNode, intellisenseData)
      if (aggregateType.hasErrors || !aggregateType.isAggregate) return false

      if (aggregateType.containsDataEntityType(DPath.Root)) {
        let error: boolean = false
        let dropAllOfTableRelationshipsRes = aggregateType.dropAllOfTableRelationships(error, DPath.Root)
        aggregateType = dropAllOfTableRelationshipsRes[0]
        error = dropAllOfTableRelationshipsRes[1]
        if (error) return false
      }

      for (let tName of aggregateType.getNames(DPath.Root)) {
        let usedName = tName.name
        let maybeDisplayName: string
        let TryGetDisplayNameForColumnRes = DType.TryGetDisplayNameForColumn(aggregateType, usedName.value)
        maybeDisplayName = TryGetDisplayNameForColumnRes[1]
        if (TryGetDisplayNameForColumnRes[0]) usedName = new DName(maybeDisplayName)

        let suggestion: string =
          TexlLexer.EscapeName(usedName.value) +
          (IntellisenseHelper.IsPunctuatorColonNextToCursor(cursorPos, intellisenseData.Script)
            ? ''
            : TexlLexer.PunctuatorColon)
        suggestionsAdded =
          suggestionsAdded ||
          IntellisenseHelper.AddSuggestion(
            intellisenseData,
            suggestion,
            SuggestionKind.Field,
            SuggestionIconKind.Other,
            DType.String,
            false,
          )
      }

      return suggestionsAdded && columnName != null
    }

    return intellisenseData.TryAddFunctionRecordSuggestions(func, callNode, columnName)
  }

  private GetAggregateType(func: TexlFunction, callNode: CallNode, intellisenseData: IntellisenseData): DType {
    // Contracts.AssertValue(func);
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(intellisenseData);
    let TryGetSpecialFunctionTypeRes = intellisenseData.TryGetSpecialFunctionType(func, callNode)
    let type: DType = TryGetSpecialFunctionTypeRes[1]
    if (TryGetSpecialFunctionTypeRes[0]) return type

    return intellisenseData.Binding.getType(callNode.args.children[0])
  }

  private static TryGetParentRecordNode(node: TexlNode): [boolean, RecordNode] {
    // Contracts.AssertValue(node);
    let recordNode: RecordNode

    let parentNode: TexlNode = node
    while (parentNode != null) {
      if (parentNode.kind == NodeKind.Record) {
        recordNode = parentNode.asRecord()
        return [true, recordNode]
      }

      parentNode = parentNode.parent
    }

    recordNode = null
    return [false, recordNode]
  }

  private static TryGetParentListNode(node: RecordNode): [boolean, ListNode] {
    // Contracts.AssertValue(node);
    let listNode: ListNode

    let parentNode: TexlNode = node
    while (parentNode != null) {
      if (parentNode.kind == NodeKind.List) {
        listNode = parentNode.asList()
        return [true, listNode]
      }

      parentNode = parentNode.parent
    }

    listNode = null
    return [false, listNode]
  }

  // 1.
  // <CallNode>
  //    |
  //  <ListNode>
  //    |
  //  <Error RecordNode>[Cursor position]

  // For example, Patch(Accounts, OldRecord, UpdateRecord, {<Cursor position>

  // 2.
  // <CallNode>
  //    |
  //  <ListNode>
  //    |
  //  <RecordNode>
  //    |
  //  <Error Node>[Cursor position]

  // For example, Patch(Accounts, OldRecord, UpdateRecord, {A:"",<cursor position>})

  // 3.
  // <CallNode>
  //    |
  //  <ListNode>
  //    |
  //  <VariadicOpNode>
  //    |
  //  <RecordNode>
  //    |
  //  <Error Identifier Node> [Cursor position]
  // For example, Patch(Accounts, OldRecord, UpdateRecord, { 'Account Name': ""});
  //              Patch(Accounts, OldRecord, UpdateRecord,{<Cursor position>);
  private static TryGetRecordNodeWithinACallNode(node: TexlNode): [boolean, RecordNode, CallNode] {
    // Contracts.AssertValue(node);

    let recordNode: RecordNode
    let callNode: CallNode

    let TryGetParentRecordNodeRes = FunctionRecordNameSuggestionHandler.TryGetParentRecordNode(node)
    recordNode = TryGetParentRecordNodeRes[1]
    let TryGetParentListNodeRes = FunctionRecordNameSuggestionHandler.TryGetParentListNode(recordNode)
    let listNode = TryGetParentListNodeRes[1]

    if (!TryGetParentRecordNodeRes[0] || !TryGetParentListNodeRes[0]) {
      callNode = null
      return [false, recordNode, callNode]
    }

    if (!(listNode.parent instanceof CallNode)) {
      callNode = null
      return [false, recordNode, callNode]
    }
    let cNode = listNode.parent

    callNode = cNode
    return [true, recordNode, callNode]
  }

  private static GetRecordIdentifierForCursorPosition(
    cursorPos: number,
    parent: RecordNode,
    script: string,
  ): Identifier {
    // Contracts.Assert(cursorPos >= 0);
    // Contracts.Assert(cursorPos <= script.Length);
    // Contracts.AssertValue(parent);

    if (cursorPos > script.length) return null

    for (let identifier of parent.ids) {
      // Handle special case for whitespaces in formula.
      if (
        cursorPos < identifier.token.Span.min &&
        script.substr(cursorPos, identifier.token.Span.min - cursorPos) == ''
      )
        return identifier

      if (identifier.token.Span.min <= cursorPos && cursorPos <= identifier.token.Span.lim) return identifier
    }

    return null
  }
}
// }
