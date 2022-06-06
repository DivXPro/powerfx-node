import { IIntellisenseContext } from './IIntellisenseContext'

export class IntellisenseContext implements IIntellisenseContext {
  /// <summary>
  /// The input string for intellisense.
  /// </summary>
  public InputText: string // { get; private set; }

  /// <summary>
  /// Cursor position for the intellisense input string.
  /// </summary>
  public CursorPosition: number // { get; private set; }

  constructor(inputText: string, cursorPosition: number) {
    // Contracts.CheckValue(inputText, "inputText");
    // Contracts.CheckParam(cursorPosition >= 0 && cursorPosition <= inputText.Length, "cursorPosition");

    this.InputText = inputText
    this.CursorPosition = cursorPosition
  }

  public InsertTextAtCursorPos(insertedText: string): void {
    // Contracts.AssertValue(insertedText);

    this.InputText =
      this.InputText.substr(0, this.CursorPosition) + insertedText + this.InputText.substr(this.CursorPosition)
    this.CursorPosition = this.CursorPosition + insertedText.length
  }
}
