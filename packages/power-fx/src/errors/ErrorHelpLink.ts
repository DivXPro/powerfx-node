export interface IErrorHelpLink {
  displayText: string
  url: string
}

export class ErrorHelpLink implements IErrorHelpLink {
  public displayText: string
  public url: string
  constructor(displayText: string, url: string) {
    // Contracts.AssertNonEmpty(displayText)
    // Contracts.AssertNonEmpty(url)

    this.displayText = displayText
    this.url = url
  }
}
