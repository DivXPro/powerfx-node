import { StringResources } from '../localization'
import TexlLexer from './TexlLexer'

export class LocalizationUtils {
  // The following properties/methods are referred to from JS (in Authoring mode) and should NOT be removed:
  // currentLocaleDot (intellisenseViewModel.js)
  // currentLocaleListSeparator (utility.js, testhooks.js)
  // currentLocaleDecimalSeparator (utility.js, testhooks.js)
  // currentLocaleChainingOperator (utility.js, testhooks.js)

  // references from TS code come via AuthoringCore.d.ts and that needs to be kept current with this file

  public static get CurrentLocaleDecimalSeparator(): string {
    // references from TS code come via AuthoringCore.d.ts and that needs to be kept current with this file
    return TexlLexer.LocalizedInstance.localizedPunctuatorDecimalSeparator
  }
  public static get CurrentLocaleListSeparator(): string {
    return TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator
  }
  public static get CurrentLocaleChainingOperator(): string {
    return TexlLexer.LocalizedInstance.localizedPunctuatorChainingSeparator
  }
  public static get CurrentLocalePositiveSymbol(): string {
    return TexlLexer.PunctuatorAdd
  }
  public static get CurrentLocaleNegativeSymbol(): string {
    return TexlLexer.PunctuatorSub
  }
  public static get CurrentLocaleMultiplySymbol(): string {
    return TexlLexer.PunctuatorMul
  }
  public static get CurrentLocaleDivideSymbol(): string {
    return TexlLexer.PunctuatorDiv
  }
  public static get CurrentLocaleEqual(): string {
    return TexlLexer.PunctuatorEqual
  }
  public static get CurrentLocaleParenOpen(): string {
    return TexlLexer.PunctuatorParenOpen
  }
  public static get CurrentLocaleParenClose(): string {
    return TexlLexer.PunctuatorParenClose
  }
  public static get CurrentLocaleBracketOpen(): string {
    return TexlLexer.PunctuatorBracketOpen
  }
  public static get CurrentLocaleBracketClose(): string {
    return TexlLexer.PunctuatorBracketClose
  }
  public static get CurrentLocaleCurlyOpen(): string {
    return TexlLexer.PunctuatorCurlyOpen
  }
  public static get CurrentLocaleCurlyClose(): string {
    return TexlLexer.PunctuatorCurlyClose
  }
  public static get CurrentLocalePercent(): string {
    return TexlLexer.PunctuatorPercent
  }
  public static get CurrentLocaleBang(): string {
    return TexlLexer.PunctuatorBang
  }
  public static get CurrentLocaleDot(): string {
    return TexlLexer.PunctuatorDot
  }
  public static get CurrentLocaleCaret(): string {
    return TexlLexer.PunctuatorCaret
  }
  public static get CurrentLocaleOr(): string {
    return TexlLexer.PunctuatorOr
  }
  public static get CurrentLocaleAnd(): string {
    return TexlLexer.PunctuatorAnd
  }
  public static get CurrentLocaleAmpersand(): string {
    return TexlLexer.PunctuatorAmpersand
  }
  public static get CurrentLocaleGreater(): string {
    return TexlLexer.PunctuatorGreater
  }
  public static get CurrentLocaleLess(): string {
    return TexlLexer.PunctuatorLess
  }
  public static get CurrentLocaleGreaterOrEqual(): string {
    return TexlLexer.PunctuatorGreaterOrEqual
  }
  public static get CurrentLocaleLessOrEqual(): string {
    return TexlLexer.PunctuatorLessOrEqual
  }
  public static get PunctuatorDotInvariant(): string {
    return TexlLexer.PunctuatorDot
  }

  public ComposeSingleQuotedList(listItems: string[]) {
    // Contracts.AssertValue(listItems);
    // Contracts.AssertNonEmpty(listItems);

    let singleQuoteFormat: string = StringResources.Get('ListItemSingleQuotedFormat')
    let listSeparator: string = LocalizationUtils.CurrentLocaleListSeparator + ' '
    return listItems.map((x) => x).join(listSeparator)
    // return string.Join(listSeparator, listItems.Select(item => string.Format(singleQuoteFormat, item)));
  }
}
