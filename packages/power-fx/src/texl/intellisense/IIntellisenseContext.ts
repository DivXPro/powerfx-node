// [TransportType(TransportKind.ByValue)]
export interface IIntellisenseContext {
  /// <summary>
  /// The input string for intellisense.
  /// </summary>
  InputText: string

  /// <summary>
  /// Cursor position for the intellisense input string.
  /// </summary>
  CursorPosition: number
}
