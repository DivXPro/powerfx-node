import { IIntellisenseContext } from '../../IIntellisenseContext'
import { IntellisenseData } from '../../IntellisenseData/IntellisenseData'
import { IntellisenseSuggestion } from '../../IntellisenseSuggestion'

export interface ISpecialCaseHandler {
  /// <summary>
  /// Handles special cases as needed by fixing replacementStartIndex and matchingLength.
  /// Additionally, filters suggestion list if needed
  /// </summary>
  Run(context: IIntellisenseContext, intellisenseData: IntellisenseData, suggestions: IntellisenseSuggestion[]): boolean
}
