import { TexlLexer } from '../../../../lexer'
import { IIntellisenseContext } from '../../IIntellisenseContext'
import { IntellisenseData } from '../../IntellisenseData/IntellisenseData'
import { IntellisenseSuggestion } from '../../IntellisenseSuggestion'
import { ISpecialCaseHandler } from './ISpecialCaseHandler'

export class StringSuggestionHandler implements ISpecialCaseHandler {
  private readonly _tokenStartIndex: number
  private readonly _requireTokenStartWithQuote: boolean

  constructor(startIndex: number, requireTokenStartWithQuote = true) {
    // Contracts.Assert(0 <= startIndex);
    this._tokenStartIndex = startIndex
    this._requireTokenStartWithQuote = requireTokenStartWithQuote
  }

  public Run(
    context: IIntellisenseContext,
    intellisenseData: IntellisenseData,
    suggestions: IntellisenseSuggestion[],
  ): boolean {
    // Contracts.AssertValue(context);
    // Contracts.AssertValue(context.InputText);
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(suggestions);

    let script = context.InputText
    // Contracts.Assert(_tokenStartIndex < script.Length);

    if (this._requireTokenStartWithQuote && script[this._tokenStartIndex] != '"') return false

    let matchEndIndex = -1
    let foundAny = false
    let iterateSuggestions = suggestions //.ToArray();

    for (let suggestion of iterateSuggestions) {
      let i: number
      let j: number
      let found = false

      for (i = this._tokenStartIndex, j = 0; i < script.length; i++, j++) {
        if (j >= suggestion.Text.length) {
          // The input text for this parameter has exceeded the suggestion and we should filter it out
          found = false
          break
        }

        if (script[i] != suggestion.Text[j]) {
          let curChar = script.substr(i, 1)
          if (
            curChar != TexlLexer.PunctuatorParenClose &&
            curChar != TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator
          )
            found = false
          break
        }

        found = true
      }

      foundAny = foundAny || found

      if (found && matchEndIndex < i) matchEndIndex = i

      if (!found && i != script.length)
        // suggestions.Remove(suggestion);
        suggestions.forEach(function (item, index, arr) {
          if (item == suggestion) {
            arr.splice(index, 1)
          }
        })
    }

    if (!foundAny || matchEndIndex <= this._tokenStartIndex) return false

    intellisenseData.Suggestions.clear()
    intellisenseData.SubstringSuggestions.clear()
    intellisenseData.SetMatchArea(this._tokenStartIndex, matchEndIndex)
    return true
  }
}
