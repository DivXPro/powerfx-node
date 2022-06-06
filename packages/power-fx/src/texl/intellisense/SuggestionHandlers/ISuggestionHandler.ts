import { IIntellisenseData } from '../IntellisenseData/IIntellisenseData'

export interface ISuggestionHandler {
  /// <summary>
  /// Adds suggestions as appropriate to the internal Suggestions and SubstringSuggestions lists of intellisenseData.
  /// Returns true if suggestions are found and false otherwise.
  /// </summary>
  Run(intellisenseData: IIntellisenseData): boolean
}
