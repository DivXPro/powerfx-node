import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class StrInterpEndToken extends Token {
  private readonly _val: string

  constructor(span: Span) {
    super(TokKind.StrInterpEnd, span)
  }

  public toString() {
    return '"'
  }

  public clone(ts: Span) {
    return new StrInterpEndToken(ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof StrInterpEndToken)) {
      return false
    }
    return super.equals(that)
  }
}
