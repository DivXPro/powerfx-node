import { DPath } from '../../utils'
import { TexlFunction } from '../../functions/TexlFunction'
import TexlLexer from '../../lexer/TexlLexer'
import { TexlStrings } from '../../localization'
import { DType, EnumConstants, EnumSymbol } from '../../types'
import Dictionary from '../../utils/typescriptNet/Collections/Dictionaries/Dictionary'
import { Action } from '../../utils/typescriptNet/FunctionTypes'
import KeyValuePair from '../../utils/typescriptNet/KeyValuePair'
import Lazy from '../../utils/typescriptNet/Lazy'
import { Types } from '../../utils/TypeUtils'
import { IntellisenseHelper } from './IntellisenseHelper'

declare type GetArgumentSuggestionsDelegate = (
  tryGetEnumSymbol: TryGetEnumSymbol,
  suggestUnqualifiedName: boolean,
  scopeType: DType,
  argumentIndex: number,
) => [KeyValuePair<string, DType>[], boolean]
declare type GetArgumentSuggestionsDelegateWithoutEnum = (
  scopeType: DType,
  argumentIndex: number,
) => [KeyValuePair<string, DType>[], boolean]
declare type TryGetEnumSymbol = (symbolName: string) => [boolean, EnumSymbol]

export class ArgumentSuggestions {
  // public delegate IEnumerable<KeyValuePair<string, DType >> GetArgumentSuggestionsDelegate(TryGetEnumSymbol tryGetEnumSymbol, boolean suggestUnqualifiedName, DType scopeType, number argumentIndex, out boolean requiresSuggestionEscaping);
  // private delegate IEnumerable < KeyValuePair < string, DType >> GetArgumentSuggestionsDelegateWithoutEnum(DType scopeType, number argumentIndex, out boolean requiresSuggestionEscaping);
  // public delegate boolean TryGetEnumSymbol(string symbolName, out EnumSymbol symbol);

  // public static readonly CustomFunctionSuggestionProviders =
  //   new Lazy<Dictionary<Type, GetArgumentSuggestionsDelegate>>(
  //     () => new Dictionary < Type, GetArgumentSuggestionsDelegate >
  //   {
  //     { typeof(DateDiffFunction), TimeUnitSuggestions },
  //     { typeof(DateAddFunction), TimeUnitSuggestions },
  //     { typeof(DateValueFunction), LanguageCodeSuggestion },
  //     { typeof(TimeValueFunction), LanguageCodeSuggestion },
  //     { typeof(DateTimeValueFunction), LanguageCodeSuggestion },
  //     { typeof(IfFunction), IfSuggestions },
  //     { typeof(EndsWithFunction), DiscardEnumParam(StringTypeSuggestions) },
  //     { typeof(SplitFunction), DiscardEnumParam(StringTypeSuggestions) },
  //     { typeof(StartsWithFunction), DiscardEnumParam(StringTypeSuggestions) },
  //     { typeof(TextFunction), TextSuggestions },
  //     { typeof(ValueFunction), LanguageCodeSuggestion },
  //             }, isThreadSafe: true);

  public static get CustomFunctionSuggestionProviders(): Dictionary<string, GetArgumentSuggestionsDelegate> {
    let dic = new Dictionary<string, GetArgumentSuggestionsDelegate>()
    dic.addByKeyValue('DateDiffFunction', this.TimeUnitSuggestions)
    dic.addByKeyValue('DateAddFunction', this.TimeUnitSuggestions)
    dic.addByKeyValue('DateValueFunction', this.LanguageCodeSuggestion)
    dic.addByKeyValue('TimeValueFunction', this.LanguageCodeSuggestion)
    dic.addByKeyValue('DateTimeValueFunction', this.LanguageCodeSuggestion)
    dic.addByKeyValue('IfFunction', this.IfSuggestions)
    dic.addByKeyValue('EndsWithFunction', this.DiscardEnumParam(this.StringTypeSuggestions))
    dic.addByKeyValue('SplitFunction', this.DiscardEnumParam(this.StringTypeSuggestions))
    dic.addByKeyValue('StartsWithFunction', this.DiscardEnumParam(this.StringTypeSuggestions))
    dic.addByKeyValue('TextFunction', this.TextSuggestions)
    dic.addByKeyValue('ValueFunction', this.LanguageCodeSuggestion)
    return dic
  }

  // public static readonly CustomFunctionSuggestionProviders =
  //   new Lazy<Dictionary<Type, GetArgumentSuggestionsDelegate>>(
  //     () => new Dictionary < Type, GetArgumentSuggestionsDelegate >
  //   {
  // { typeof(DateDiffFunction), TimeUnitSuggestions },
  // { typeof(DateAddFunction), TimeUnitSuggestions },
  // { typeof(DateValueFunction), LanguageCodeSuggestion },
  // { typeof(TimeValueFunction), LanguageCodeSuggestion },
  // { typeof(DateTimeValueFunction), LanguageCodeSuggestion },
  // { typeof(IfFunction), IfSuggestions },
  // { typeof(EndsWithFunction), DiscardEnumParam(StringTypeSuggestions) },
  // { typeof(SplitFunction), DiscardEnumParam(StringTypeSuggestions) },
  // { typeof(StartsWithFunction), DiscardEnumParam(StringTypeSuggestions) },
  // { typeof(TextFunction), TextSuggestions },
  // { typeof(ValueFunction), LanguageCodeSuggestion },
  //         }, isThreadSafe: true);

  public static GetArgumentSuggestions(
    tryGetEnumSymbol: TryGetEnumSymbol,
    suggestUnqualifiedEnums: boolean,
    func: TexlFunction,
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    let requiresSuggestionEscaping: boolean
    // let tryGetRes = ArgumentSuggestions.CustomFunctionSuggestionProviders.tryGetValue(func.GetType());

    let suggestor = ArgumentSuggestions.CustomFunctionSuggestionProviders.getValue(Types.getType(func))
    if (suggestor !== undefined) {
      return suggestor(tryGetEnumSymbol, suggestUnqualifiedEnums, scopeType, argumentIndex)
      // return true
    }
    // return false
    // if (ArgumentSuggestions.CustomFunctionSuggestionProviders.tryGetValue(func.GetType(),suggestor)) {
    //     return suggestor(tryGetEnumSymbol, suggestUnqualifiedEnums, scopeType, argumentIndex);//, out requiresSuggestionEscaping
    //   }
    requiresSuggestionEscaping = false
    return [[], requiresSuggestionEscaping]
  }

  public static TestOnly_AddFunctionHandler(func: TexlFunction, suggestor: GetArgumentSuggestionsDelegate): void {
    ArgumentSuggestions.CustomFunctionSuggestionProviders.addByKeyValue(Types.getType(func), suggestor)
  }

  private static DiscardEnumParam(
    suggestor: GetArgumentSuggestionsDelegateWithoutEnum,
  ): GetArgumentSuggestionsDelegate {
    return (
      tryGetEnumSymbol: TryGetEnumSymbol,
      suggestUnqualifedEnums: boolean,
      scopeType: DType,
      argumentIndex: number,
    ) => suggestor(scopeType, argumentIndex)
  }

  /// <summary>
  /// This method returns the suggestions for second and third arguments of the Text function.
  /// </summary>
  /// <param name="tryGetEnumSymbol">
  /// Getter for enum symbols intended for the suggestions
  /// </param>
  /// <param name="suggestUnescapedEnums">
  /// Whether to suggest unescaped enums
  /// </param>
  /// <param name="scopeType">
  /// Type of the enclosing scope from where intellisense is run
  /// </param>
  /// <param name="argumentIndex">
  /// The current index of the argument from where intellisense is run
  /// </param>
  /// <param name="requiresSuggestionEscaping">
  /// Set to whether the argument needs to be string escaped
  /// </param>
  /// <returns>
  /// Enumerable of suggestions wherein the key is the suggestion text and the value is its type
  /// </returns>
  private static TextSuggestions(
    tryGetEnumSymbol: TryGetEnumSymbol,
    suggestUnescapedEnums: boolean,
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    // Contracts.Assert(scopeType.IsValid);
    // Contracts.Assert(0 <= argumentIndex);

    let requiresSuggestionEscaping: boolean

    requiresSuggestionEscaping = true

    if (argumentIndex != 1 && argumentIndex != 2) {
      return [[], requiresSuggestionEscaping] //EnumerableUtils.Yield<KeyValuePair<string, DType>>();
    }

    if (argumentIndex == 1) {
      let tryGetEnumSymbolRes = tryGetEnumSymbol(EnumConstants.DateTimeFormatEnumString)
      let enumInfo = tryGetEnumSymbolRes[1]
      if (!DType.DateTime.accepts(scopeType) || !tryGetEnumSymbolRes[0]) {
        return [[], requiresSuggestionEscaping] // EnumerableUtils.Yield<KeyValuePair<string, DType>>();
      }

      var retVal: KeyValuePair<string, DType>[] // = new List<KeyValuePair<string, DType>>();
      // Contracts.AssertValue(enumInfo);

      requiresSuggestionEscaping = false
      for (let name of enumInfo.enumType.getNames(DPath.Root)) {
        let locName: string = enumInfo.tryGetLocValueName(name.name.value)[1] //, out locName).Verify();
        retVal.push({
          key: TexlLexer.EscapeName(enumInfo.name) + TexlLexer.PunctuatorDot + TexlLexer.EscapeName(locName),
          value: name.type,
        })
      }

      return [retVal, requiresSuggestionEscaping]
    } else {
      // Contracts.Assert(argumentIndex == 2);

      requiresSuggestionEscaping = false
      return [ArgumentSuggestions.GetLanguageCodeSuggestions(), requiresSuggestionEscaping]
    }
  }

  /// <summary>
  /// Cached list of language code suggestions
  /// </summary>
  private static _languageCodeSuggestions: KeyValuePair<string, DType>[]

  /// <summary>
  /// Initializes or retrieves from the cache <see cref="_languageCodeSuggestions"/>
  /// </summary>
  /// <returns>
  /// List of language code suggestions
  /// </returns>
  public static GetLanguageCodeSuggestions(): KeyValuePair<string, DType>[] {
    if (this._languageCodeSuggestions === null) {
      //Interlocked.CompareExchange：比较两个指定的引用类型的实例 T 是否相等，如果相等，则替换第一个。
      // Interlocked.CompareExchange(
      //   ref _languageCodeSuggestions,
      //   TexlStrings.SupportedDateTimeLanguageCodes(null).Split(new [] { ',' }).Select(locale => new KeyValuePair<string, DType>(locale, DType.String)),
      //   null);
      this._languageCodeSuggestions = TexlStrings.SupportedDateTimeLanguageCodes(null)
        .split(',')
        .map((locale) => <KeyValuePair<string, DType>>{ key: locale, value: DType.String })
    }

    return this._languageCodeSuggestions
  }

  private static StringTypeSuggestions(
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    //, out boolean requiresSuggestionEscaping)
    // Contracts.AssertValid(scopeType);
    // Contracts.Assert(0 <= argumentIndex);

    let requiresSuggestionEscaping = true

    if (argumentIndex == 0)
      return [IntellisenseHelper.GetSuggestionsFromType(scopeType, DType.String), requiresSuggestionEscaping]

    return [[], requiresSuggestionEscaping] // EnumerableUtils.Yield<KeyValuePair<string, DType>>();
  }

  private static TimeUnitSuggestions(
    tryGetEnumSymbol: TryGetEnumSymbol,
    suggestUnqualifedEnums: boolean,
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    //, out boolean requiresSuggestionEscaping)
    // Contracts.Assert(scopeType.IsValid);
    // Contracts.Assert(2 == argumentIndex);

    let requiresSuggestionEscaping = false
    var retVal: KeyValuePair<string, DType>[] = [] // new List<KeyValuePair<string, DType>>();

    let tryGetEnumSymbolRes = tryGetEnumSymbol(EnumConstants.TimeUnitEnumString)
    let enumInfo = tryGetEnumSymbolRes[1]
    if (argumentIndex == 2 && tryGetEnumSymbolRes[0]) {
      // Contracts.AssertValue(enumInfo);
      for (let name of enumInfo.enumType.getNames(DPath.Root)) {
        let TryGetLocValueNameRes = enumInfo.tryGetLocValueName(name.name.value)
        // enumInfo.TryGetLocValueName(name.Name.Value, out locName).Verify();
        let locName = TryGetLocValueNameRes[1]
        if (suggestUnqualifedEnums) {
          retVal.push({ key: TexlLexer.EscapeName(locName), value: name.type }) //new KeyValuePair<string, DType>(TexlLexer.EscapeName(locName), name.type));
        } else {
          retVal.push({
            key: TexlLexer.EscapeName(enumInfo.name) + TexlLexer.PunctuatorDot + TexlLexer.EscapeName(locName),
            value: name.type,
          }) //new KeyValuePair<string, DType>(TexlLexer.EscapeName(enumInfo.Name) + TexlLexer.PunctuatorDot + TexlLexer.EscapeName(locName), name.Type));
        }
      }
    }

    return [retVal, requiresSuggestionEscaping]
  }

  private static LanguageCodeSuggestion(
    tryGetEnumSymbol: TryGetEnumSymbol,
    suggestUnqualifedEnums: boolean,
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    // Contracts.Assert(scopeType.IsValid);
    // Contracts.Assert(0 <= argumentIndex);

    let requiresSuggestionEscaping = false
    return [argumentIndex == 1 ? ArgumentSuggestions.GetLanguageCodeSuggestions() : [], requiresSuggestionEscaping]
    // EnumerableUtils.Yield<KeyValuePair<string, DType>>()), requiresSuggestionEscaping]
  }

  // This method returns the suggestions for latter arguments of the If function based on the second argument (the true result)
  private static IfSuggestions(
    tryGetEnumSymbol: TryGetEnumSymbol,
    suggestUnqualifedEnums: boolean,
    scopeType: DType,
    argumentIndex: number,
  ): [KeyValuePair<string, DType>[], boolean] {
    //, out boolean requiresSuggestionEscaping)
    // Contracts.Assert(scopeType.IsValid);
    // Contracts.Assert(0 <= argumentIndex);

    let requiresSuggestionEscaping = false

    if (argumentIndex <= 1) return [[], requiresSuggestionEscaping] // EnumerableUtils.Yield<KeyValuePair<string, DType>>();

    return [
      scopeType
        .getNames(DPath.Root)
        // .Select(name => new KeyValuePair<string, DType>(TexlLexer.EscapeName(name.Name.Value), name.Type));
        .map((name) => <KeyValuePair<string, DType>>{ key: TexlLexer.EscapeName(name.name.value), value: name.type }),
      requiresSuggestionEscaping,
    ]
  }
}
