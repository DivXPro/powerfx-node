import { DiagnosticSeverity } from './DiagnosticSeverity'
import { range } from './Range'

export class Diagnostic {
  constructor() {
    this.range = new range()
    this.message = ''
  }

  /// <summary>
  /// The range at which the message applies.
  /// </summary>
  public range: range

  /// <summary>
  /// The diagnostic's message.
  /// </summary>
  public message: string

  /// <summary>
  /// A diagnostic instance may represent an error, warning, hint, etc., and each may impose different
  /// behavior on an editor.  This member indicates the diagnostic's kind.
  /// </summary>
  public severity: DiagnosticSeverity
}
