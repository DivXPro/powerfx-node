import { TokKind } from '../TokKind'
import { Span } from '../../localization/Span'
import { Hashing } from '../../utils/Hash'
import { IEquatable } from '../../utils/types'

export abstract class Token implements IEquatable<Token> {
  public kind: TokKind
  public span: Span

  public get Kind(): TokKind {
    return this.kind
  }

  public get Span(): Span {
    return this.span
  }

  get isDottedNamePunctuator() {
    return false
  }

  constructor(tid: TokKind, span: Span) {
    this.kind = tid
    this.span = span
  }

  public abstract clone(ts: Span): Token

  public toString() {
    return this.kind.toString()
  }

  public getHashCode() {
    // return (int)Kind ^ (int)0x7AFF9182;
    return Hashing.HashUint(this.kind + 0x7aff9182)
  }

  public equals(that: any) {
    if (that == null) return false

    if (!(that instanceof Token)) return false
    return this.kind === that.kind
  }
}
