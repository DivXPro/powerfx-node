import { Diagnostic } from './Diagnostics'

export class PublishDiagnosticsParams {
  constructor() {
    this.uri = ''
    this.diagnostics = []
  }

  /// <summary>
  /// The URI for which diagnostic information is reported.
  /// </summary>
  public uri: string

  /// <summary>
  /// An array of diagnostic information items.
  /// </summary>
  public diagnostics: Diagnostic[]
}
