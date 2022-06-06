export class TextDocumentContentChangeEvent {
  constructor() {
    this.text = ''
  }

  /// <summary>
  /// The new text of the whole document.
  /// </summary>
  public text: string
}
