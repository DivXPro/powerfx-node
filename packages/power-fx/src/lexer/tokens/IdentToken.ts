import { TokKind } from '../TokKind'
import { IdentifierDelimiter } from '../TexlUnit'
import { Span } from '../../localization'
import { isNullOrEmpty } from '../../utils/CharacterUtils'
import { DName } from '../../utils/DName'
import { StringBuilder } from '../../utils/StringBuilder'
import { ReplaceableToken } from './ReplaceableToken'
import { Token } from './Token'

export class IdentToken extends Token {
  public readonly hasDelimiterStart: boolean
  public readonly hasDelimiterEnd: boolean
  public readonly isModified: boolean
  public readonly isReplaceable: boolean

  // Unescaped, unmodified value.
  private readonly value: string
  public readonly name: DName

  public static MakeFromReplaceable(tok: ReplaceableToken) {
    return new IdentToken(tok.value, tok.span, false, false, true)
  }

  constructor(val: string, span: Span, fDelimiterStart = false, fDelimiterEnd = false, fReplaceable = false) {
    // Contracts.AssertValue(val);

    // String interpolation sometimes creates tokens that do not exist in the source code
    // so we skip validating the span length for the Ident that the parser generates
    // Contracts.Assert(val.Length == span.Lim - span.Min);
    // Contracts.AssertValue(val);
    // Contracts.Assert(fDelimiterStart || !fDelimiterEnd);
    super(TokKind.Ident, span)
    this.value = val
    const result = DName.MakeValid(val)
    this.name = result[0]
    this.isModified = result[1]
    this.hasDelimiterStart = fDelimiterStart
    this.hasDelimiterEnd = fDelimiterEnd
    this.isReplaceable = fReplaceable
  }

  public clone(ts: Span) {
    return new IdentToken(this.value, ts, this.hasDelimiterStart, this.hasDelimiterEnd)
  }

  // REVIEW ragru: having a property for every possible error isn't scalable.
  public get hasDelimiters() {
    return this.hasDelimiterStart
  }

  public get hasErrors() {
    return this.isModified || (this.hasDelimiterStart && !this.hasDelimiterEnd)
  }

  public toString() {
    const sb = new StringBuilder()
    this.format(sb)
    return sb.toString()
  }

  // Prints the original string.
  public format(sb: StringBuilder) {
    // Contracts.AssertValue(sb);

    if (isNullOrEmpty(this.value)) {
      sb.append(IdentifierDelimiter)
      sb.append(IdentifierDelimiter)
      return
    }

    if (this.hasDelimiterStart) {
      sb.append(IdentifierDelimiter)
    }

    for (let i = 0; i < this.value.length; i++) {
      const ch = this.value[i]
      sb.append(ch)

      if (ch == IdentifierDelimiter) {
        sb.append(ch)
      }
    }

    if (this.hasDelimiterEnd) {
      sb.append(IdentifierDelimiter)
    }
  }

  public equals(that: Token): boolean {
    // Contracts.AssertValue(that);

    if (!(that instanceof IdentToken)) return false
    return this.name === (that as IdentToken).name && super.equals(that)
  }
}
