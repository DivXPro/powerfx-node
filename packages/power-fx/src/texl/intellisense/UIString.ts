// Object for the UI display string
export class UIString {
  //   public UIString(text: string)
  //     : this(text, -1, -1)
  // {
  // }

  constructor(text: string, highlightStart: number = -1, highlightEnd: number = -1) {
    // Contracts.AssertNonEmpty(text);
    // Contracts.Assert(-1 <= highlightStart && highlightStart <= highlightEnd);

    this.text = text
    this.highlightStart = highlightStart
    this.highlightEnd = highlightEnd
  }

  /// <summary>
  /// This is the string that will be displayed to the user.
  /// </summary>
  public text: string // { get; private set; }

  /// <summary>
  /// The start index of the matching string from the input text in the display string.
  /// </summary>
  public highlightStart: number //{ get; private set; }

  /// <summary>
  /// The end Index of the matching string from the input text in the display string.
  /// </summary>
  public highlightEnd: number //{ get; private set; }
}
