/// <summary>
/// This class represents the default intellisense result.

import { TexlFunction } from '../../../functions/TexlFunction'
import { IIntellisenseData } from './IIntellisenseData'

/// </summary>
export class DefaultIntellisenseData implements IIntellisenseData {
  public ReplacementStartIndex = 0
  public ReplacementLength = 0
  public CurFunc: TexlFunction = null
  public ArgCount = 0
  public ArgIndex = 0
  public Script: string = ''

  /// <summary>
  /// No-op, default Intellisense does not augment signatures at this stage.
  /// </summary>
  /// <param name="newHighlightStart">
  /// 0 when this method returns
  /// </param>
  /// <param name="newHighlightEnd">
  /// 0 when this method returns
  /// </param>
  /// <param name="newParamName">
  /// <see cref="string.Empty"/> when this method returns
  /// </param>
  /// <param name="newInvariantParamName">
  /// <see cref="string.Empty"/> when this method returns
  /// </param>
  /// <returns>
  /// False
  /// </returns>
  public static DefaultTryAugmentSignature(
    func: TexlFunction,
    argIndex: number,
    paramName: string,
    highlightStart: number,
  ): [boolean, number, number, string, string] {
    // newHighlightStart = 0;
    // newHighlightEnd = 0;
    // newParamName = string.Empty;
    // newInvariantParamName = string.Empty;
    return [false, 0, 0, '', '']
  }

  public TryAugmentSignature(func: TexlFunction, argIndex: number, paramName: string, highlightStart: number) {
    return DefaultIntellisenseData.DefaultTryAugmentSignature(func, argIndex, paramName, highlightStart) //, out newHighlightStart, out newHighlightEnd, out newParamName, out newInvariantParamName
  }

  /// <summary>
  /// Returns nothing, default Intellisense does not suffix parameters by default.
  /// </summary>
  /// <param name="function">
  /// The function that will not be suffixed
  /// </param>
  /// <param name="paramName">
  /// The parameter that will not be suffixed
  /// </param>
  /// <returns><see cref="string.Empty"/></returns>
  public static GenerateDefaultParameterDescriptionSuffix(func: TexlFunction, paramName: string): string {
    return ''
  }

  public GenerateParameterDescriptionSuffix(func: TexlFunction, paramName: string) {
    return DefaultIntellisenseData.GenerateDefaultParameterDescriptionSuffix(func, paramName)
  }
}
