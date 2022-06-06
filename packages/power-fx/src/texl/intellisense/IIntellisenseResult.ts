import Exception from '../../utils/typescriptNet/Exception'
import { IIntellisenseSuggestion } from './IIntellisenseSuggestion'
import { SignatureHelp } from './SignatureHelp/SignatureHelp'

export interface IIntellisenseResult {
  /// <summary>
  /// Enumerates suggestions for the current position in some specified input.
  /// </summary>
  Suggestions: IIntellisenseSuggestion[]

  /// <summary>
  /// Returns the start index of the input string at which the suggestion has to be replaced upon selection of the suggestion.
  /// </summary>
  ReplacementStartIndex: number

  /// <summary>
  /// Returns the length of text to be replaced with the current suggestion.
  /// </summary>
  ReplacementLength: number

  /// <summary>
  /// A boolean value indicating whether the cursor is in function scope or not.
  /// </summary>
  IsFunctionScope: boolean

  /// <summary>
  /// Index of the overload in 'FunctionOverloads' to be displayed in the UI.
  /// This is equal to -1 when IsFunctionScope = False.
  /// </summary>
  CurrentFunctionOverloadIndex: number

  /// <summary>
  /// Enumerates function overloads for the function to be displayed.
  /// This is empty when IsFunctionScope = False.
  /// </summary>
  FunctionOverloads: IIntellisenseSuggestion[]

  /// <summary>
  /// Exception information in event of error.
  /// </summary>
  exception: Exception // Exception: Exception

  //       /// <summary>
  //       /// Function signature help for this result, complies to Language Server Protocol
  //       /// </summary>
  SignatureHelp: SignatureHelp
}
