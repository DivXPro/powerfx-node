import { ErrorResourceKey, Span } from '../../localization'
import { sequenceEqual } from '../../utils/SequenceEqual'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class ErrorToken extends Token {
  public readonly detailErrorKey?: ErrorResourceKey
  public readonly resourceKeyFormatStringArgs?: any[]

  // May produce null, if there is no available detail for this error token.
  // public get detailErrorKey() { return this.detailErrorKey }

  // Args for ErrorResourceKey("UnexpectedCharacterToken")'s format string used in UnexpectedCharacterTokenError/LexError inside Lexer.cs.
  // public object[] ResourceKeyFormatStringArgs { get { return _resourceKeyFormatStringArgs; } }

  constructor(span: Span, detailErrorKey?: ErrorResourceKey, ...args: any[]) {
    // Contracts.AssertValueOrNull(detailErrorKey);
    // Contracts.AssertValueOrNull(args);
    super(TokKind.Error, span)
    this.detailErrorKey = detailErrorKey
    this.resourceKeyFormatStringArgs = args
  }

  public clone(ts: Span) {
    return new ErrorToken(ts, this.detailErrorKey)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);
    if (!(that instanceof ErrorToken) || that == null) {
      return false
    }
    const other = that as ErrorToken
    return (
      this.detailErrorKey?.key == other.detailErrorKey?.key &&
      super.equals(other) &&
      sequenceEqual(this.resourceKeyFormatStringArgs || [], other.resourceKeyFormatStringArgs || [])
    )
  }
}
