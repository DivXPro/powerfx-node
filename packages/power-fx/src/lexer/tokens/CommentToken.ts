import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class CommentToken extends Token {
  private readonly val: string
  public isOpenBlock: boolean = false

  constructor(val: string, span: Span) {
    super(TokKind.Comment, span)
    // Contracts.AssertValue(val);
    this.val = val
  }

  public get value() {
    return this.val
  }

  public clone(ts: Span) {
    return new CommentToken(this.value, ts)
  }
}
