import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class IslandStartToken extends Token {
  constructor(span: Span) {
    super(TokKind.IslandStart, span)
  }

  public toString() {
    return '{'
  }

  public clone(ts: Span) {
    return new IslandStartToken(ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof IslandStartToken)) return false
    return super.equals(that)
  }
}
