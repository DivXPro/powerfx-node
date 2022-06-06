import { TexlLexer } from '../../lexer/TexlLexer'
import { DType } from '../../types'
import { IntellisenseData } from './IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from './IntellisenseHelper'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { IntellisenseSuggestionList } from './IntellisenseSuggestionList'
import { SuggestionIconKind } from './SuggestionIconKind'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'

export class AddSuggestionHelper {
  public AddSuggestion(
    intellisenseData: IntellisenseData,
    suggestion: string,
    suggestionKind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    requiresSuggestionEscaping: boolean,
    sortPriority = 0,
  ): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(suggestion);

    if (!intellisenseData.DetermineSuggestibility(suggestion, type)) {
      return false
    }

    let suggestions: IntellisenseSuggestionList = intellisenseData.Suggestions
    let substringSuggestions: IntellisenseSuggestionList = intellisenseData.SubstringSuggestions
    let matchingLength: number = intellisenseData.MatchingLength
    let matchingStr: string = intellisenseData.MatchingStr
    let boundTo: string = intellisenseData.BoundTo

    let valueToSuggest = requiresSuggestionEscaping ? TexlLexer.EscapeName(suggestion) : suggestion
    let highlightStart: number = suggestion.toLocaleLowerCase().indexOf(matchingStr.toLocaleLowerCase()) //.IndexOf(matchingStr, StringComparison.OrdinalIgnoreCase);
    // If the suggestion has special characters we need to find the highlightStart index by escaping the matching string as well.
    // Because, the suggestion could be something like 'Ident with Space' and the user might have typed Ident. In this case,
    // we want to highlight only Ident while displaying 'Ident with Space'.
    if (
      requiresSuggestionEscaping &&
      !(matchingStr == '' || matchingStr == null) &&
      valueToSuggest != suggestion &&
      highlightStart == 0
    )
      highlightStart++
    else matchingLength--

    let highlightEnd: number = highlightStart + matchingStr.length
    if (IntellisenseHelper.IsMatch(suggestion, matchingStr)) {
      // In special circumstance where the user escapes an identifier where they don't have to, the matching length will
      // include the starting delimiter that user provided, where as the suggestion would not include any delimiters.
      // Hence we have to count for that fact.
      if (matchingLength > 0 && matchingLength > matchingStr.length)
        highlightEnd = matchingLength > valueToSuggest.length ? valueToSuggest.length : matchingLength
      let UIsuggestion: UIString = this.ConstructUIString(
        suggestionKind,
        type,
        suggestions,
        valueToSuggest,
        highlightStart,
        highlightEnd,
      )
      let candidate: IntellisenseSuggestion = new IntellisenseSuggestion(
        UIsuggestion,
        suggestionKind,
        iconKind,
        type,
        boundTo,
        -1,
        '',
        null,
        sortPriority,
      )
      return this.CheckAndAddSuggestion(suggestions, candidate)
    }
    if (highlightStart > -1) {
      let UIsuggestion: UIString = this.ConstructUIString(
        suggestionKind,
        type,
        substringSuggestions,
        valueToSuggest,
        highlightStart,
        highlightEnd,
      )
      let candidate: IntellisenseSuggestion = new IntellisenseSuggestion(
        UIsuggestion,
        suggestionKind,
        iconKind,
        type,
        boundTo,
        -1,
        '',
        null,
        sortPriority,
      )

      return this.CheckAndAddSuggestion(substringSuggestions, candidate)
    }

    return false
  }

  protected CheckAndAddSuggestion(suggestions: IntellisenseSuggestionList, candidate: IntellisenseSuggestion): boolean {
    return IntellisenseHelper.CheckAndAddSuggestion(candidate, suggestions)
  }

  protected ConstructUIString(
    suggestionKind: SuggestionKind,
    type: DType,
    suggestions: IntellisenseSuggestionList,
    valueToSuggest: string,
    highlightStart: number,
    highlightEnd: number,
  ): UIString {
    return IntellisenseHelper.DisambiguateGlobals(
      suggestions,
      new UIString(valueToSuggest, highlightStart, highlightEnd),
      suggestionKind,
      type,
    )
  }
}
