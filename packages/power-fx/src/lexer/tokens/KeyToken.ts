import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class KeyToken extends Token {
  constructor(tid: KeyToken | TokKind, span: Span) {
    super(tid instanceof KeyToken ? tid.Kind : tid, span)
  }

  public get isDottedNamePunctuator() {
    {
      return this.Kind == TokKind.Dot || this.Kind == TokKind.Bang || this.Kind == TokKind.BracketOpen
    }
  }

  public clone(ts: Span) {
    return new KeyToken(this, ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof KeyToken)) return false
    return super.equals(that)
  }
}
