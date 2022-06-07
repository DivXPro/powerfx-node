import { StringBuilder } from './StringBuilder'
import { StringBuilderCache } from './StringBuilderCache'
import { getUnicodeCategory, UnicodeCategory } from './UnicodeCategoy'

export function isSpace(ch: string) {
  switch (ch) {
    case ' ':
    case '\u0009':
    case '\u000c':
      return true
  }
  return false
}

export function isNullOrEmpty(str?: string) {
  return str == null || str === ''
}

export function isNullOrWhiteSpace(str: string) {
  return str == null || str.trim() == ''
}

export function isWhiteSpace(str: string) {
  return str.length > 0 && str.trim().length === 0
}

export function isNewLineCharacter(str: string) {}

export function hasFlag(src: number, target: number) {
  const srcBit = src.toString(2).split('').reverse()
  const targetBit = target.toString(2).split('').reverse()
  if (srcBit.length < targetBit.length) {
    return false
  }
  for (let i = 0; i < targetBit.length; i++) {
    if (targetBit[i] === '1' && srcBit[i] !== '1') {
      return false
    }
  }
  return true
}

export enum UniCatFlags {
  // Letters
  LowercaseLetter = 1 << UnicodeCategory.LowercaseLetter, // Ll
  UppercaseLetter = 1 << UnicodeCategory.UppercaseLetter, // Lu
  TitlecaseLetter = 1 << UnicodeCategory.TitlecaseLetter, // Lt
  ModifierLetter = 1 << UnicodeCategory.ModifierLetter, // Lm
  OtherLetter = 1 << UnicodeCategory.OtherLetter, // Lo

  // Marks
  NonSpacingMark = 1 << UnicodeCategory.NonSpacingMark, // Mn
  SpacingCombiningMark = 1 << UnicodeCategory.SpacingCombiningMark, // Mc

  // Numbers
  DecimalDigitNumber = 1 << UnicodeCategory.DecimalDigitNumber, // Nd
  LetterNumber = 1 << UnicodeCategory.LetterNumber, // Nl (i.e. roman numeral one 0x2160)

  // Spaces
  SpaceSeparator = 1 << UnicodeCategory.SpaceSeparator, // Zs
  LineSeparator = 1 << UnicodeCategory.LineSeparator, // Zl
  ParagraphSeparator = 1 << UnicodeCategory.ParagraphSeparator, // Zp

  // Other
  Format = 1 << UnicodeCategory.Format, // Cf
  Control = 1 << UnicodeCategory.Control, // Cc
  OtherNotAssigned = 1 << UnicodeCategory.OtherNotAssigned, // Cn
  PrivateUse = 1 << UnicodeCategory.PrivateUse, // Co
  Surrogate = 1 << UnicodeCategory.Surrogate, // Cs

  // Punctuation
  ConnectorPunctuation = 1 << UnicodeCategory.ConnectorPunctuation, // Pc

  // Useful combinations.
  IdentStartChar = UniCatFlags.UppercaseLetter |
    UniCatFlags.LowercaseLetter |
    UniCatFlags.TitlecaseLetter |
    UniCatFlags.ModifierLetter |
    UniCatFlags.OtherLetter |
    UniCatFlags.LetterNumber,

  IdentPartChar = UniCatFlags.IdentStartChar |
    UniCatFlags.NonSpacingMark |
    UniCatFlags.SpacingCombiningMark |
    UniCatFlags.DecimalDigitNumber |
    UniCatFlags.ConnectorPunctuation |
    UniCatFlags.Format,
}
export class CharacterUtils {
  // private CharacterUtils()
  // {
  //     // Do nothing.
  // }

  /// <summary>
  /// Bit masks of the UnicodeCategory enum. A couple extra values are defined
  /// for convenience for the C# lexical grammar.
  /// </summary>

  // public static enum UniCatFlags
  // {
  //     // Letters
  //     LowercaseLetter = 1 << UnicodeCategory.LowercaseLetter, // Ll
  //     UppercaseLetter = 1 << UnicodeCategory.UppercaseLetter, // Lu
  //     TitlecaseLetter = 1 << UnicodeCategory.TitlecaseLetter, // Lt
  //     ModifierLetter = 1 << UnicodeCategory.ModifierLetter, // Lm
  //     OtherLetter = 1 << UnicodeCategory.OtherLetter, // Lo

  //     // Marks
  //     NonSpacingMark = 1 << UnicodeCategory.NonSpacingMark, // Mn
  //     SpacingCombiningMark = 1 << UnicodeCategory.SpacingCombiningMark, // Mc

  //     // Numbers
  //     DecimalDigitNumber = 1 << UnicodeCategory.DecimalDigitNumber, // Nd
  //     LetterNumber = 1 << UnicodeCategory.LetterNumber, // Nl (i.e. roman numeral one 0x2160)

  //     // Spaces
  //     SpaceSeparator = 1 << UnicodeCategory.SpaceSeparator, // Zs
  //     LineSeparator = 1 << UnicodeCategory.LineSeparator, // Zl
  //     ParagraphSeparator = 1 << UnicodeCategory.ParagraphSeparator, // Zp

  //     // Other
  //     Format = 1 << UnicodeCategory.Format, // Cf
  //     Control = 1 << UnicodeCategory.Control, // Cc
  //     OtherNotAssigned = 1 << UnicodeCategory.OtherNotAssigned, // Cn
  //     PrivateUse = 1 << UnicodeCategory.PrivateUse, // Co
  //     Surrogate = 1 << UnicodeCategory.Surrogate, // Cs

  //     // Punctuation
  //     ConnectorPunctuation = 1 << UnicodeCategory.ConnectorPunctuation, // Pc

  //     // Useful combinations.
  //     IdentStartChar = UppercaseLetter | LowercaseLetter | TitlecaseLetter |
  //       ModifierLetter | OtherLetter | LetterNumber,

  //     IdentPartChar = IdentStartChar | NonSpacingMark | SpacingCombiningMark |
  //       DecimalDigitNumber | ConnectorPunctuation | Format,
  // }

  /// <summary>
  /// Escapes a minimal set of characters (', \0, \b, \t, \n, \v, \f, \r, \u0085, \u2028, \u2029)
  /// by replacing them with their escape codes.
  /// </summary>
  public static Escape(input: string) {
    // Contracts.CheckValue(input, nameof(input));

    return CharacterUtils.EscapeString(input)
  }

  public static ToPlainText(input: string) {
    // Contracts.CheckValue(input, nameof(input));

    if (isNullOrWhiteSpace(input)) {
      return input
    }

    const length = input.length
    const lengthForBuilder =
      CharacterUtils.EstimateEscapedStringLength(length) +
      2 /* for the quotes */
    let sb = StringBuilderCache.Acquire(lengthForBuilder)

    sb.append('"')
    const rst = CharacterUtils.InternalEscapeString(
      input,
      length,
      /* lengthForBuilder */ 0,
      sb,
      false
    ) // 'lengthForBuilder' will not be used.
    sb = rst[1]
    sb.append('"')

    return StringBuilderCache.GetStringAndRelease(sb)
  }

  // Sanitizes a name so it can be used as an identifer/variable name in JavaScript.
  public static ToJsIdentifier(name: string) {
    // Contracts.AssertNonEmpty(name);

    let length = name.length
    let estimatedLength = CharacterUtils.EstimateEscapedStringLength(length)
    let charsToAdd = 0
    let sb: StringBuilder = null

    for (let i = 0; i < length; i++) {
      const ch = name[i]

      if (CharacterUtils.IsLatinAlpha(ch)) {
        charsToAdd++
      } else if (ch == '_') {
        const rst = CharacterUtils.UpdateEscapeInternals(
          '__',
          name,
          estimatedLength,
          i,
          charsToAdd,
          sb
        )
        charsToAdd = rst[0]
        sb = rst[1]
      } else if (CharacterUtils.IsDigit(ch)) {
        if (i == 0) {
          const rst = CharacterUtils.UpdateEscapeInternals(
            '_' + ch,
            name,
            estimatedLength,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
        } else {
          charsToAdd++
        }
      } else {
        const rst = CharacterUtils.UpdateEscapeInternals(
          '_' + ch.charCodeAt(0).toString(16),
          name,
          estimatedLength,
          i,
          charsToAdd,
          sb
        )
        charsToAdd = rst[0]
        sb = rst[1]
      }
    }

    // The original string wasn't modified.
    if (sb == null) {
      return name
    }

    if (charsToAdd > 0) {
      sb.append(name, length - charsToAdd, charsToAdd)
    }

    // Contracts.Assert(sb.Length > 0);
    return StringBuilderCache.GetStringAndRelease(sb)
  }

  // Escape the specified string.
  public static EscapeString(value: string) {
    // Contracts.AssertValue(value);

    let length = value.length
    let lengthForBuilder = CharacterUtils.EstimateEscapedStringLength(length)
    let sb: StringBuilder

    return CharacterUtils.InternalEscapeString(
      value,
      length,
      lengthForBuilder,
      sb,
      true
    )
  }

  public static ExcelEscapeString(value: string): string {
    // Contracts.AssertValue(value);

    const length = value.length
    const lengthForBuilder = CharacterUtils.EstimateEscapedStringLength(length)
    let charsToAdd = 0
    let sb: StringBuilder

    for (let i = 0; i < length; i++) {
      switch (value[i]) {
        case '"':
          const rst = CharacterUtils.UpdateEscapeInternals(
            '""',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        default:
          charsToAdd++
          break
      }
    }

    // The original string wasn't modified.
    if (sb == null) {
      return value
    }

    if (charsToAdd > 0) {
      sb.append(value, length - charsToAdd, charsToAdd)
    }
    return StringBuilderCache.GetStringAndRelease(sb)
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static IsDigit(ch: string): boolean {
    if (ch.charCodeAt(0) < 128) {
      const diff = ch.charCodeAt(0) - '0'.charCodeAt(0)
      return diff <= 9 && diff >= 0
    }

    return (
      (CharacterUtils.GetUniCatFlags(ch) & UniCatFlags.DecimalDigitNumber) != 0
    )
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static IsFormatCh(ch: string): boolean {
    return (
      ch.charCodeAt(0) >= 128 &&
      (CharacterUtils.GetUniCatFlags(ch) & UniCatFlags.Format) != 0
    )
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static IsLatinAlpha(ch: string): boolean {
    return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static GetUniCatFlags(ch: string): UniCatFlags {
    return 1 << getUnicodeCategory(ch)
    // return (UniCatFlags)(1u << (int)CharUnicodeInfo.GetUnicodeCategory(ch));
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static IsSpace(ch: string): boolean {
    if (ch.charCodeAt(0) >= 128) {
      return (
        (CharacterUtils.GetUniCatFlags(ch) & UniCatFlags.SpaceSeparator) != 0
      )
    }
    switch (ch) {
      case ' ':
      // character tabulation
      case '\u0009':
      // line tabulation
      case '\u000B':
      // form feed
      case '\u000C':
        return true
    }

    return false
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static HasSpaces(str: string): boolean {
    const length = str.length

    for (let i = 0; i < length; i++) {
      if (CharacterUtils.IsSpace(str[i])) {
        return true
      }
    }

    return false
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  public static IsLineTerm(ch: string): boolean {
    switch (ch) {
      // line feed, unicode 0x000A
      case '\n':
      // carriage return, unicode 0x000D
      case '\r':
      // Unicode next line
      case '\u0085':
      // Unicode line separator
      case '\u2028':
      // Unicode paragraph separator
      case '\u2029':
        return true
    }

    return false
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  private static EstimateEscapedStringLength(length: number) {
    return Math.max((length * 112) / 100, length + 8)
  }

  private static InternalEscapeString(
    value: string,
    length: number,
    lengthForBuilder: number,
    sb: StringBuilder,
    finalizeBuilder: boolean
  ): [string, StringBuilder] {
    let charsToAdd = 0

    for (let i = 0; i < length; i++) {
      switch (value[i]) {
        case '\\':
          let rst = CharacterUtils.UpdateEscapeInternals(
            '\\\\',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '"':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\"',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case "'":
          rst = CharacterUtils.UpdateEscapeInternals(
            "\\'",
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\0':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\0',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\b':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\b',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\t':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\t',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\n':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\n',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\v':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\v',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\f':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\f',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\r':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\r',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\u0085':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\u0085',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\u2028':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\u2028',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        case '\u2029':
          rst = CharacterUtils.UpdateEscapeInternals(
            '\\u2029',
            value,
            lengthForBuilder,
            i,
            charsToAdd,
            sb
          )
          charsToAdd = rst[0]
          sb = rst[1]
          break
        default:
          charsToAdd++
          break
      }
    }

    // The original string wasn't modified.
    if (sb == null) {
      return [value, sb]
    }

    if (charsToAdd > 0) {
      sb.append(value, length - charsToAdd, charsToAdd)
    }

    return [
      finalizeBuilder ? StringBuilderCache.GetStringAndRelease(sb) : '',
      sb,
    ]
  }

  // [MethodImpl(MethodImplOptions.AggressiveInlining)]
  private static UpdateEscapeInternals(
    escapedValue: string,
    input: string,
    estimatedLength: number,
    currentPosition: number,
    charsToAdd: number,
    sb: StringBuilder
  ): [charsToAdd: number, sb: StringBuilder] {
    if (sb == null) {
      sb = StringBuilderCache.Acquire(estimatedLength)
      sb.append(input, 0, currentPosition)
      charsToAdd = 0
    } else if (charsToAdd > 0) {
      sb.append(input, currentPosition - charsToAdd, charsToAdd)
      charsToAdd = 0
    }

    sb.append(escapedValue)
    return [charsToAdd, sb]
  }

  // If a string is going to be inserted into a string which is then used as a format string, it needs to be escaped first
  // eg foo = string.Format("bad column name {0}", bar);
  // xyz = string.Format(foo, "hello");
  // This will die if bar is "{hmm}" for example, fix is to wrap bar with this function
  public static MakeSafeForFormatString(value: string): string {
    // Contracts.AssertNonEmpty(value);

    return value.replace('{', '{{').replace('}', '}}')
  }
}
