import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class StrInterpStartToken extends Token {
  private readonly _val: string

  constructor(span: Span) {
    super(TokKind.StrInterpStart, span)
  }

  public toString() {
    return '$"'
  }

  public clone(ts: Span) {
    return new StrInterpStartToken(ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof StrInterpStartToken)) {
      return false
    }
    return super.equals(that)
  }
}
