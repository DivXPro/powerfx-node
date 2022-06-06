import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class StrLitToken extends Token {
  private readonly _val: string

  constructor(tid: StrLitToken | string, span: Span) {
    super(TokKind.StrLit, span)

    if (typeof tid === 'string') {
      this._val = tid
    } else {
      this._val = tid.value
    }
  }

  public toString() {
    return this._val
  }

  public get value() {
    return this._val
  }

  public clone(ts: Span) {
    return new StrLitToken(this, ts)
  }

  public equals(that: Token) {
    // Contracts.AssertValue(that);

    if (!(that instanceof StrLitToken)) {
      return false
    }
    return this.value == (<StrLitToken>that).value && super.equals(that)
  }
}
