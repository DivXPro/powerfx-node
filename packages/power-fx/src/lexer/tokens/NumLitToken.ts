import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class NumLitToken extends Token {
  constructor(tid: NumLitToken | number, span: Span) {
    super(TokKind.NumLit, span)
    // super(tid instanceof NumLitToken ? tid.value : TokKind.NumLit, span)
    if (tid instanceof NumLitToken) {
      this._value = tid.value
    } else if (typeof tid === 'number') {
      this._value = tid
    }
  }

  private readonly _value: number

  public get value() {
    return this._value
  }

  public get isDottedNamePunctuator() {
    {
      return this.Kind == TokKind.Dot || this.Kind == TokKind.Bang || this.Kind == TokKind.BracketOpen
    }
  }

  public clone(ts: Span) {
    return new NumLitToken(this, ts)
  }

  public toString() {
    return this._value.toString()
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof NumLitToken)) {
      return false
    }
    return this.value == (<NumLitToken>that).value && super.equals(that)
  }
}
