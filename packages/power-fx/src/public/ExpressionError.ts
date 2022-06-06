import { DocumentErrorSeverity } from '../errors'
import { Span } from '../localization'
import { ErrorKind } from './ErrorKind'

export class ExpressionError {
  public message: string
  public span: Span
  public kind: ErrorKind
  public severity: DocumentErrorSeverity
  // severity: DocumentErrorSeverity
  constructor(message: string, span: Span, kind?: ErrorKind, severity?: DocumentErrorSeverity) {
    this.message = message
    this.span = span
    this.kind = kind
    this.severity = severity
  }

  toString() {
    if (this.span != null) {
      return `Error ${this.span.min}-${this.span.lim}: ${this.message}`
    }
    return `Error ${this.message}`
  }
}
