import { Span } from '../../localization'
import { TokKind } from '../TokKind'
import { Token } from './Token'

export class EofToken extends Token {
  constructor(span: Span) {
    super(TokKind.Eof, span)
  }

  public clone(ts: Span) {
    return new EofToken(ts)
  }
}
