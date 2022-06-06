import { Span } from '../localization'
import { Token } from './tokens/Token'
import { TokKind } from './TokKind'

export class WhitespaceToken extends Token {
  private _val: string
  constructor(tid: string, span: Span) {
    super(TokKind.Whitespace, span)
    this._val = tid
  }

  public get Value(): string {
    return this._val
  }

  public clone(ts: Span) {
    return new WhitespaceToken(this.Value, ts)
  }
}
