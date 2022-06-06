import { TexlLexer, TokKind } from '../../../lexer'
import { IdentToken } from '../../../lexer/tokens'
import { FirstNameNode, Identifier, TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DType } from '../../../types'
import { CharacterUtils, DPath } from '../../../utils'
import KeyValuePair from '../../../utils/typescriptNet/KeyValuePair'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { SuggestionIconKind } from '../SuggestionIconKind'
import { SuggestionKind } from '../SuggestionKind'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// internal partial class Intellisense {
export class FirstNameNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.FirstName)
  }

  public TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos

    let firstNameNode: FirstNameNode = curNode.castFirstName()
    let ident: Identifier = firstNameNode.ident
    let min: number = ident.token.Span.min
    let tok: IdentToken = ident.token

    if (cursorPos < min) {
      // Cursor is before the beginning of the identifier or of the global token if present.
      // Suggest possibilities that can result in a value.
      IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, curNode)
      intellisenseData.AddAdditionalSuggestionsForKeywordSymbols(curNode)
    } else if (cursorPos <= tok.Span.lim) {
      // Cursor is part of the identifier or global token if present.
      // Get the matching string as a substring from the script so that the whitespace is preserved.
      let possibleFirstNames: string[] =
        // intellisenseData.Binding.GetFirstNames().Select(firstNameInfo => firstNameInfo.Name.Value)
        // .Union(intellisenseData.Binding.GetGlobalNames().Select(firstNameInfo => firstNameInfo.Name.Value))
        // .Union(intellisenseData.Binding.GetAliasNames().Select(firstNameInfo => firstNameInfo.Name.Value))
        // .Union(intellisenseData.SuggestableFirstNames);
        // [
        //   ...intellisenseData.Binding.getFirstNames().map((firstNameInfo) => firstNameInfo.name.value),
        //   ...intellisenseData.Binding.getGlobalNames().map((firstNameInfo) => firstNameInfo.name.value),
        //   ...intellisenseData.Binding.getAliasNames().map((firstNameInfo) => firstNameInfo.name.value),
        //   ...intellisenseData.SuggestableFirstNames()
        // ]
        intellisenseData.Binding.getFirstNames()
          .map((firstNameInfo) => firstNameInfo.name.value)
          .concat(intellisenseData.Binding.getGlobalNames().map((firstNameInfo) => firstNameInfo.name.value))
          .concat(intellisenseData.Binding.getAliasNames().map((firstNameInfo) => firstNameInfo.name.value))
          .concat(intellisenseData.SuggestableFirstNames())

      let replacementLength: number = IntellisenseHelper.GetReplacementLength(
        intellisenseData,
        tok.Span.min,
        tok.Span.lim,
        possibleFirstNames,
      )
      intellisenseData.SetMatchArea(tok.Span.min, cursorPos, replacementLength)
      intellisenseData.BoundTo = intellisenseData.Binding.errorContainer.hasErrors(firstNameNode)
        ? ''
        : ident.name.value

      if (ident.atToken != null || tok.Kind == TokKind.At) {
        // Suggest globals if cursor is after '@'.
        FirstNameNodeSuggestionHandler.AddSuggestionsForScopedGlobals(intellisenseData)
      } else if (tok.hasDelimiters && cursorPos > tok.Span.min) {
        // Suggest top level fields and globals if cursor is after a opening square bracket.
        IntellisenseHelper.AddSuggestionsForRuleScope(intellisenseData)
        IntellisenseHelper.AddSuggestionsForTopLevel(intellisenseData, curNode)
        IntellisenseHelper.AddSuggestionsForGlobals(intellisenseData)
        intellisenseData.AddAdditionalSuggestionsForLocalSymbols()
      } else {
        // Suggest value posssibilities otherwise.
        IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, curNode)
      }
      intellisenseData.AddAdditionalSuggestionsForKeywordSymbols(curNode)
    } else if (FirstNameNodeSuggestionHandler.IsBracketOpen(tok.Span.lim, cursorPos, intellisenseData.Script))
      FirstNameNodeSuggestionHandler.AddSuggestionsForScopeFields(
        intellisenseData,
        intellisenseData.Binding.getType(firstNameNode),
      )
    else if (IntellisenseHelper.CanSuggestAfterValue(cursorPos, intellisenseData.Script)) {
      // Verify that cursor is after a space after the identifier.
      // Suggest binary keywords.
      IntellisenseHelper.AddSuggestionsForAfterValue(intellisenseData, intellisenseData.Binding.getType(firstNameNode))
    }

    return true
  }

  // Suggest the Globals that can appear in the context of '[@____]'
  // Suggesting controls, datasources, appVariables, and enums.
  private static AddSuggestionsForScopedGlobals(intellisenseData: IntellisenseData): void {
    // Contracts.AssertValue(intellisenseData);

    // let suggestions = intellisenseData.AdditionalGlobalSuggestions
    //   .Union(intellisenseData.EnumSymbols.Select(symbol => new KeyValuePair<string, SuggestionIconKind>(symbol.Name, SuggestionIconKind.Other)));

    let suggestions: KeyValuePair<string, SuggestionIconKind>[] = [
      ...intellisenseData.AdditionalGlobalSuggestions,
      ...intellisenseData.EnumSymbols.map(
        (x) => <KeyValuePair<string, SuggestionIconKind>>{ key: x.name, value: SuggestionIconKind.Other },
      ),
    ]

    IntellisenseHelper.AddSuggestionsForMatches(intellisenseData, suggestions, SuggestionKind.Global, true)
  }

  // Verify that there is only one bracketOpen and possibly multiple spaces
  // between the begin and cursor position.
  private static IsBracketOpen(begin: number, cursorPos: number, script: string): boolean {
    // Contracts.Assert(begin <= cursorPos);
    // Contracts.Assert(script.Length >= cursorPos);

    // Failsafe for index out of bounds exception.
    if (begin < 0 || script.length < cursorPos) return false

    let bracketOpenCount: number = 0
    for (let i = begin; i < cursorPos; i++) {
      if (TexlLexer.PunctuatorBracketOpen == script[i]) bracketOpenCount++
      else if (bracketOpenCount > 1 || !CharacterUtils.IsSpace(script[i])) return false
    }

    return bracketOpenCount == 1
  }

  private static AddSuggestionsForScopeFields(intellisenseData: IntellisenseData, scope: DType): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.Assert(scope.IsValid);

    for (let field of scope.getNames(DPath.Root))
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        TexlLexer.PunctuatorAt + TexlLexer.EscapeName(field.name.value),
        SuggestionKind.Field,
        SuggestionIconKind.Other,
        field.type,
        false,
      )
  }
}
// }
