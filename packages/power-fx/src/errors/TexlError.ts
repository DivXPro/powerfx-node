import { BaseError } from './BaseError'
import { TexlNode } from '../syntax/nodes/TexlNode'
import { ErrorResourceKey, Span, TexlStrings } from '../localization'
import { DocumentErrorSeverity } from './DocumentErrorSeverity'
import { DocumentErrorKind } from './DocumentErrorKind'
import { Token } from '../lexer/tokens'
import { IRuleError } from './IRuleError'
import { DName } from '../utils/DName'
import { StringBuilder } from '../utils/StringBuilder'

export class TexlError extends BaseError implements IRuleError {
  private readonly _nameMapIDs: Array<string>
  readonly node: TexlNode
  readonly tok: Token
  // override textSpan: Span
  get sinkTypeErrors() {
    return this._nameMapIDs
  }

  constructor(node: TexlNode, tok: any, severity: DocumentErrorSeverity, errKey: ErrorResourceKey, ...args: any[]) {
    super(undefined, undefined, DocumentErrorKind.AXL, severity, errKey, undefined, undefined, ...args)
    this.tok = tok
    this.node = node
    if (node != null) {
      this.textSpan = node.getTextSpan()
    } else {
      this.textSpan = new Span(tok.Span.min, tok.Span.lim)
    }
    this._nameMapIDs = []
  }

  public MarkSinkTypeError(name: DName) {
    // Contracts.AssertValid(name);

    // Contracts.Assert(!_nameMapIDs.Contains(name.Value));
    this._nameMapIDs.push(name.value)
  }

  protected formatCore(sb: StringBuilder) {
    // Contracts.AssertValue(sb)

    sb.appendFormat(TexlStrings.FormatSpan_Min_Lim(), this.tok.Span.min, this.tok.Span.lim)

    if (Node != null) {
      sb.appendFormat(TexlStrings.InfoNode_Node(), Node.toString())
    } else {
      sb.appendFormat(TexlStrings.InfoTok_Tok(), this.tok.toString())
    }

    sb.appendFormat(TexlStrings.FormatErrorSeparator())
    super.formatCore(sb)
  }
}
