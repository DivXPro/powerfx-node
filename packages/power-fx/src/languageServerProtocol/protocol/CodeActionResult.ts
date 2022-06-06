import { range } from './Range'

export class CodeActionResult {
  /// <summary>
  /// Gets or sets title to be displayed on code fix suggestion.
  /// </summary>
  public Title: string

  /// <summary>
  /// Gets or sets code fix expression text to be applied.
  /// </summary>
  public Text: string

  /// <summary>
  /// Gets or sets code fix range.
  /// </summary>
  public Range: range
}
