import { SuggestionIconKind } from './SuggestionIconKind'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'

export interface IIntellisenseSuggestion {
  /// <summary>
  /// The Kind of Suggestion.
  /// </summary>
  Kind: SuggestionKind

  /// <summary>
  /// What kind of icon to display next to the suggestion.
  /// </summary>
  IconKind: SuggestionIconKind

  /// <summary>
  /// This is the string that will be displayed to the user.
  /// </summary>
  DisplayText: UIString

  /// <summary>
  /// Indicates if there are errors.
  /// </summary>
  HasErrors: boolean

  /// <summary>
  /// Description, suitable for UI consumption.
  /// </summary>
  FunctionParameterDescription: string

  /// <summary>
  /// Description, suitable for UI consumption.
  /// </summary>
  Definition: string

  /// <summary>
  /// A boolean value indicating if the suggestion matches the expected type in the rule.
  /// </summary>
  IsTypeMatch: boolean

  /// <summary>
  /// Returns the list of suggestions for the overload of the function.
  /// This is populated only if the suggestion kind is a function and if the function has overloads.
  /// </summary>
  Overloads: IIntellisenseSuggestion[]

  /// <summary>
  /// A boolean value indicating if the suggestion should be preselected by the formula bar
  /// In canvas, used for Primary Output properties
  /// </summary>
  ShouldPreselect: boolean
}
