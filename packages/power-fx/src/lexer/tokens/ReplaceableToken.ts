import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class ReplaceableToken extends Token {
  private readonly _val: string

  constructor(tid: ReplaceableToken | string, span: Span) {
    super(TokKind.ReplaceableLit, span)

    if (typeof tid === 'string') {
      this._val = tid
    }
  }

  public get value() {
    return this._val
  }

  public toString() {
    return this._val
  }

  public clone(ts: Span) {
    return new ReplaceableToken(this, ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof ReplaceableToken)) {
      return false
    }
    return this.value == (<ReplaceableToken>that).value && super.equals(that)
  }
}
