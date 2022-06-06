import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class IslandEndToken extends Token {
  constructor(span: Span) {
    super(TokKind.IslandEnd, span)
  }

  public toString() {
    return '}'
  }

  public clone(ts: Span) {
    return new IslandEndToken(ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof IslandEndToken)) return false
    return super.equals(that)
  }
}
