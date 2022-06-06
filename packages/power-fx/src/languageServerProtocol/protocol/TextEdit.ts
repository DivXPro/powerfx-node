import { range } from './Range'
export class TextEdit {
  /// <summary>
  /// Gets or sets the target range object.
  /// </summary>
  public Range: range

  /// <summary>
  /// Gets or sets new text to be replace when command executed.
  /// </summary>
  public NewText: string
}
