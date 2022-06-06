import { ErrorResourceKey } from '../localization/ErrorResourceKey'
import { ILanguageSettings } from '../localization/ILanguageSettings'
import { Span } from '../localization/Span'
import { TexlStrings } from '../localization/Strings'
import { DType } from '../types/DType'
import { CharacterUtils, hasFlag, isNullOrEmpty, isWhiteSpace, UniCatFlags } from '../utils/CharacterUtils'
import { CultureInfo } from '../utils/CultureInfo'
import { Dictionary } from '../utils/Dictionary'
import { DName } from '../utils/DName'
import { Stack } from '../utils/Stack'
import { StringBuilder } from '../utils/StringBuilder'
import { StringBuilderCache } from '../utils/StringBuilderCache'
import { CommentToken, EofToken, ErrorToken, IdentToken, IslandEndToken, IslandStartToken, Token } from './tokens'
import { KeyToken } from './tokens/KeyToken'
import { NumLitToken } from './tokens/NumLitToken'
import { ReplaceableToken } from './tokens/ReplaceableToken'
import { StrInterpEndToken } from './tokens/StrInterpEndToken'
import { StrInterpStartToken } from './tokens/StrInterpStartToken'
import { StrLitToken } from './tokens/StrLitToken'
import { TokKind } from './TokKind'
import { WhitespaceToken } from './WhitespaceToken'

export enum TexlLexerFlags {
  None,
  AllowReplaceableTokens = 1 << 0,
}

// TEXL expression lexer
export class TexlLexer {
  // List and decimal separators.
  // These are the global settings, borrowed from the OS, and will be settable by the user according to their preferences.
  // If there is a collision between the two, the list separator automatically becomes ;.
  public localizedPunctuatorDecimalSeparator: string
  public localizedPunctuatorListSeparator: string

  // The chaining operator has to be disambiguated accordingly.
  public localizedPunctuatorChainingSeparator: string

  // Locale-invariant syntax.
  public static readonly KeywordTrue = 'true'
  public static readonly KeywordFalse = 'false'
  public static readonly KeywordIn = 'in'
  public static readonly KeywordExactin = 'exactin'
  public static readonly KeywordSelf = 'Self'
  public static readonly KeywordParent = 'Parent'
  public static readonly KeywordAnd = 'And'
  public static readonly KeywordOr = 'Or'
  public static readonly KeywordNot = 'Not'
  public static readonly KeywordAs = 'As'
  public static readonly PunctuatorDecimalSeparatorInvariant = '.'
  public static readonly PunctuatorCommaInvariant = ','
  public static readonly PunctuatorSemicolonInvariant = ';'
  public static readonly PunctuatorAnd = '&&'
  public static readonly PunctuatorOr = '||'
  public static readonly PunctuatorDot = '.'
  public static readonly PunctuatorBang = '!'
  public static readonly PunctuatorAdd = '+'
  public static readonly PunctuatorSub = '-'
  public static readonly PunctuatorMul = '*'
  public static readonly PunctuatorDiv = '/'
  public static readonly PunctuatorCaret = '^'
  public static readonly PunctuatorAmpersand = '&'
  public static readonly PunctuatorPercent = '%'
  public static readonly PunctuatorEqual = '='
  public static readonly PunctuatorNotEqual = '<>'
  public static readonly PunctuatorGreater = '>'
  public static readonly PunctuatorGreaterOrEqual = '>='
  public static readonly PunctuatorLess = '<'
  public static readonly PunctuatorLessOrEqual = '<='
  public static readonly PunctuatorParenOpen = '('
  public static readonly PunctuatorParenClose = ')'
  public static readonly PunctuatorCurlyOpen = '{'
  public static readonly PunctuatorCurlyClose = '}'
  public static readonly PunctuatorBracketOpen = '['
  public static readonly PunctuatorBracketClose = ']'
  public static readonly PunctuatorColon = ':'
  public static readonly PunctuatorAt = '@'
  public static readonly IdentifierDelimiter = "'"
  public static readonly UnicodePrefix = 'U+'

  // These puntuators are related to commenting in the formula bar
  public static readonly PunctuatorBlockComment = '/*'
  public static readonly PunctuatorLineComment = '//'

  public static readonly LocalizedTokenDelimiterStr = '##'
  public static readonly ContextDependentTokenDelimiterStr = '%'
  public static readonly LocalizedTokenDelimiterChar = '#'
  public static readonly ContextDependentTokenDelimiterChar = '%'

  // Defaults and options for disambiguation
  private readonly PunctuatorCommaDefault = TexlLexer.PunctuatorCommaInvariant
  private readonly PunctuatorSemicolonDefault = TexlLexer.PunctuatorSemicolonInvariant
  private readonly PunctuatorSemicolonAlt1 = ';;'
  private readonly PunctuatorSemicolonAlt2 = TexlLexer.PunctuatorCommaInvariant

  // Thousands separators are not currently supported by the language (in any locale).
  private readonly _thousandSeparator = '\0'
  private readonly _keywords: Dictionary<string, TokKind>
  private readonly _punctuators: Dictionary<string, TokKind>
  private readonly _decimalSeparator: string

  public get thousandSeparator() {
    return this._thousandSeparator
  }

  public get keywords() {
    return this._keywords
  }

  public get punctuators() {
    return this._punctuators
  }

  public get decimalSeparator() {
    return this._decimalSeparator
  }

  // These are the decimal separators supported by the language in V1.
  // Unicode 00B7 represents mid-dot.
  // For anything else we'll fall back to invariant.
  private static readonly SupportedDecimalSeparators = '.,;`\u00b7'

  // Limits the StringBuilderCache TLS memory usage for LexerImpl.
  // Usually our tokens are less than 128 characters long, unless it's a large string.
  private static readonly DesiredStringBuilderSize = 128

  public culture: CultureInfo

  private _cache: [string, TexlLexerFlags, Token[]]

  // We store a list of cached Lexers, based on locale, so we can create new ones much more efficiently
  // In normal app usage we only have two locales anyway (null and the user's) but Tests use more
  // The Key to this dictionary is the CultureName
  private static _prebuiltLexers = new Dictionary<string, TexlLexer>()

  private static _lex: TexlLexer

  private _unaryOperatorKeywords: string[]
  private _binaryOperatorKeywords: string[]
  private _operatorKeywordsPrimitive: string[]
  private _operatorKeywordsAggregate: string[]
  private _constantKeywordsDefault: string[]
  private _constantKeywordsGetParent: string[]
  private _punctuatorsAndInvariants: Map<string, string>

  // Pretty Print defaults
  public readonly FourSpaces = '    '
  public readonly LineBreakAndfourSpaces = '\n    '

  // static TexlLexer() {
  //   StringBuilderCache.SetMaxBuilderSize(TexlLexer.DesiredStringBuilderSize)
  // }

  public static get LocalizedInstance() {
    if (TexlLexer._lex == null) {
      if (TexlLexer._lex == null) {
      }
      TexlLexer._lex = new TexlLexer()
    }

    return TexlLexer._lex
  }

  public static set LocalizedInstance(value: TexlLexer) {
    // Contracts.AssertValue(value);
    TexlLexer._lex = value
  }

  public static GetKeywordDictionary(): Array<string> {
    const strList = []

    const keywords = TexlLexer.LocalizedInstance._keywords

    for (const keyword of keywords.keys()) {
      strList.push(keyword)
    }

    return strList
  }

  // When loc is null, this creates a new lexer instance for the current locale & language settings.
  public static NewInstance(loc?: ILanguageSettings): TexlLexer {
    // Contracts.AssertValueOrNull(loc);

    if (loc != null) {
      let lexer: TexlLexer
      const result = this._prebuiltLexers.tryGetValue(loc.cultureName)
      lexer = result[1]
      if (result[0]) {
        // In the common case we can built a fresh Lexer based on an existing one using the same locale
        return new TexlLexer(lexer)
      }

      // Locale never seen before, so make a fresh Lexer the slow way
      lexer = new TexlLexer(loc)
      TexlLexer._prebuiltLexers.set(loc.cultureName, lexer)
      return lexer
    }

    return new TexlLexer(loc)
  }

  public static Reset() {
    TexlLexer._prebuiltLexers = new Dictionary<string, TexlLexer>()
  }

  // If we are passed an invalid culture, lets fallback to something safe
  private static CreateCultureInfo(locale: string): CultureInfo {
    try {
      return new CultureInfo(locale)
    } catch {
      return new CultureInfo('en-US')
    }
  }

  // Used to control the current locale for tests.
  public setLocale_TestOnly(loc: string) {
    // Contracts.AssertValue(loc);

    this.culture = TexlLexer.CreateCultureInfo(loc)
  }

  constructor(arg?: ILanguageSettings | TexlLexer) {
    if (arg instanceof TexlLexer) {
      const original = arg
      // Contracts.AssertValue(original);
      this.localizedPunctuatorDecimalSeparator = original.localizedPunctuatorDecimalSeparator
      this.localizedPunctuatorListSeparator = original.localizedPunctuatorListSeparator
      this.localizedPunctuatorChainingSeparator = original.localizedPunctuatorChainingSeparator

      this._thousandSeparator = original._thousandSeparator

      this._cache = null

      // Note that the following objects are NOT Cloned, they are the same as the originals, as they are never written to after initialization
      this._keywords = original._keywords
      this._punctuators = original._punctuators
      this._decimalSeparator = original._decimalSeparator
      this.culture = original.culture
    } else {
      const loc = arg
      // Contracts.AssertValueOrNull(loc);
      let fallBack = false
      if (loc != null) {
        // Use the punctuators specified by the given ILanguageSettings instance.
        // If any are missing, fall back to the default settings.
        let locDecSeparator: string
        let locListSeparator: string
        let locChainSeparator: string
        if (
          (locDecSeparator = loc.invariantToLocPunctuatorMap[TexlLexer.PunctuatorDecimalSeparatorInvariant]) == null ||
          (locListSeparator = loc.invariantToLocFunctionMap[TexlLexer.PunctuatorCommaInvariant]) == null ||
          (locChainSeparator = loc.invariantToLocFunctionMap[TexlLexer.PunctuatorSemicolonInvariant]) == null
        ) {
          locDecSeparator = ''
          locListSeparator = ''
          locChainSeparator = ''
          fallBack = true
        }
        // if (!loc.invariantToLocPunctuatorMap.tryGetValue(TexlLexer.PunctuatorDecimalSeparatorInvariant, out LocalizedPunctuatorDecimalSeparator) ||
        //     !loc.InvariantToLocPunctuatorMap.TryGetValue(PunctuatorCommaInvariant, out LocalizedPunctuatorListSeparator) ||
        //     !loc.InvariantToLocPunctuatorMap.TryGetValue(PunctuatorSemicolonInvariant, out LocalizedPunctuatorChainingSeparator))
        // {
        //     fallBack = true;
        // }
      }

      if (fallBack || loc == null) {
        // For V1 we'll pull the glob settings for the current language, and
        // we'll adjust the ones we can't support. For example, we won't be able to
        // support '(' for a decimal separator.
        this.culture = TexlLexer.CreateCultureInfo(loc != null ? loc.cultureName : CultureInfo.CurrentCulture.name)

        // List and decimal separators.
        // These are the default global settings. If there is a collision between the two,
        // the list separator automatically becomes ;.
        this.localizedPunctuatorDecimalSeparator = this.chooseDecimalSeparator(
          this.culture.numberFormat.numberDecimalSeparator,
        )
        this.localizedPunctuatorListSeparator = this.chooseCommaPunctuator(this.culture.textInfo.listSeparator)

        // The chaining operator has to be disambiguated accordingly.
        this.localizedPunctuatorChainingSeparator = this.chooseChainingPunctuator()
      } else {
        // Form a culture object suitable for parsing numerics.
        this.culture = TexlLexer.CreateCultureInfo(loc.cultureName)
      }

      // Tweak the culture so it respects the lexer's disambiguated separators.
      this.culture.numberFormat.numberDecimalSeparator = this.localizedPunctuatorDecimalSeparator
      this.culture.textInfo.listSeparator = this.localizedPunctuatorListSeparator

      // Only one-character strings are supported for the decimal separator.
      // Contracts.Assert(LocalizedPunctuatorDecimalSeparator.Length == 1);
      this._decimalSeparator = this.localizedPunctuatorDecimalSeparator[0]

      this._keywords = new Dictionary<string, TokKind>()
      this._punctuators = new Dictionary<string, TokKind>()
      this._cache = null

      // Punctuators
      this.addPunctuator(TexlLexer.PunctuatorOr, TokKind.Or)
      this.addPunctuator(TexlLexer.PunctuatorAnd, TokKind.And)
      this.addPunctuator(TexlLexer.PunctuatorBang, TokKind.Bang)
      this.addPunctuator(TexlLexer.PunctuatorAdd, TokKind.Add)
      this.addPunctuator(TexlLexer.PunctuatorSub, TokKind.Sub)
      this.addPunctuator(TexlLexer.PunctuatorMul, TokKind.Mul)
      this.addPunctuator(TexlLexer.PunctuatorDiv, TokKind.Div)
      this.addPunctuator(TexlLexer.PunctuatorCaret, TokKind.Caret)
      this.addPunctuator(TexlLexer.PunctuatorParenOpen, TokKind.ParenOpen)
      this.addPunctuator(TexlLexer.PunctuatorParenClose, TokKind.ParenClose)
      this.addPunctuator(TexlLexer.PunctuatorEqual, TokKind.Equ)
      this.addPunctuator(TexlLexer.PunctuatorLess, TokKind.Lss)
      this.addPunctuator(TexlLexer.PunctuatorLessOrEqual, TokKind.LssEqu)
      this.addPunctuator(TexlLexer.PunctuatorGreater, TokKind.Grt)
      this.addPunctuator(TexlLexer.PunctuatorGreaterOrEqual, TokKind.GrtEqu)
      this.addPunctuator(TexlLexer.PunctuatorNotEqual, TokKind.LssGrt)
      this.addPunctuator(this.localizedPunctuatorListSeparator, TokKind.Comma)
      this.addPunctuator(TexlLexer.PunctuatorDot, TokKind.Dot)
      this.addPunctuator(TexlLexer.PunctuatorColon, TokKind.Colon)
      this.addPunctuator(TexlLexer.PunctuatorCurlyOpen, TokKind.CurlyOpen)
      this.addPunctuator(TexlLexer.PunctuatorCurlyClose, TokKind.CurlyClose)
      this.addPunctuator(TexlLexer.PunctuatorBracketOpen, TokKind.BracketOpen)
      this.addPunctuator(TexlLexer.PunctuatorBracketClose, TokKind.BracketClose)
      this.addPunctuator(TexlLexer.PunctuatorAmpersand, TokKind.Ampersand)
      this.addPunctuator(TexlLexer.PunctuatorPercent, TokKind.PercentSign)
      this.addPunctuator(this.localizedPunctuatorChainingSeparator, TokKind.Semicolon)
      this.addPunctuator(TexlLexer.PunctuatorAt, TokKind.At)

      //Commenting punctuators
      this.addPunctuator(TexlLexer.PunctuatorBlockComment, TokKind.Comment)
      this.addPunctuator(TexlLexer.PunctuatorLineComment, TokKind.Comment)

      // Keywords
      this.addKeyword(TexlLexer.KeywordTrue, TokKind.True)
      this.addKeyword(TexlLexer.KeywordFalse, TokKind.False)
      this.addKeyword(TexlLexer.KeywordIn, TokKind.In)
      this.addKeyword(TexlLexer.KeywordExactin, TokKind.Exactin)
      this.addKeyword(TexlLexer.KeywordSelf, TokKind.Self)
      this.addKeyword(TexlLexer.KeywordParent, TokKind.Parent)
      this.addKeyword(TexlLexer.KeywordAnd, TokKind.KeyAnd)
      this.addKeyword(TexlLexer.KeywordOr, TokKind.KeyOr)
      this.addKeyword(TexlLexer.KeywordNot, TokKind.KeyNot)
      this.addKeyword(TexlLexer.KeywordAs, TokKind.As)
    }
    this.populateKeywordArrays()
  }

  private addKeyword(str: string, tid: TokKind) {
    // Contracts.AssertNonEmpty(str);
    this._keywords.set(str, tid)
  }

  private addPunctuator(str: string, tid: TokKind) {
    // Contracts.AssertNonEmpty(str);

    let tidCur: TokKind
    const result = this._punctuators.tryGetValue(str)
    tidCur = result[1]
    if (result[0]) {
      if (tidCur == tid) return true
      if (tidCur != TokKind.None) return false
    } else {
      // Map all prefixes (that aren't already mapped) to TokKind.None.
      for (let ich = 1; ich < str.length; ich++) {
        const strTmp = str.substr(0, ich)
        let tidTmp: TokKind
        const rst = this._punctuators.tryGetValue(strTmp)
        tidTmp = rst[1]
        if (!rst[0]) {
          this._punctuators.set(strTmp, TokKind.None)
        }
      }
    }
    this._punctuators.set(str, tid)
    return true
  }

  private populateKeywordArrays() {
    this._unaryOperatorKeywords = [TexlLexer.KeywordNot, TexlLexer.PunctuatorBang]

    this._binaryOperatorKeywords = [
      TexlLexer.PunctuatorAmpersand,
      TexlLexer.PunctuatorAnd,
      TexlLexer.PunctuatorOr,
      TexlLexer.PunctuatorAdd,
      TexlLexer.PunctuatorSub,
      TexlLexer.PunctuatorMul,
      TexlLexer.PunctuatorDiv,
      TexlLexer.PunctuatorEqual,
      TexlLexer.PunctuatorLess,
      TexlLexer.PunctuatorLessOrEqual,
      TexlLexer.PunctuatorGreater,
      TexlLexer.PunctuatorGreaterOrEqual,
      TexlLexer.PunctuatorNotEqual,
      TexlLexer.PunctuatorCaret,

      TexlLexer.KeywordAnd,
      TexlLexer.KeywordOr,
      TexlLexer.KeywordIn,
      TexlLexer.KeywordExactin,
      TexlLexer.KeywordAs,
    ]

    this._operatorKeywordsPrimitive = [
      TexlLexer.PunctuatorAmpersand,
      TexlLexer.PunctuatorEqual,
      TexlLexer.PunctuatorNotEqual,
      TexlLexer.PunctuatorAdd,
      TexlLexer.PunctuatorSub,
      TexlLexer.PunctuatorMul,
      TexlLexer.PunctuatorDiv,
      TexlLexer.PunctuatorCaret,
      TexlLexer.PunctuatorAnd,
      TexlLexer.PunctuatorOr,
      TexlLexer.PunctuatorLess,
      TexlLexer.PunctuatorLessOrEqual,
      TexlLexer.PunctuatorGreater,
      TexlLexer.PunctuatorGreaterOrEqual,

      TexlLexer.KeywordAnd,
      TexlLexer.KeywordOr,
      TexlLexer.KeywordIn,
      TexlLexer.KeywordExactin,
      TexlLexer.KeywordAs,
    ]

    this._operatorKeywordsAggregate = [TexlLexer.KeywordIn, TexlLexer.KeywordExactin, TexlLexer.KeywordAs]

    this._constantKeywordsDefault = [TexlLexer.KeywordFalse, TexlLexer.KeywordTrue, TexlLexer.KeywordSelf]

    this._constantKeywordsGetParent = [
      TexlLexer.KeywordFalse,
      TexlLexer.KeywordTrue,
      TexlLexer.KeywordParent,
      TexlLexer.KeywordSelf,
    ]

    this._punctuatorsAndInvariants = new Dictionary<string, string>([
      [this.localizedPunctuatorDecimalSeparator, '.'],
      [this.localizedPunctuatorListSeparator, ','],
      [this.localizedPunctuatorChainingSeparator, ';'],
    ])
  }

  public lexSource(text: string, flags: TexlLexerFlags = TexlLexerFlags.None): Token[] {
    // Contracts.AssertValue(text);

    // Check the cache
    const cacheCopy = this._cache
    if (cacheCopy != null) {
      // Contracts.AssertValue(cacheCopy.Item1);
      // Contracts.AssertValue(cacheCopy.Item3);

      // Cache hit
      if (text == cacheCopy[0] && flags == cacheCopy[1]) {
        return cacheCopy[2]
      }
    }

    // Cache miss
    const tokens: Token[] = []
    let sb: StringBuilder

    try {
      // This StringBuilder is used by the Lexer as a temporary storage for tokenized characters.
      sb = StringBuilderCache.Acquire(Math.min(text.length, TexlLexer.DesiredStringBuilderSize))
      let tok: Token
      const impl = new LexerImpl(this, text, sb, flags)
      while ((tok = impl.getNextToken()) != null) {
        tokens.push(tok)
      }
      tokens.push(impl.getEof())
    } finally {
      if (sb != null) StringBuilderCache.Release(sb)
    }

    // Update the cache and return the result
    const tokensArr = tokens
    this._cache = [text, flags, tokensArr]
    return tokensArr
  }

  public getTokens(text: string): Array<Token> {
    // Contracts.AssertValue(text);

    let tok: Token
    const impl = new LexerImpl(this, text, new StringBuilder(), TexlLexerFlags.None)
    const tokens: Array<Token> = []
    while ((tok = impl.getNextToken()) != null) {
      tokens.push(tok)
    }

    return tokens
  }

  public static RequiresWhiteSpace(tk: Token): boolean {
    let result: boolean
    switch (tk.Kind) {
      case TokKind.True:
      case TokKind.False:
      case TokKind.In:
      case TokKind.Exactin:
      case TokKind.Parent:
      case TokKind.KeyAnd:
      case TokKind.KeyNot:
      case TokKind.KeyOr:
      case TokKind.As:
        result = true
        break
      default:
        result = false
        break
    }
    return result
  }

  public getMinifiedScript(text: string, tokens: Array<Token>): string {
    // Contracts.AssertValue(text);
    // Contracts.AssertValue(tokens);

    const stringBuilder = new StringBuilder()

    for (const tk of tokens) {
      if (tk.kind == TokKind.Comment) stringBuilder.append(tk.Span.getFragment(text))
      else if (TexlLexer.RequiresWhiteSpace(tk)) stringBuilder.append(' ' + tk.Span.getFragment(text) + ' ')
      else {
        const tokenString = tk.Span.getFragment(text)
        const newString = tokenString.trim()

        stringBuilder.append(newString)
      }
    }

    const result = stringBuilder.toString()
    return result
  }

  public removeWhiteSpace(text: string): string {
    // Contracts.AssertValue(text);

    const tokens = this.getTokens(text)
    if (tokens.length == 1) return text

    const textLength = text.length
    const result = this.getMinifiedScript(text, tokens)

    return result
  }

  // Enumerate all supported unary operator keywords.
  public getUnaryOperatorKeywords() {
    return this._unaryOperatorKeywords
  }

  // Enumerate all supported binary operator keywords.
  public getBinaryOperatorKeywords() {
    return this._binaryOperatorKeywords
  }

  // Enumerate all supported keywords for the given type.
  // Review hekum - should we have leftType and right type seperately?
  public getOperatorKeywords(type: DType): string[] {
    // Contracts.Assert(type.IsValid);

    if (type.isPrimitive) {
      return this._operatorKeywordsPrimitive
    }

    // TASK 97994: Investigate and Implement the functionality if lhs of  'in' operator is a control type.
    if (type.isAggregate || type.isControl) {
      return this._operatorKeywordsAggregate
    }

    return []
  }

  // Enumerate all supported constant keywords.
  public getConstantKeywords(getParent: boolean) {
    return getParent ? this._constantKeywordsGetParent : this._constantKeywordsDefault
  }

  // Enumerate all supported localized punctuators and their invariant counterparts.
  public getPunctuatorsAndInvariants() {
    return this._punctuatorsAndInvariants
  }

  // Returns true and sets 'tid' if the specified string is a keyword.
  public isKeyword(str: string): [boolean, TokKind] {
    return this._keywords.tryGetValue(str)
  }

  // Returns true and set 'tid' if the specified string is a punctuator.
  // A tid of TokKind.None means it's a prefix of a valid punctuator, but isn't itself a valid punctuator.
  public tryGetPunctuator(str: string) {
    return this._punctuators.tryGetValue(str)
  }

  // Returns true if the specified string is a punctuator.
  public isPunctuator(str: string): boolean {
    // Contracts.AssertValue(str);

    return this._punctuators.has(str)
  }

  // Returns true if the specified character is valid as the first character of an identifier.
  // If an identifier contains any other characters, it has to be surrounded by single quotation marks.
  public static IsIdentStart(ch: string): boolean {
    if (ch.charCodeAt(0) >= 128) {
      return (CharacterUtils.GetUniCatFlags(ch) & UniCatFlags.IdentStartChar) != 0
    }

    return (
      (ch.charCodeAt(0) - 'a'.charCodeAt(0) < 26 && ch.charCodeAt(0) - 'a'.charCodeAt(0) >= 0) ||
      (ch.charCodeAt(0) - 'A'.charCodeAt(0) < 26 && ch.charCodeAt(0) - 'A'.charCodeAt(0) >= 0) ||
      ch == '_' ||
      ch == TexlLexer.IdentifierDelimiter ||
      ch == '$'
    )
  }

  // Returns true if the specified character is a valid simple identifier character.
  public static IsSimpleIdentCh(ch: string): boolean {
    if (ch.charCodeAt(0) >= 128) return (CharacterUtils.GetUniCatFlags(ch) & UniCatFlags.IdentPartChar) != 0
    return (
      (ch.charCodeAt(0) - 'a'.charCodeAt(0) < 26 && ch.charCodeAt(0) - 'a'.charCodeAt(0) >= 0) ||
      (ch.charCodeAt(0) - 'A'.charCodeAt(0) < 26 && ch.charCodeAt(0) - 'A'.charCodeAt(0) >= 0) ||
      (ch.charCodeAt(0) - '0'.charCodeAt(0) <= 9 && ch.charCodeAt(0) - '0'.charCodeAt(0) >= 0) ||
      ch == '_' ||
      ch == '$'
    )
  }

  // Returns true if the specified character constitutes a valid start for a numeric literal.
  public isNumStart(ch: string) {
    return CharacterUtils.IsDigit(ch) || ch == this._decimalSeparator
  }

  // Returns true if the specified character is the start/end identifier delimiter.
  public static IsIdentDelimiter(ch: string) {
    return ch == TexlLexer.IdentifierDelimiter
  }

  // Returns true if the specified character starts an interpolated string.
  public static IsInterpolatedStringStart(ch: string, nextCh: string) {
    return ch == '$' && nextCh == '"'
  }

  // Returns true if the specified character is an open curly bracket, used by interpolated strings.
  public static IsCurlyOpen(ch: string) {
    return ch == '{'
  }

  // Returns true if the specified character is an open curly bracket, used by interpolated strings.
  public static IsCurlyClose(ch: string) {
    return ch == '}'
  }

  // Returns true if the specified character is a valid string delimiter.
  public static IsStringDelimiter(ch: string) {
    return ch == '"'
  }

  // Returns true if the specified character is a new line character.
  public static IsNewLineCharacter(ch: string) {
    return ch == '\n'
  }

  // Returns true if the specified character is a valid context-dependent token delimiter - '%'.
  public static IsContextDependentTokenDelimiter(ch: string) {
    return ch == TexlLexer.ContextDependentTokenDelimiterChar
  }

  // Returns true if the next and current characters form the localizable token delimiter - '##'.
  public static IsLocalizableTokenDelimiter(ch: string, nextCh: string) {
    return ch == TexlLexer.LocalizedTokenDelimiterChar && nextCh == TexlLexer.LocalizedTokenDelimiterChar
  }

  // Takes a valid name and changes it to an identifier, escaping if needed.
  // public static EscapeName(name: DName): string
  // {
  //     // Contracts.Assert(name.IsValid);
  //     return TexlLexer.EscapeName(name.value);
  // }

  // Takes a valid name and changes it to an identifier, escaping if needed.
  public static EscapeName(name: string | DName, instance?: TexlLexer): string {
    if (name instanceof DName) {
      TexlLexer.EscapeName(name.value)
    } else {
      // Contracts.Assert(DName.IsValidDName(name));
      // Contracts.AssertValueOrNull(instance);

      instance = instance ?? TexlLexer.LocalizedInstance

      const nameLen = name.length
      // Contracts.Assert(nameLen > 0);

      let fEscaping = !TexlLexer.IsIdentStart(name[0]) || TexlLexer.IsIdentDelimiter(name[0])
      let fFirst = true

      let sb: StringBuilder

      try {
        sb = StringBuilderCache.Acquire(nameLen)

        for (let i = fEscaping ? 0 : 1; i < nameLen; i++) {
          const ch = name[i]
          fEscaping = fEscaping || !TexlLexer.IsSimpleIdentCh(ch)

          if (!fEscaping) continue

          if (fFirst) {
            sb.append(TexlLexer.IdentifierDelimiter)
            sb.append(name, 0, i)
            fFirst = false
          }

          if (ch == TexlLexer.IdentifierDelimiter) sb.append(ch)

          sb.append(ch)
        }

        if (fEscaping) {
          sb.append(TexlLexer.IdentifierDelimiter)
          return sb.toString()
        }

        let kind: TokKind
        const result = instance.isKeyword(name)
        kind = result[1]
        if (!result[0]) return name

        sb.length = 0
        sb.ensureCapacity(nameLen + 2)

        sb.append(TexlLexer.IdentifierDelimiter)
        sb.append(name)
        sb.append(TexlLexer.IdentifierDelimiter)

        return sb.toString()
      } finally {
        if (sb != null) StringBuilderCache.Release(sb)
      }
    }
  }

  // Takes an escaped string and returns the unescaped version.
  // For ex: 'ab''c' = ab'c
  public static UnescapeName(name: string): string {
    // Contracts.AssertValueOrNull(name);

    if (isNullOrEmpty(name)) return ''

    const len = name.length
    let sb: StringBuilder

    try {
      sb = StringBuilderCache.Acquire(len)

      for (let i = 0; i < name.length; i++) {
        const ch = name[i]

        if (ch != TexlLexer.IdentifierDelimiter) sb.append(ch)
        else {
          if (i == 0 || i == len - 1) continue

          if (name[i + 1] != TexlLexer.IdentifierDelimiter) continue

          sb.append(ch)
          i++
        }
      }

      return sb.toString()
    } finally {
      if (sb != null) StringBuilderCache.Release(sb)
    }
  }

  // Takes a name or an identifier and returns whether it can be a valid name and sets strNameValid to be the parsed name.
  // If the first non-space character in strIn is not a start delimiter then this is treated as a name.
  // Else if the first non-space character in strIn is the start delimiter this is treated as an identifier.
  public static TryNameOrIdentifierToName(strIn: string): [boolean, DName] {
    // Contracts.AssertValueOrNull(strIn);
    let name: DName
    if (isNullOrEmpty(strIn)) {
      name = null
      return [false, name]
    }

    // Find the first non space character.
    let sb: StringBuilder

    try {
      sb = StringBuilderCache.Acquire(strIn.length)

      let fIdent = false
      let fName = false
      let i
      for (i = 0; i < strIn.length; i++) {
        const ch = strIn[i]
        if (!CharacterUtils.IsSpace(ch)) {
          if (ch == TexlLexer.IdentifierDelimiter) {
            // skip the delimiter start.
            i++
            fIdent = true
            break
          }

          fName = true
          break
        }
      }
      if (fName) {
        // Parse as a name.
        let ichTrailingSpace = -1
        let iStart = i

        for (; i < strIn.length; i++) {
          const ch = strIn[i]
          if (!CharacterUtils.IsSpace(ch)) {
            ichTrailingSpace = -1
          } else if (ichTrailingSpace == -1) {
            ichTrailingSpace = i
          }
          sb.append(ch)
        }

        // Remove trailing spaces.
        if (ichTrailingSpace != -1) {
          sb.length = ichTrailingSpace - iStart
        }

        name = new DName(sb.toString())
        return [true, name]
      }
      if (!fIdent) {
        name = null
        return [false, name]
      }

      // Parse as an identifier.
      let fAllWhiteSpace = true
      let fHasEndDelimiter = false

      for (; i < strIn.length; i++) {
        const ch = strIn[i]
        if (ch == TexlLexer.IdentifierDelimiter) {
          i++
          if (i < strIn.length && strIn[i] == TexlLexer.IdentifierDelimiter) {
            // Escaped end delimiter
            fAllWhiteSpace = false
          } else {
            // end of identifier
            fHasEndDelimiter = true
            break
          }
        } else if (fAllWhiteSpace && !CharacterUtils.IsSpace(ch)) fAllWhiteSpace = false
        sb.append(ch)
      }

      if (fAllWhiteSpace || !fHasEndDelimiter) {
        name = null
        return [false, name]
      }

      // Check the remaining characters are white space.
      for (; i < strIn.length; i++) {
        if (!CharacterUtils.IsSpace(strIn[i])) {
          name = null
          return [false, name]
        }
      }

      name = new DName(sb.toString())
      return [true, name]
    } finally {
      if (sb != null) StringBuilderCache.Release(sb)
    }
  }

  // Choose an unambiguous decimal separator.
  private chooseDecimalSeparator(preferred: string): string {
    // Contracts.AssertNonEmpty(preferred);

    if (preferred.length == 1 && TexlLexer.SupportedDecimalSeparators.includes(preferred)) return preferred

    return TexlLexer.PunctuatorDecimalSeparatorInvariant
  }

  // Choose an unambiguous list separator.
  private chooseCommaPunctuator(preferred: string) {
    // Contracts.AssertNonEmpty(preferred);

    // We can't use the same punctuator, since that would cause an ambiguous grammar:
    //  Foo(1,23, 3,45) could represent two distinct things in a fr-FR locale:
    //      - either the equivalent of Foo(1.23, 3.45)
    //      - or the equivalent of Foo(1, 23, 3, 45)
    if (preferred != this.localizedPunctuatorDecimalSeparator) return preferred

    // Try to use PunctuatorCommaDefault, if possible.
    if (preferred != this.PunctuatorCommaDefault) return this.PunctuatorCommaDefault

    // Both use comma. Choose ; instead.
    return this.PunctuatorSemicolonDefault
  }

  // Choose an unambiguous chaining punctuator.
  private chooseChainingPunctuator(): string {
    // Contracts.Assert(LocalizedPunctuatorListSeparator != LocalizedPunctuatorDecimalSeparator);

    if (this.localizedPunctuatorDecimalSeparator != this.PunctuatorSemicolonDefault) {
      // Common case, for en-US: use the default chaining punctuator if possible.
      if (this.localizedPunctuatorListSeparator != this.PunctuatorSemicolonDefault)
        return this.PunctuatorSemicolonDefault
      // Use PunctuatorSemicolonAlt1 if possible.
      if (this.localizedPunctuatorDecimalSeparator != this.PunctuatorSemicolonAlt1) return this.PunctuatorSemicolonAlt1
      // Fallback
      return this.PunctuatorSemicolonAlt2
    }

    // The default punctuator is not available. Use the PunctuatorSemicolonAlt1 if possible.
    // Contracts.Assert(LocalizedPunctuatorDecimalSeparator == PunctuatorSemicolonDefault);
    if (this.localizedPunctuatorListSeparator != this.PunctuatorSemicolonAlt1) return this.PunctuatorSemicolonAlt1

    // Fallback
    return this.PunctuatorSemicolonAlt2
  }

  static ChoosePunctuators(loc: ILanguageSettings): { dec: string; comma: string; chaining: string } {
    const lexer = TexlLexer.NewInstance(loc)
    const dec = lexer.localizedPunctuatorDecimalSeparator
    const comma = lexer.localizedPunctuatorListSeparator
    const chaining = lexer.localizedPunctuatorChainingSeparator
    return {
      dec,
      comma,
      chaining,
    }
  }
}

// The Mode of the lexer, required because the behavior of the lexer changes
// when lexing inside of a String Interpolation, for example $"Hello {"World"}"
// has special lexing behavior.In theory, you could do this with just 2 modes,
// but we are using a 3rd mode, Island, to help keep track of when we need
// to produce IslandStart and IslandEnd tokens, which will be used by the
// Parser to correctly organize the string interpolation into a function call.
export enum LexerMode {
  Normal,
  Island,
  StringInterpolation,
}

export class LexerImpl {
  // The Mode of the lexer, required because the behavior of the lexer changes
  // when lexing inside of a String Interpolation, for example $"Hello {"World"}"
  // has special lexing behavior.In theory, you could do this with just 2 modes,
  // but we are using a 3rd mode, Island, to help keep track of when we need
  // to produce IslandStart and IslandEnd tokens, which will be used by the
  // Parser to correctly organize the string interpolation into a function call.

  private readonly _lex: TexlLexer
  private readonly _text: string
  private readonly _charCount: number
  private readonly _sb: StringBuilder // Used while building a token.
  private readonly _allowReplaceableTokens: boolean
  private readonly _modeStack: Stack<LexerMode>

  private _currentPos: number = 0 // Current position.
  private _currentTokenPos: number = 0 // The start of the current token.

  constructor(lex: TexlLexer, text: string, sb: StringBuilder, flags: TexlLexerFlags) {
    // Contracts.AssertValue(lex);
    // Contracts.AssertValue(text);
    // Contracts.AssertValue(sb);

    this._lex = lex
    this._text = text
    this._charCount = this._text.length
    this._sb = sb
    this._allowReplaceableTokens = hasFlag(flags, TexlLexerFlags.AllowReplaceableTokens)

    this._modeStack = new Stack<LexerMode>()
    this._modeStack.push(LexerMode.Normal)
  }

  // If the mode stack is empty, this is already an parse, use NormalMode as a default
  private get currentMode(): LexerMode {
    return this._modeStack.size() != 0 ? this._modeStack.peek() : LexerMode.Normal
  }

  private enterMode(newMode: LexerMode) {
    this._modeStack.push(newMode)
  }

  private exitMode() {
    this._modeStack.pop()
  }

  // Whether we've hit the end of input yet. If this returns true, ChCur will be zero.
  private get eof() {
    return this._currentPos >= this._charCount
  }

  // The current position.
  private get currentPos() {
    return this._currentPos
  }

  // The current character. Zero if we've hit the end of input.
  private get currentChar() {
    return this._currentPos < this._charCount ? this._text[this._currentPos] : '\0'
  }

  // Advance to the next character and returns it.
  private nextChar(): string {
    // Contracts.Assert(_currentPos < _charCount);

    if (++this._currentPos < this._charCount) {
      return this._text[this._currentPos]
    }
    this._currentPos = this._charCount
    return '\0'
  }

  // Return the ich character without advancing the current position.
  private peekChar(ich: number) {
    // Contracts.AssertIndexInclusive(ich, _text.Length - _currentPos);
    ich += this._currentPos
    return ich < this._charCount ? this._text[ich] : '\0'
  }

  // Return the token n away from the current position, and then
  // reset the lexer to the state it was when called
  private lookahead(n: number): Token {
    let lookaheadStart = this._currentPos
    let lookaheadTokenStart = this._currentTokenPos
    let foundTok: Token
    for (let i = 0; i <= n; i++) {
      if (this.eof) {
        foundTok = null
        break
      }
      foundTok = this.dispatch(true, true)
    }
    this._currentTokenPos = lookaheadTokenStart
    this._currentPos = lookaheadStart
    return foundTok
  }

  // Marks the beginning of the current token.
  private startToken() {
    this._currentTokenPos = this._currentPos
  }

  // Resets current read position to the beginning of the current token.
  private resetToken() {
    this._currentPos = this._currentTokenPos
  }

  private getTextSpan(): Span {
    return new Span(this._currentTokenPos, this._currentPos)
  }

  // Form and return the next token. Returns null to signal end of input.
  public getNextToken(): Token {
    for (;;) {
      if (this.eof) {
        return null
      }
      const tok: Token = this.dispatch(true, true)
      if (tok != null) {
        return tok
      }
    }
  }

  // Call once GetNextToken returns null if you need an Eof token.
  public getEof(): EofToken {
    // Contracts.Assert(Eof);

    return new EofToken(new Span(this._charCount, this._charCount))
  }

  /// <summary>
  /// Forms a new token.
  /// </summary>
  /// <param name="allowContextDependentTokens">Enables the <c>%text%</c> expression support.</param>
  /// <param name="allowLocalizableTokens">Enables the <c>##text##</c> expression support.</param>
  private dispatch(allowContextDependentTokens: boolean, allowLocalizableTokens: boolean): Token {
    this.startToken()
    const ch = this.currentChar
    const nextCh = this.peekChar(1)
    if (this.currentMode == LexerMode.Normal || this.currentMode == LexerMode.Island) {
      if (this.currentMode == LexerMode.Island && TexlLexer.IsCurlyClose(ch)) {
        // The LexerMode.Normal mode is pushed onto the mode stack every time the '{' character
        // appears within the body of an Island, for example when using the Table function inside
        // an interpolated string. If we are in the Island mode, it means that all the Normal
        // modes have been popped off, i.e. all the '{' inside the Island are paired with '}'
        // In that case just end the Island and resume parsing characters as string literals.
        return this.lexIslandEnd()
      }
      if (this._lex.isNumStart(ch)) {
        return this.lexNumLit()
      }
      if (TexlLexer.IsIdentStart(ch)) {
        return this.lexIdent()
      }
      if (TexlLexer.IsInterpolatedStringStart(ch, nextCh)) {
        return this.lexInterpolatedStringStart()
      }
      if (TexlLexer.IsStringDelimiter(ch)) {
        return this.lexStringLit()
      }
      if (CharacterUtils.IsSpace(ch) || CharacterUtils.IsLineTerm(ch)) {
        return this.lexSpace()
      }
      if (this._allowReplaceableTokens) {
        if (allowContextDependentTokens && TexlLexer.IsContextDependentTokenDelimiter(ch)) {
          return this.lexContextDependentTokenLit()
        }
        if (allowLocalizableTokens && TexlLexer.IsLocalizableTokenDelimiter(ch, nextCh)) {
          return this.lexLocalizableTokenLit()
        }
      }
      return this.lexOther()
    } else if (TexlLexer.IsStringDelimiter(ch) && !TexlLexer.IsStringDelimiter(nextCh)) {
      return this.lexInterpolatedStringEnd()
    } else if (TexlLexer.IsCurlyOpen(ch) && !TexlLexer.IsCurlyOpen(nextCh)) {
      return this.lexIslandStart()
    } else {
      return this.lexInterpolatedStringBody()
    }
  }

  private lexOther(): Token {
    let punctuatorLength = 0
    let tidPunc = TokKind.None

    this._sb.length = 0
    this._sb.append(this.currentChar)
    for (;;) {
      const str = this._sb.toString()
      let tidCur: TokKind
      const rst = this._lex.tryGetPunctuator(str)
      tidCur = rst[1]
      if (!rst[0]) break

      if (tidCur == TokKind.Comment) {
        tidPunc = tidCur
        punctuatorLength = this._sb.length

        return this.lexComment(this._sb.length)
      }

      if (tidCur != TokKind.None) {
        tidPunc = tidCur
        punctuatorLength = this._sb.length
      }
      this._sb.append(this.peekChar(this._sb.length))
    }
    if (punctuatorLength == 0) {
      return this.lexError()
    }
    while (--punctuatorLength >= 0) {
      this.nextChar()
    }

    if (tidPunc == TokKind.CurlyOpen) {
      this.enterMode(LexerMode.Normal)
    }
    if (tidPunc == TokKind.CurlyClose) {
      this.exitMode()
    }

    return new KeyToken(tidPunc, this.getTextSpan())
  }

  // Called to lex a numeric literal or a Dot token.
  private lexNumLit(): Token {
    // Contracts.Assert(CharacterUtils.IsDigit(CurrentChar) || CurrentChar == _lex._decimalSeparator);

    // A dot that is not followed by a digit is just a Dot.
    if (this.currentChar == this._lex.decimalSeparator && !CharacterUtils.IsDigit(this.peekChar(1))) {
      return this.lexOther()
    }
    // Decimal literal (possible floating point).
    return this.lexDecLit()
  }

  // Lex a decimal (double) literal.
  private lexDecLit(): Token {
    // Contracts.Assert(CharacterUtils.IsDigit(CurrentChar) || (CurrentChar == _lex._decimalSeparator && CharacterUtils.IsDigit(PeekChar(1))));

    let hasDot = false
    let isCorrect = true

    this._sb.length = 0
    if (this.currentChar == this._lex.decimalSeparator) {
      // Contracts.Assert(CharacterUtils.IsDigit(PeekChar(1)));
      hasDot = true
    }

    this._sb.append(this.currentChar)
    for (;;) {
      if (this.nextChar() == this._lex.decimalSeparator) {
        if (hasDot) {
          isCorrect = false
          break
        }
        hasDot = true
        this._sb.append(this.currentChar)
      } else {
        if (!CharacterUtils.IsDigit(this.currentChar)) {
          // TASK: 69508: Globalization: Thousand separator code is disabled.
          if (
            this.currentChar != this._lex.thousandSeparator ||
            this._lex.thousandSeparator == '\0' ||
            !CharacterUtils.IsDigit(this.peekChar(1))
          ) {
            break
          }
          this.nextChar()
        }
        // Push leading zeros as well. All digits are important.
        // We'll let the framework deal with the specifics internally.
        this._sb.append(this.currentChar)
      }
    }
    // Check for an exponent.
    if (this.currentChar == 'e' || this.currentChar == 'E') {
      const chTmp = this.peekChar(1)
      if (CharacterUtils.IsDigit(chTmp) || (this.isSign(chTmp) && CharacterUtils.IsDigit(this.peekChar(2)))) {
        this._sb.append(this.currentChar)
        this.nextChar() // Skip the e.
        if (this.isSign(chTmp)) {
          this._sb.append(chTmp)
          this.nextChar() // Skip the sign
        }

        do {
          this._sb.append(this.currentChar)
        } while (CharacterUtils.IsDigit(this.nextChar()))
      }
    }

    // Parsing in the current culture, to allow the CLR to correctly parse non-arabic numerals.
    const value = parseFloat(this._sb.toString())

    if (isNaN(value) || !isFinite(value)) {
      return isCorrect
        ? new ErrorToken(this.getTextSpan(), TexlStrings.ErrNumberTooLarge)
        : new ErrorToken(this.getTextSpan())
    }
    // if (!double.TryParse(this._sb.toString(), NumberStyles.Float, this._lex.culture, out value) || double.IsNaN(value) || double.IsInfinity(value))
    // {
    //     return isCorrect ?
    //         new ErrorToken(this.getTextSpan(), TexlStrings.ErrNumberTooLarge) :
    //         new ErrorToken(this.getTextSpan());
    // }
    return new NumLitToken(value, this.getTextSpan())
  }

  private isSign(ch: string): boolean {
    return ch == TexlLexer.PunctuatorAdd[0] || ch == TexlLexer.PunctuatorSub[0]
  }

  // Lex an identifier.
  // If this code changes, NameValidation will probably have to change as well.
  private lexIdent(): Token {
    const rst = this.lexIdentCore()
    const str = rst[0]
    const fDelimiterStart = rst[1].fDelimiterStart
    const fDelimiterEnd = rst[1].fDelimiterEnd
    let tid: TokKind
    let spanTok: Span = this.getTextSpan()

    // Only lex a keyword if the identifier didn't start with a delimiter.
    const isKeywordRst = this._lex.isKeyword(str)
    tid = isKeywordRst[1]
    if (isKeywordRst[0] && !fDelimiterStart) {
      // Lookahead to distinguish Keyword "and/or/not" from Function "and/or/not"
      if (
        (tid == TokKind.KeyAnd || tid == TokKind.KeyOr || tid == TokKind.KeyNot) &&
        this.lookahead(0)?.kind == TokKind.ParenOpen
      ) {
        return new IdentToken(str, spanTok, fDelimiterStart, fDelimiterEnd)
      }

      return new KeyToken(tid, spanTok)
    }

    return new IdentToken(str, spanTok, fDelimiterStart, fDelimiterEnd)
  }

  // Core functionality for lexing an identifier.
  private lexIdentCore(): [string, { fDelimiterStart: boolean; fDelimiterEnd: boolean }] {
    // Contracts.Assert(IsIdentStart(CurrentChar));

    this._sb.length = 0
    let fDelimiterStart = TexlLexer.IsIdentDelimiter(this.currentChar)
    let fDelimiterEnd = false

    if (!fDelimiterStart) {
      // Simple identifier.
      while (TexlLexer.IsSimpleIdentCh(this.currentChar)) {
        this._sb.append(this.currentChar)
        this.nextChar()
      }

      return [this._sb.toString(), { fDelimiterStart, fDelimiterEnd }]
    }

    // Delimited identifier.
    this.nextChar()
    let ichStrMin = this._currentPos

    // Accept any characters up to the next unescaped identifier delimiter.
    // String will be corrected in the IdentToken if needed.
    for (;;) {
      if (this.eof) break
      if (TexlLexer.IsIdentDelimiter(this.currentChar)) {
        if (TexlLexer.IsIdentDelimiter(this.peekChar(1))) {
          // Escaped delimiter.
          this._sb.append(this.currentChar)
          this.nextChar()
          this.nextChar()
        } else {
          // End of the identifier.
          this.nextChar()
          fDelimiterEnd = true
          break
        }
      } else if (TexlLexer.IsNewLineCharacter(this.currentChar)) {
        // Terminate an identifier on a new line character
        // Don't include the new line in the identifier
        fDelimiterEnd = false
        break
      } else {
        this._sb.append(this.currentChar)
        this.nextChar()
      }
    }

    return [this._sb.toString(), { fDelimiterStart, fDelimiterEnd }]
  }

  // Lex a string.
  private lexStringLit(): Token {
    // Contracts.Assert(IsStringDelimiter(CurrentChar));

    this._sb.length = 0

    let chDelim = this.currentChar
    while (!this.eof) {
      let ch = this.nextChar()
      if (ch == chDelim) {
        let nextCh: string
        if (this.eof || CharacterUtils.IsLineTerm((nextCh = this.peekChar(1))) || nextCh != chDelim) break
        // If we are here, we are seeing a double quote followed immediately by another
        // double quote. That is actually an escape sequence for double quote characters
        // within a string literal. Excel supports the exact same escape sequence.
        // We want to include these characters in the string literal, and keep lexing.
        this._sb.append(ch)
        this.nextChar()
      } else if (!CharacterUtils.IsFormatCh(ch)) this._sb.append(ch)
    }

    if (this.eof) return new ErrorToken(this.getTextSpan())
    this.nextChar()
    return new StrLitToken(this._sb.toString(), this.getTextSpan())
  }

  // Lex an interpolated string body start.
  private lexInterpolatedStringStart(): Token {
    // Contracts.Assert(IsInterpolatedStringStart(CurrentChar, PeekChar(1)));

    this.nextChar()
    this.nextChar()
    this.enterMode(LexerMode.StringInterpolation)

    return new StrInterpStartToken(this.getTextSpan())
  }

  // Lex an interpolated string body end.
  private lexInterpolatedStringEnd(): Token {
    // Contracts.Assert(IsStringDelimiter(CurrentChar));

    this.nextChar()
    this.exitMode()

    return new StrInterpEndToken(this.getTextSpan())
  }

  // Lex an interpolated string island start.
  private lexIslandStart(): Token {
    // Contracts.Assert(IsCurlyOpen(CurrentChar));

    this.nextChar()
    this.enterMode(LexerMode.Island)

    return new IslandStartToken(this.getTextSpan())
  }

  // Lex an interpolated string island end.
  private lexIslandEnd(): Token {
    // Contracts.Assert(IsCurlyClose(CurrentChar));

    this.nextChar()
    this.exitMode()

    return new IslandEndToken(this.getTextSpan())
  }

  // Lex a interpolated string body.
  private lexInterpolatedStringBody(): Token {
    this._sb.length = 0

    do {
      let ch = this.currentChar

      if (TexlLexer.IsStringDelimiter(ch)) {
        let nextCh: string
        if (
          this.eof ||
          CharacterUtils.IsLineTerm((nextCh = this.peekChar(1))) ||
          !TexlLexer.IsStringDelimiter(nextCh)
        ) {
          // Interpolated string end, do not call NextChar()
          if (this.eof) return new ErrorToken(this.getTextSpan())
          return new StrLitToken(this._sb.toString(), this.getTextSpan())
        }
        // If we are here, we are seeing a double quote followed immediately by another
        // double quote. That is an escape sequence for double quote characters.
        this._sb.append(ch)
        this.nextChar()
      } else if (TexlLexer.IsCurlyOpen(ch)) {
        let nextCh: string
        if (this.eof || CharacterUtils.IsLineTerm((nextCh = this.peekChar(1))) || !TexlLexer.IsCurlyOpen(nextCh)) {
          // Island start, do not call NextChar()
          if (this.eof) return new ErrorToken(this.getTextSpan())
          return new StrLitToken(this._sb.toString(), this.getTextSpan())
        }
        // If we are here, we are seeing a open curly followed immediately by another
        // open curly. That is an escape sequence for open curly characters.
        this._sb.append(ch)
        this.nextChar()
      } else if (TexlLexer.IsCurlyClose(ch)) {
        let nextCh: string
        if (this.eof || CharacterUtils.IsLineTerm((nextCh = this.peekChar(1))) || !TexlLexer.IsCurlyClose(nextCh)) {
          const res = new ErrorToken(this.getTextSpan())
          this.nextChar()
          return res
        }
        // If we are here, we are seeing a close curly followed immediately by another
        // close curly. That is an escape sequence for close curly characters.
        this._sb.append(ch)
        this.nextChar()
      } else if (!CharacterUtils.IsFormatCh(ch)) this._sb.append(ch)

      this.nextChar()
    } while (!this.eof)

    return new ErrorToken(this.getTextSpan())
  }

  // Lex a sequence of spacing characters.
  private lexSpace(): Token {
    // Contracts.Assert(CharacterUtils.IsSpace(CurrentChar) || CharacterUtils.IsLineTerm(CurrentChar));

    this._sb.length = 0
    while (CharacterUtils.IsSpace(this.nextChar()) || CharacterUtils.IsLineTerm(this.currentChar)) {
      this._sb.append(this.currentChar)
    }
    return new WhitespaceToken(this._sb.toString(), this.getTextSpan())
  }

  private lexComment(commentLength: number): Token {
    this._sb.length = 0
    this._sb.append(this.currentChar)
    for (let i = 1; i < commentLength; i++) this._sb.append(this.nextChar())

    // Contracts.Assert(_sb.ToString().Equals("/*") || _sb.ToString().Equals("//"));
    let commentEnd: string = this._sb.toString().startsWith('/*') ? '*/' : '\n'

    // Comment initiation takes up two chars, so must - 1 to get start
    let startingPosition = this._currentPos - 1

    while (this._currentPos < this._text.length) {
      this._sb.append(this.nextChar())
      let str = this._sb.toString()
      // "str.Length >= commentLength + commentEnd.Length"  ensures block comment of "/*/"
      // does not satisfy starts with "/*" and ends with "*/" conditions

      if (str.endsWith(commentEnd) && str.length >= commentLength + commentEnd.length) break
    }

    // Trailing comment space
    while (this._currentPos < this._text.length) {
      let nxtChar = this.nextChar()
      // If nxtChar is not whitespace, no need to handle trailing whitespace
      if (!isWhiteSpace(nxtChar) || commentEnd !== '*/') {
        break
      }
      // if (!char.IsWhiteSpace(nxtChar) || commentEnd != "*/")
      //     break;

      // Handle/Preserve trailing white space and line breaks for block comments
      if (TexlLexer.IsNewLineCharacter(nxtChar)) {
        this._sb.append(nxtChar)
        ++this._currentPos
        break
      }
    }

    // Preceding,
    while (startingPosition > 0) {
      let previousChar = this._text[startingPosition - 1]
      if (!isWhiteSpace(previousChar)) break
      if (TexlLexer.IsNewLineCharacter(previousChar)) {
        this._sb.insert(0, previousChar)
        this._currentTokenPos = --startingPosition
        break
      }

      startingPosition--
    }

    let commentToken = new CommentToken(this._sb.toString(), this.getTextSpan())
    if (this._sb.toString().trim().startsWith('/*') && !this._sb.toString().trim().endsWith('*/'))
      commentToken.isOpenBlock = true

    return commentToken
  }

  // Lex a context-dependent token, wrapped with '%'.
  private lexContextDependentTokenLit(): Token {
    // Minimum non-empty block length.
    const minStringLength = 3

    let ch = this.currentChar
    // Contracts.Assert(IsContextDependentTokenDelimiter(ch));

    this._sb.length = 0
    this._sb.append(TexlLexer.ContextDependentTokenDelimiterChar)

    while (!this.eof) {
      ch = this.nextChar()

      if (TexlLexer.IsContextDependentTokenDelimiter(ch)) {
        this._sb.append(TexlLexer.ContextDependentTokenDelimiterChar)
        break
      }

      if (!CharacterUtils.IsFormatCh(ch)) this._sb.append(ch)
    }

    if (this.eof || this._sb.length < minStringLength) {
      this.resetToken()
      return this.dispatch(false, true)
    }

    this.nextChar()
    return new ReplaceableToken(this._sb.toString(), this.getTextSpan())
  }

  // Lex a localizable token, wrapped with '##'.
  private lexLocalizableTokenLit(): Token {
    // Minimum non-empty block length.
    const minStringLength = 5

    let ch = this.currentChar
    let nextCh = this.eof ? '\0' : this.nextChar()
    // Contracts.Assert(IsLocalizableTokenDelimiter(ch, nextCh));

    this._sb.length = 0
    this._sb.append(TexlLexer.LocalizedTokenDelimiterStr)

    while (!this.eof) {
      ch = this.nextChar()
      nextCh = this.eof ? '\0' : this.peekChar(1)

      if (TexlLexer.IsLocalizableTokenDelimiter(ch, nextCh)) {
        // Make sure to move past the character we peeked before.
        this.nextChar()

        this._sb.append(TexlLexer.LocalizedTokenDelimiterStr)
        break
      }

      if (!CharacterUtils.IsFormatCh(ch)) this._sb.append(ch)
    }

    if (this.eof || this._sb.length < minStringLength) {
      this.resetToken()
      return this.dispatch(true, false)
    }

    this.nextChar()
    return new ReplaceableToken(this._sb.toString(), this.getTextSpan())
  }

  // Returns specialized token for unexpected character errors.
  private lexError(errorResourceKey: ErrorResourceKey = TexlStrings.UnexpectedCharacterToken): Token {
    if (this.currentChar.charCodeAt(0) > 255) {
      let position = this._currentPos
      let unexpectedChar = this.currentChar.charCodeAt(0).toString(16).padStart(4, '0')
      // let unexpectedChar = Convert.ToUInt16(CurrentChar).ToString("X4");
      this.nextChar()
      return new ErrorToken(
        this.getTextSpan(),
        TexlStrings.UnexpectedCharacterToken,
        TexlLexer.UnicodePrefix + unexpectedChar,
        position,
      )
    } else {
      this.nextChar()
      return new ErrorToken(this.getTextSpan())
    }
  }
}

export default TexlLexer
