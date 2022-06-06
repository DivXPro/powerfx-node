import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { ISuggestionHandler } from './ISuggestionHandler'

//  internal partial class Intellisense {
export class NullNodeSuggestionHandler implements ISuggestionHandler {
  constructor() {}

  /// <summary>
  /// Adds suggestions as appropriate to the internal Suggestions and SubstringSuggestions lists of intellisenseData.
  /// Returns true if intellisenseData is handled and no more suggestions are to be found and false otherwise.
  /// </summary>
  public Run(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);

    if (intellisenseData.CurNode != null) return false

    return IntellisenseHelper.AddSuggestionsForValuePossibilities(intellisenseData, null)
  }
}
// }
