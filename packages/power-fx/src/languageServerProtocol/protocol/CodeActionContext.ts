import { Diagnostic } from './Diagnostics'

export class CodeActionContext {
  /// <summary>
  /// ctor
  /// </summary>
  constructor() {
    this.diagnostics = []
    this.only = []
  }

  /// <summary>
  /// An array of diagnostic information items.
  /// </summary>
  public diagnostics: Diagnostic[]

  /// <summary>
  /// List of code action kind string values.
  /// </summary>
  public only: string[]
}
