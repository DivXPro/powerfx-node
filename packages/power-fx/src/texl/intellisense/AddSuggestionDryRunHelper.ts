import { DType } from '../../types'
import { AddSuggestionHelper } from './AddSuggestionHelper'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { IntellisenseSuggestionList } from './IntellisenseSuggestionList'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'

export class AddSuggestionDryRunHelper extends AddSuggestionHelper {
  protected CheckAndAddSuggestion(suggestions: IntellisenseSuggestionList, candidate: IntellisenseSuggestion): boolean {
    return !suggestions.containsSuggestion(candidate.DisplayText.text)
  }

  protected ConstructUIString(
    suggestionKind: SuggestionKind,
    type: DType,
    suggestions: IntellisenseSuggestionList,
    valueToSuggest: string,
    highlightStart: number,
    highlightEnd: number,
  ): UIString {
    return new UIString(valueToSuggest, highlightStart, highlightEnd)
  }
}
