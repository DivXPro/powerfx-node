import { ErrorResourceKey } from './ErrorResourceKey'
import { StringResources } from './StringResource'

export declare type StringGetter = (locale?: string) => string | undefined

export class TexlStrings {
  // public delegate string StringGetter(string locale = null);

  public static AboutChar: StringGetter = (b?: string) => StringResources.Get('AboutChar', b)
  public static CharArg1: StringGetter = (b?: string) => StringResources.Get('CharArg1', b)
  public static AboutCharT: StringGetter = (b?: string) => StringResources.Get('AboutCharT', b)
  public static CharTArg1: StringGetter = (b?: string) => StringResources.Get('CharTArg1', b)

  public static AboutIf: StringGetter = (b?: string) => StringResources.Get('AboutIf', b)
  public static IfArgCond: StringGetter = (b?: string) => StringResources.Get('IfArgCond', b)
  public static IfArgTrueValue: StringGetter = (b?: string) => StringResources.Get('IfArgTrueValue', b)
  public static IfArgElseValue: StringGetter = (b?: string) => StringResources.Get('IfArgElseValue', b)

  public static AboutSwitch: StringGetter = (b?: string) => StringResources.Get('AboutSwitch', b)
  public static SwitchExpression: StringGetter = (b?: string) => StringResources.Get('SwitchExpression', b)
  public static SwitchDefaultReturn: StringGetter = (b?: string) => StringResources.Get('SwitchDefaultReturn', b)
  public static SwitchCaseExpr: StringGetter = (b?: string) => StringResources.Get('SwitchCaseExpr', b)
  public static SwitchCaseArg: StringGetter = (b?: string) => StringResources.Get('SwitchCaseArg', b)

  public static AboutAnd: StringGetter = (b?: string) => StringResources.Get('AboutAnd', b)
  public static AboutOr: StringGetter = (b?: string) => StringResources.Get('AboutOr', b)
  public static AboutNot: StringGetter = (b?: string) => StringResources.Get('AboutNot', b)
  public static LogicalFuncParam: StringGetter = (b?: string) => StringResources.Get('LogicalFuncParam', b)

  public static AboutCount: StringGetter = (b?: string) => StringResources.Get('AboutCount', b)
  public static AboutCountA: StringGetter = (b?: string) => StringResources.Get('AboutCountA', b)
  public static AboutCountRows: StringGetter = (b?: string) => StringResources.Get('AboutCountRows', b)
  public static CountArg1: StringGetter = (b?: string) => StringResources.Get('CountArg1', b)

  public static AboutCountIf: StringGetter = (b?: string) => StringResources.Get('AboutCountIf', b)
  public static CountIfArg1: StringGetter = (b?: string) => StringResources.Get('CountIfArg1', b)
  public static CountIfArg2: StringGetter = (b?: string) => StringResources.Get('CountIfArg2', b)

  public static AboutSumT: StringGetter = (b?: string) => StringResources.Get('AboutSumT', b)
  public static AboutMaxT: StringGetter = (b?: string) => StringResources.Get('AboutMaxT', b)
  public static AboutMinT: StringGetter = (b?: string) => StringResources.Get('AboutMinT', b)
  public static AboutAverageT: StringGetter = (b?: string) => StringResources.Get('AboutAverageT', b)
  public static StatisticalTArg1: StringGetter = (b?: string) => StringResources.Get('StatisticalTArg1', b)
  public static StatisticalTArg2: StringGetter = (b?: string) => StringResources.Get('StatisticalTArg2', b)

  public static AboutSum: StringGetter = (b?: string) => StringResources.Get('AboutSum', b)
  public static AboutMax: StringGetter = (b?: string) => StringResources.Get('AboutMax', b)
  public static AboutMin: StringGetter = (b?: string) => StringResources.Get('AboutMin', b)
  public static AboutAverage: StringGetter = (b?: string) => StringResources.Get('AboutAverage', b)
  public static StatisticalArg: StringGetter = (b?: string) => StringResources.Get('StatisticalArg', b)

  public static AboutAddColumns: StringGetter = (b?: string) => StringResources.Get('AboutAddColumns', b)
  public static AddColumnsArg1: StringGetter = (b?: string) => StringResources.Get('AddColumnsArg1', b)
  public static AddColumnsArg2: StringGetter = (b?: string) => StringResources.Get('AddColumnsArg2', b)
  public static AddColumnsArg3: StringGetter = (b?: string) => StringResources.Get('AddColumnsArg3', b)

  public static AboutDropColumns: StringGetter = (b?: string) => StringResources.Get('AboutDropColumns', b)
  public static DropColumnsArg1: StringGetter = (b?: string) => StringResources.Get('DropColumnsArg1', b)
  public static DropColumnsArg2: StringGetter = (b?: string) => StringResources.Get('DropColumnsArg2', b)

  public static AboutShowColumns: StringGetter = (b?: string) => StringResources.Get('AboutShowColumns', b)
  public static ShowColumnsArg1: StringGetter = (b?: string) => StringResources.Get('ShowColumnsArg1', b)
  public static ShowColumnsArg2: StringGetter = (b?: string) => StringResources.Get('ShowColumnsArg2', b)

  public static AboutFilter: StringGetter = (b?: string) => StringResources.Get('AboutFilter', b)
  public static FilterArg1: StringGetter = (b?: string) => StringResources.Get('FilterArg1', b)
  public static FilterArg2: StringGetter = (b?: string) => StringResources.Get('FilterArg2', b)

  public static AboutFirst: StringGetter = (b?: string) => StringResources.Get('AboutFirst', b)
  public static AboutLast: StringGetter = (b?: string) => StringResources.Get('AboutLast', b)
  public static FirstLastArg1: StringGetter = (b?: string) => StringResources.Get('FirstLastArg1', b)

  public static AboutFirstN: StringGetter = (b?: string) => StringResources.Get('AboutFirstN', b)
  public static AboutLastN: StringGetter = (b?: string) => StringResources.Get('AboutLastN', b)
  public static FirstLastNArg1: StringGetter = (b?: string) => StringResources.Get('FirstLastNArg1', b)
  public static FirstLastNArg2: StringGetter = (b?: string) => StringResources.Get('FirstLastNArg2', b)

  public static AboutText: StringGetter = (b?: string) => StringResources.Get('AboutText', b)
  public static TextArg1: StringGetter = (b?: string) => StringResources.Get('TextArg1', b)
  public static TextArg2: StringGetter = (b?: string) => StringResources.Get('TextArg2', b)
  public static TextArg3: StringGetter = (b?: string) => StringResources.Get('TextArg3', b)

  public static AboutValue: StringGetter = (b?: string) => StringResources.Get('AboutValue', b)
  public static ValueArg1: StringGetter = (b?: string) => StringResources.Get('ValueArg1', b)
  public static ValueArg2: StringGetter = (b?: string) => StringResources.Get('ValueArg2', b)

  public static AboutBoolean: StringGetter = (b?: string) => StringResources.Get('AboutBoolean', b)
  public static BooleanArg1: StringGetter = (b?: string) => StringResources.Get('BooleanArg1', b)

  public static AboutConcatenate: StringGetter = (b?: string) => StringResources.Get('AboutConcatenate', b)
  public static ConcatenateArg1: StringGetter = (b?: string) => StringResources.Get('ConcatenateArg1', b)
  public static AboutConcatenateT: StringGetter = (b?: string) => StringResources.Get('AboutConcatenateT', b)
  public static ConcatenateTArg1: StringGetter = (b?: string) => StringResources.Get('ConcatenateTArg1', b)

  public static AboutCoalesce: StringGetter = (b?: string) => StringResources.Get('AboutCoalesce', b)
  public static CoalesceArg1: StringGetter = (b?: string) => StringResources.Get('CoalesceArg1', b)

  public static AboutIfError: StringGetter = (b?: string) => StringResources.Get('AboutIfError', b)
  public static IfErrorArg1: StringGetter = (b?: string) => StringResources.Get('IfErrorArg1', b)
  public static IfErrorArg2: StringGetter = (b?: string) => StringResources.Get('IfErrorArg2', b)

  public static AboutError: StringGetter = (b?: string) => StringResources.Get('AboutError', b)
  public static ErrorArg1: StringGetter = (b?: string) => StringResources.Get('ErrorArg1', b)

  public static AboutIsError: StringGetter = (b?: string) => StringResources.Get('AboutIsError', b)
  public static IsErrorArg: StringGetter = (b?: string) => StringResources.Get('IsErrorArg', b)

  public static AboutConcat: StringGetter = (b?: string) => StringResources.Get('AboutConcat', b)
  public static ConcatArg1: StringGetter = (b?: string) => StringResources.Get('ConcatArg1', b)
  public static ConcatArg2: StringGetter = (b?: string) => StringResources.Get('ConcatArg2', b)
  public static ConcatArg3: StringGetter = (b?: string) => StringResources.Get('ConcatArg3', b)

  public static AboutLen: StringGetter = (b?: string) => StringResources.Get('AboutLen', b)
  public static AboutLenT: StringGetter = (b?: string) => StringResources.Get('AboutLenT', b)
  public static LenArg1: StringGetter = (b?: string) => StringResources.Get('LenArg1', b)
  public static LenTArg1: StringGetter = (b?: string) => StringResources.Get('LenTArg1', b)

  public static AboutUpper: StringGetter = (b?: string) => StringResources.Get('AboutUpper', b)
  public static AboutUpperT: StringGetter = (b?: string) => StringResources.Get('AboutUpperT', b)
  public static AboutLower: StringGetter = (b?: string) => StringResources.Get('AboutLower', b)
  public static AboutLowerT: StringGetter = (b?: string) => StringResources.Get('AboutLowerT', b)
  public static AboutProper: StringGetter = (b?: string) => StringResources.Get('AboutProper', b)
  public static AboutProperT: StringGetter = (b?: string) => StringResources.Get('AboutProperT', b)
  public static AboutTrim: StringGetter = (b?: string) => StringResources.Get('AboutTrim', b)
  public static AboutTrimEnds: StringGetter = (b?: string) => StringResources.Get('AboutTrimEnds', b)
  public static AboutMid: StringGetter = (b?: string) => StringResources.Get('AboutMid', b)
  public static AboutMidT: StringGetter = (b?: string) => StringResources.Get('AboutMidT', b)
  public static StringFuncArg1: StringGetter = (b?: string) => StringResources.Get('StringFuncArg1', b)
  public static StringTFuncArg1: StringGetter = (b?: string) => StringResources.Get('StringTFuncArg1', b)
  public static StringFuncArg2: StringGetter = (b?: string) => StringResources.Get('StringFuncArg2', b)
  public static StringFuncArg3: StringGetter = (b?: string) => StringResources.Get('StringFuncArg3', b)

  public static AboutReplace: StringGetter = (b?: string) => StringResources.Get('AboutReplace', b)
  public static AboutReplaceT: StringGetter = (b?: string) => StringResources.Get('AboutReplaceT', b)
  public static ReplaceFuncArg1: StringGetter = (b?: string) => StringResources.Get('ReplaceFuncArg1', b)
  public static ReplaceFuncArg4: StringGetter = (b?: string) => StringResources.Get('ReplaceFuncArg4', b)

  public static AboutSubstitute: StringGetter = (b?: string) => StringResources.Get('AboutSubstitute', b)
  public static AboutSubstituteT: StringGetter = (b?: string) => StringResources.Get('AboutSubstituteT', b)
  public static SubstituteFuncArg1: StringGetter = (b?: string) => StringResources.Get('SubstituteFuncArg1', b)
  public static SubstituteTFuncArg1: StringGetter = (b?: string) => StringResources.Get('SubstituteTFuncArg1', b)
  public static SubstituteFuncArg2: StringGetter = (b?: string) => StringResources.Get('SubstituteFuncArg2', b)
  public static SubstituteFuncArg3: StringGetter = (b?: string) => StringResources.Get('SubstituteFuncArg3', b)
  public static SubstituteFuncArg4: StringGetter = (b?: string) => StringResources.Get('SubstituteFuncArg4', b)

  public static AboutSort: StringGetter = (b?: string) => StringResources.Get('AboutSort', b)
  public static SortArg1: StringGetter = (b?: string) => StringResources.Get('SortArg1', b)
  public static SortArg2: StringGetter = (b?: string) => StringResources.Get('SortArg2', b)
  public static SortArg3: StringGetter = (b?: string) => StringResources.Get('SortArg3', b)

  public static AboutSortByColumns: StringGetter = (b?: string) => StringResources.Get('AboutSortByColumns', b)
  public static SortByColumnsArg1: StringGetter = (b?: string) => StringResources.Get('SortByColumnsArg1', b)
  public static SortByColumnsArg2: StringGetter = (b?: string) => StringResources.Get('SortByColumnsArg2', b)
  public static SortByColumnsArg3: StringGetter = (b?: string) => StringResources.Get('SortByColumnsArg3', b)

  public static AboutSortByColumnsWithOrderValues: StringGetter = (b?: string) =>
    StringResources.Get('AboutSortByColumnsWithOrderValues', b)
  public static SortByColumnsWithOrderValuesArg1: StringGetter = (b?: string) =>
    StringResources.Get('SortByColumnsWithOrderValuesArg1', b)
  public static SortByColumnsWithOrderValuesArg2: StringGetter = (b?: string) =>
    StringResources.Get('SortByColumnsWithOrderValuesArg2', b)
  public static SortByColumnsWithOrderValuesArg3: StringGetter = (b?: string) =>
    StringResources.Get('SortByColumnsWithOrderValuesArg3', b)

  public static AboutRand: StringGetter = (b?: string) => StringResources.Get('AboutRand', b)
  public static AboutRandBetween: StringGetter = (b?: string) => StringResources.Get('AboutRandBetween', b)
  public static RandBetweenArg1: StringGetter = (b?: string) => StringResources.Get('RandBetweenArg1', b)
  public static RandBetweenArg2: StringGetter = (b?: string) => StringResources.Get('RandBetweenArg2', b)

  public static AboutNow: StringGetter = (b?: string) => StringResources.Get('AboutNow', b)
  public static AboutUTCNow: StringGetter = (b?: string) => StringResources.Get('AboutUTCNow', b)
  public static AboutToday: StringGetter = (b?: string) => StringResources.Get('AboutToday', b)
  public static AboutUTCToday: StringGetter = (b?: string) => StringResources.Get('AboutUTCToday', b)
  public static AboutGUID: StringGetter = (b?: string) => StringResources.Get('AboutGUID', b)
  public static GUIDArg: StringGetter = (b?: string) => StringResources.Get('GUIDArg', b)

  public static AboutTimeZoneOffset: StringGetter = (b?: string) => StringResources.Get('AboutTimeZoneOffset', b)
  public static TimeZoneOffsetArg1: StringGetter = (b?: string) => StringResources.Get('TimeZoneOffsetArg1', b)

  public static AboutIsToday: StringGetter = (b?: string) => StringResources.Get('AboutIsToday', b)
  public static IsTodayFuncArg1: StringGetter = (b?: string) => StringResources.Get('IsTodayFuncArg1', b)
  public static AboutIsUTCToday: StringGetter = (b?: string) => StringResources.Get('AboutIsUTCToday', b)
  public static IsUTCTodayFuncArg1: StringGetter = (b?: string) => StringResources.Get('IsUTCTodayFuncArg1', b)

  public static AboutRound: StringGetter = (b?: string) => StringResources.Get('AboutRound', b)
  public static AboutRoundUp: StringGetter = (b?: string) => StringResources.Get('AboutRoundUp', b)
  public static AboutRoundDown: StringGetter = (b?: string) => StringResources.Get('AboutRoundDown', b)
  public static RoundArg1: StringGetter = (b?: string) => StringResources.Get('RoundArg1', b)
  public static RoundArg2: StringGetter = (b?: string) => StringResources.Get('RoundArg2', b)

  public static AboutRoundT: StringGetter = (b?: string) => StringResources.Get('AboutRoundT', b)
  public static AboutRoundUpT: StringGetter = (b?: string) => StringResources.Get('AboutRoundUpT', b)
  public static AboutRoundDownT: StringGetter = (b?: string) => StringResources.Get('AboutRoundDownT', b)
  public static RoundTArg1: StringGetter = (b?: string) => StringResources.Get('RoundTArg1', b)
  public static RoundTArg2: StringGetter = (b?: string) => StringResources.Get('RoundTArg2', b)

  public static AboutRGBA: StringGetter = (b?: string) => StringResources.Get('AboutRGBA', b)
  public static RGBAArg1: StringGetter = (b?: string) => StringResources.Get('RGBAArg1', b)
  public static RGBAArg2: StringGetter = (b?: string) => StringResources.Get('RGBAArg2', b)
  public static RGBAArg3: StringGetter = (b?: string) => StringResources.Get('RGBAArg3', b)
  public static RGBAArg4: StringGetter = (b?: string) => StringResources.Get('RGBAArg4', b)

  public static AboutColorFade: StringGetter = (b?: string) => StringResources.Get('AboutColorFade', b)
  public static ColorFadeArg1: StringGetter = (b?: string) => StringResources.Get('ColorFadeArg1', b)
  public static ColorFadeArg2: StringGetter = (b?: string) => StringResources.Get('ColorFadeArg2', b)

  public static AboutColorFadeT: StringGetter = (b?: string) => StringResources.Get('AboutColorFadeT', b)
  public static ColorFadeTArg1: StringGetter = (b?: string) => StringResources.Get('ColorFadeTArg1', b)
  public static ColorFadeTArg2: StringGetter = (b?: string) => StringResources.Get('ColorFadeTArg2', b)

  public static AboutAbs: StringGetter = (b?: string) => StringResources.Get('AboutAbs', b)
  public static AboutAbsT: StringGetter = (b?: string) => StringResources.Get('AboutAbsT', b)
  public static AboutSqrt: StringGetter = (b?: string) => StringResources.Get('AboutSqrt', b)
  public static AboutSqrtT: StringGetter = (b?: string) => StringResources.Get('AboutSqrtT', b)
  public static MathFuncArg1: StringGetter = (b?: string) => StringResources.Get('MathFuncArg1', b)
  public static MathTFuncArg1: StringGetter = (b?: string) => StringResources.Get('MathTFuncArg1', b)

  public static AboutInt: StringGetter = (b?: string) => StringResources.Get('AboutInt', b)
  public static AboutIntT: StringGetter = (b?: string) => StringResources.Get('AboutIntT', b)

  public static AboutTrunc: StringGetter = (b?: string) => StringResources.Get('AboutTrunc', b)
  public static TruncArg1: StringGetter = (b?: string) => StringResources.Get('TruncArg1', b)
  public static TruncArg2: StringGetter = (b?: string) => StringResources.Get('TruncArg2', b)

  public static AboutTruncT: StringGetter = (b?: string) => StringResources.Get('AboutTruncT', b)
  public static TruncTArg1: StringGetter = (b?: string) => StringResources.Get('TruncTArg1', b)
  public static TruncTArg2: StringGetter = (b?: string) => StringResources.Get('TruncTArg2', b)

  public static AboutLeft: StringGetter = (b?: string) => StringResources.Get('AboutLeft', b)
  public static AboutRight: StringGetter = (b?: string) => StringResources.Get('AboutRight', b)
  public static AboutLeftT: StringGetter = (b?: string) => StringResources.Get('AboutLeftT', b)
  public static AboutRightT: StringGetter = (b?: string) => StringResources.Get('AboutRightT', b)
  public static LeftRightArg1: StringGetter = (b?: string) => StringResources.Get('LeftRightArg1', b)
  public static LeftRightTArg1: StringGetter = (b?: string) => StringResources.Get('LeftRightTArg1', b)
  public static LeftRightArg2: StringGetter = (b?: string) => StringResources.Get('LeftRightArg2', b)

  public static AboutIsBlank: StringGetter = (b?: string) => StringResources.Get('AboutIsBlank', b)
  public static IsBlankArg1: StringGetter = (b?: string) => StringResources.Get('IsBlankArg1', b)

  public static AboutIsBlankOrError: StringGetter = (b?: string) => StringResources.Get('AboutIsBlankOrError', b)
  public static IsBlankOrErrorArg1: StringGetter = (b?: string) => StringResources.Get('IsBlankOrErrorArg1', b)

  public static AboutIsEmpty: StringGetter = (b?: string) => StringResources.Get('AboutIsEmpty', b)
  public static IsEmptyArg1: StringGetter = (b?: string) => StringResources.Get('IsEmptyArg1', b)

  public static AboutIsNumeric: StringGetter = (b?: string) => StringResources.Get('AboutIsNumeric', b)
  public static IsNumericArg1: StringGetter = (b?: string) => StringResources.Get('IsNumericArg1', b)

  public static AboutShuffle: StringGetter = (b?: string) => StringResources.Get('AboutShuffle', b)
  public static ShuffleArg1: StringGetter = (b?: string) => StringResources.Get('ShuffleArg1', b)

  public static AboutLookUp: StringGetter = (b?: string) => StringResources.Get('AboutLookUp', b)
  public static LookUpArg1: StringGetter = (b?: string) => StringResources.Get('LookUpArg1', b)
  public static LookUpArg2: StringGetter = (b?: string) => StringResources.Get('LookUpArg2', b)
  public static LookUpArg3: StringGetter = (b?: string) => StringResources.Get('LookUpArg3', b)

  public static AboutStdevP: StringGetter = (b?: string) => StringResources.Get('AboutStdevP', b)
  public static AboutStdevPT: StringGetter = (b?: string) => StringResources.Get('AboutStdevPT', b)

  public static AboutVarP: StringGetter = (b?: string) => StringResources.Get('AboutVarP', b)
  public static AboutVarPT: StringGetter = (b?: string) => StringResources.Get('AboutVarPT', b)

  public static AboutSin: StringGetter = (b?: string) => StringResources.Get('AboutSin', b)
  public static AboutSinT: StringGetter = (b?: string) => StringResources.Get('AboutSinT', b)
  public static AboutAsin: StringGetter = (b?: string) => StringResources.Get('AboutAsin', b)
  public static AboutAsinT: StringGetter = (b?: string) => StringResources.Get('AboutAsinT', b)
  public static AboutCos: StringGetter = (b?: string) => StringResources.Get('AboutCos', b)
  public static AboutCosT: StringGetter = (b?: string) => StringResources.Get('AboutCosT', b)
  public static AboutAcos: StringGetter = (b?: string) => StringResources.Get('AboutAcos', b)
  public static AboutAcosT: StringGetter = (b?: string) => StringResources.Get('AboutAcosT', b)

  public static AboutTan: StringGetter = (b?: string) => StringResources.Get('AboutTan', b)
  public static AboutTanT: StringGetter = (b?: string) => StringResources.Get('AboutTanT', b)
  public static AboutAtan: StringGetter = (b?: string) => StringResources.Get('AboutAtan', b)
  public static AboutAtanT: StringGetter = (b?: string) => StringResources.Get('AboutAtanT', b)
  public static AboutCot: StringGetter = (b?: string) => StringResources.Get('AboutCot', b)
  public static AboutCotT: StringGetter = (b?: string) => StringResources.Get('AboutCotT', b)
  public static AboutAcot: StringGetter = (b?: string) => StringResources.Get('AboutAcot', b)
  public static AboutAcotT: StringGetter = (b?: string) => StringResources.Get('AboutAcotT', b)

  public static AboutLn: StringGetter = (b?: string) => StringResources.Get('AboutLn', b)
  public static AboutLnT: StringGetter = (b?: string) => StringResources.Get('AboutLnT', b)

  public static AboutLog: StringGetter = (b?: string) => StringResources.Get('AboutLog', b)
  public static AboutLogT: StringGetter = (b?: string) => StringResources.Get('AboutLogT', b)
  public static LogBase: StringGetter = (b?: string) => StringResources.Get('LogBase', b)

  public static AboutExp: StringGetter = (b?: string) => StringResources.Get('AboutExp', b)
  public static AboutExpT: StringGetter = (b?: string) => StringResources.Get('AboutExpT', b)

  public static AboutRadians: StringGetter = (b?: string) => StringResources.Get('AboutRadians', b)
  public static AboutRadiansT: StringGetter = (b?: string) => StringResources.Get('AboutRadiansT', b)
  public static AboutDegrees: StringGetter = (b?: string) => StringResources.Get('AboutDegrees', b)
  public static AboutDegreesT: StringGetter = (b?: string) => StringResources.Get('AboutDegreesT', b)

  public static AboutAtan2: StringGetter = (b?: string) => StringResources.Get('AboutAtan2', b)
  public static AboutAtan2Arg1: StringGetter = (b?: string) => StringResources.Get('AboutAtan2Arg1', b)
  public static AboutAtan2Arg2: StringGetter = (b?: string) => StringResources.Get('AboutAtan2Arg2', b)

  public static AboutPi: StringGetter = (b?: string) => StringResources.Get('AboutPi', b)

  public static AboutDate: StringGetter = (b?: string) => StringResources.Get('AboutDate', b)
  public static DateArg1: StringGetter = (b?: string) => StringResources.Get('DateArg1', b)
  public static DateArg2: StringGetter = (b?: string) => StringResources.Get('DateArg2', b)
  public static DateArg3: StringGetter = (b?: string) => StringResources.Get('DateArg3', b)
  public static AboutTime: StringGetter = (b?: string) => StringResources.Get('AboutTime', b)
  public static TimeArg1: StringGetter = (b?: string) => StringResources.Get('TimeArg1', b)
  public static TimeArg2: StringGetter = (b?: string) => StringResources.Get('TimeArg2', b)
  public static TimeArg3: StringGetter = (b?: string) => StringResources.Get('TimeArg3', b)
  public static TimeArg4: StringGetter = (b?: string) => StringResources.Get('TimeArg4', b)
  public static AboutYear: StringGetter = (b?: string) => StringResources.Get('AboutYear', b)
  public static YearArg1: StringGetter = (b?: string) => StringResources.Get('YearArg1', b)
  public static AboutMonth: StringGetter = (b?: string) => StringResources.Get('AboutMonth', b)
  public static MonthArg1: StringGetter = (b?: string) => StringResources.Get('MonthArg1', b)
  public static AboutDay: StringGetter = (b?: string) => StringResources.Get('AboutDay', b)
  public static DayArg1: StringGetter = (b?: string) => StringResources.Get('DayArg1', b)
  public static AboutHour: StringGetter = (b?: string) => StringResources.Get('AboutHour', b)
  public static HourArg1: StringGetter = (b?: string) => StringResources.Get('HourArg1', b)
  public static AboutMinute: StringGetter = (b?: string) => StringResources.Get('AboutMinute', b)
  public static MinuteArg1: StringGetter = (b?: string) => StringResources.Get('MinuteArg1', b)
  public static AboutSecond: StringGetter = (b?: string) => StringResources.Get('AboutSecond', b)
  public static SecondArg1: StringGetter = (b?: string) => StringResources.Get('SecondArg1', b)
  public static AboutWeekday: StringGetter = (b?: string) => StringResources.Get('AboutWeekday', b)
  public static WeekdayArg1: StringGetter = (b?: string) => StringResources.Get('WeekdayArg1', b)
  public static WeekdayArg2: StringGetter = (b?: string) => StringResources.Get('WeekdayArg2', b)
  public static AboutWeekNum: StringGetter = (b?: string) => StringResources.Get('AboutWeekNum', b)
  public static WeekNumArg1: StringGetter = (b?: string) => StringResources.Get('WeekNumArg1', b)
  public static WeekNumArg2: StringGetter = (b?: string) => StringResources.Get('WeekNumArg2', b)
  public static AboutISOWeekNum: StringGetter = (b?: string) => StringResources.Get('AboutISOWeekNum', b)
  public static ISOWeekNumArg1: StringGetter = (b?: string) => StringResources.Get('ISOWeekNumArg1', b)

  public static AboutCalendar__MonthsLong: StringGetter = (b?: string) =>
    StringResources.Get('AboutCalendar__MonthsLong', b)
  public static AboutCalendar__MonthsShort: StringGetter = (b?: string) =>
    StringResources.Get('AboutCalendar__MonthsShort', b)
  public static AboutCalendar__WeekdaysLong: StringGetter = (b?: string) =>
    StringResources.Get('AboutCalendar__WeekdaysLong', b)
  public static AboutCalendar__WeekdaysShort: StringGetter = (b?: string) =>
    StringResources.Get('AboutCalendar__WeekdaysShort', b)

  public static AboutClock__AmPm: StringGetter = (b?: string) => StringResources.Get('AboutClock__AmPm', b)
  public static AboutClock__AmPmShort: StringGetter = (b?: string) => StringResources.Get('AboutClock__AmPmShort', b)
  public static AboutClock__IsClock24: StringGetter = (b?: string) => StringResources.Get('AboutClock__IsClock24', b)

  public static AboutDateValue: StringGetter = (b?: string) => StringResources.Get('AboutDateValue', b)
  public static DateValueArg1: StringGetter = (b?: string) => StringResources.Get('DateValueArg1', b)
  public static DateValueArg2: StringGetter = (b?: string) => StringResources.Get('DateValueArg2', b)
  public static AboutTimeValue: StringGetter = (b?: string) => StringResources.Get('AboutTimeValue', b)
  public static TimeValueArg1: StringGetter = (b?: string) => StringResources.Get('TimeValueArg1', b)
  public static TimeValueArg2: StringGetter = (b?: string) => StringResources.Get('TimeValueArg2', b)
  public static SupportedDateTimeLanguageCodes: StringGetter = (b?: string) =>
    StringResources.Get('SupportedDateTimeLanguageCodes', b)
  public static AboutDateTimeValue: StringGetter = (b?: string) => StringResources.Get('AboutDateTimeValue', b)
  public static DateTimeValueArg1: StringGetter = (b?: string) => StringResources.Get('DateTimeValueArg1', b)
  public static DateTimeValueArg2: StringGetter = (b?: string) => StringResources.Get('DateTimeValueArg2', b)

  public static AboutDateAdd: StringGetter = (b?: string) => StringResources.Get('AboutDateAdd', b)
  public static DateAddArg1: StringGetter = (b?: string) => StringResources.Get('DateAddArg1', b)
  public static DateAddArg2: StringGetter = (b?: string) => StringResources.Get('DateAddArg2', b)
  public static DateAddArg3: StringGetter = (b?: string) => StringResources.Get('DateAddArg3', b)

  public static AboutDateAddT: StringGetter = (b?: string) => StringResources.Get('AboutDateAddT', b)
  public static DateAddTArg1: StringGetter = (b?: string) => StringResources.Get('DateAddTArg1', b)
  public static DateAddTArg2: StringGetter = (b?: string) => StringResources.Get('DateAddTArg2', b)
  public static DateAddTArg3: StringGetter = (b?: string) => StringResources.Get('DateAddTArg3', b)

  public static AboutDateDiff: StringGetter = (b?: string) => StringResources.Get('AboutDateDiff', b)
  public static DateDiffArg1: StringGetter = (b?: string) => StringResources.Get('DateDiffArg1', b)
  public static DateDiffArg2: StringGetter = (b?: string) => StringResources.Get('DateDiffArg2', b)
  public static DateDiffArg3: StringGetter = (b?: string) => StringResources.Get('DateDiffArg3', b)

  public static AboutDateDiffT: StringGetter = (b?: string) => StringResources.Get('AboutDateDiffT', b)
  public static DateDiffTArg1: StringGetter = (b?: string) => StringResources.Get('DateDiffTArg1', b)
  public static DateDiffTArg2: StringGetter = (b?: string) => StringResources.Get('DateDiffTArg2', b)
  public static DateDiffTArg3: StringGetter = (b?: string) => StringResources.Get('DateDiffTArg3', b)

  public static AboutFind: StringGetter = (b?: string) => StringResources.Get('AboutFind', b)
  public static FindArg1: StringGetter = (b?: string) => StringResources.Get('FindArg1', b)
  public static FindArg2: StringGetter = (b?: string) => StringResources.Get('FindArg2', b)
  public static FindArg3: StringGetter = (b?: string) => StringResources.Get('FindArg3', b)
  public static AboutFindT: StringGetter = (b?: string) => StringResources.Get('AboutFindT', b)
  public static FindTArg1: StringGetter = (b?: string) => StringResources.Get('FindTArg1', b)
  public static FindTArg2: StringGetter = (b?: string) => StringResources.Get('FindTArg2', b)
  public static FindTArg3: StringGetter = (b?: string) => StringResources.Get('FindTArg3', b)

  public static AboutColorValue: StringGetter = (b?: string) => StringResources.Get('AboutColorValue', b)
  public static ColorValueArg1: StringGetter = (b?: string) => StringResources.Get('ColorValueArg1', b)

  public static AboutTable: StringGetter = (b?: string) => StringResources.Get('AboutTable', b)
  public static TableArg1: StringGetter = (b?: string) => StringResources.Get('TableArg1', b)

  public static AboutMod: StringGetter = (b?: string) => StringResources.Get('AboutMod', b)
  public static ModFuncArg1: StringGetter = (b?: string) => StringResources.Get('ModFuncArg1', b)
  public static ModFuncArg2: StringGetter = (b?: string) => StringResources.Get('ModFuncArg2', b)

  public static AboutModT: StringGetter = (b?: string) => StringResources.Get('AboutModT', b)
  public static ModTFuncArg1: StringGetter = (b?: string) => StringResources.Get('ModTFuncArg1', b)
  public static ModTFuncArg2: StringGetter = (b?: string) => StringResources.Get('ModTFuncArg2', b)

  public static AboutForAll: StringGetter = (b?: string) => StringResources.Get('AboutForAll', b)
  public static ForAllArg1: StringGetter = (b?: string) => StringResources.Get('ForAllArg1', b)
  public static ForAllArg2: StringGetter = (b?: string) => StringResources.Get('ForAllArg2', b)

  public static AboutPower: StringGetter = (b?: string) => StringResources.Get('AboutPower', b)
  public static PowerFuncArg1: StringGetter = (b?: string) => StringResources.Get('PowerFuncArg1', b)
  public static PowerFuncArg2: StringGetter = (b?: string) => StringResources.Get('PowerFuncArg2', b)
  public static AboutPowerT: StringGetter = (b?: string) => StringResources.Get('AboutPowerT', b)
  public static PowerTFuncArg1: StringGetter = (b?: string) => StringResources.Get('PowerTFuncArg1', b)
  public static PowerTFuncArg2: StringGetter = (b?: string) => StringResources.Get('PowerTFuncArg2', b)

  public static AboutStartsWith: StringGetter = (b?: string) => StringResources.Get('AboutStartsWith', b)
  public static StartsWithArg1: StringGetter = (b?: string) => StringResources.Get('StartsWithArg1', b)
  public static StartsWithArg2: StringGetter = (b?: string) => StringResources.Get('StartsWithArg2', b)

  public static AboutEndsWith: StringGetter = (b?: string) => StringResources.Get('AboutEndsWith', b)
  public static EndsWithArg1: StringGetter = (b?: string) => StringResources.Get('EndsWithArg1', b)
  public static EndsWithArg2: StringGetter = (b?: string) => StringResources.Get('EndsWithArg2', b)

  public static AboutBlank: StringGetter = (b?: string) => StringResources.Get('AboutBlank', b)

  public static AboutSplit: StringGetter = (b?: string) => StringResources.Get('AboutSplit', b)
  public static SplitArg1: StringGetter = (b?: string) => StringResources.Get('SplitArg1', b)
  public static SplitArg2: StringGetter = (b?: string) => StringResources.Get('SplitArg2', b)

  public static AboutIsType: StringGetter = (b?: string) => StringResources.Get('AboutIsType', b)
  public static IsTypeArg1: StringGetter = (b?: string) => StringResources.Get('IsTypeArg1', b)
  public static IsTypeArg2: StringGetter = (b?: string) => StringResources.Get('IsTypeArg2', b)

  public static AboutAsType: StringGetter = (b?: string) => StringResources.Get('AboutAsType', b)
  public static AsTypeArg1: StringGetter = (b?: string) => StringResources.Get('AsTypeArg1', b)
  public static AsTypeArg2: StringGetter = (b?: string) => StringResources.Get('AsTypeArg2', b)

  public static AboutWith: StringGetter = (b?: string) => StringResources.Get('AboutWith', b)
  public static WithArg1: StringGetter = (b?: string) => StringResources.Get('WithArg1', b)
  public static WithArg2: StringGetter = (b?: string) => StringResources.Get('WithArg2', b)

  public static AboutSequence: StringGetter = (b?: string) => StringResources.Get('AboutSequence', b)
  public static SequenceArg1: StringGetter = (b?: string) => StringResources.Get('SequenceArg1', b)
  public static SequenceArg2: StringGetter = (b?: string) => StringResources.Get('SequenceArg2', b)
  public static SequenceArg3: StringGetter = (b?: string) => StringResources.Get('SequenceArg3', b)

  public static AboutParseJson: StringGetter = (b) => StringResources.Get('AboutParseJson', b)
  public static ParseJsonArg1: StringGetter = (b) => StringResources.Get('ParseJsonArg1', b)

  public static AboutIndex: StringGetter = (b) => StringResources.Get('AboutIndex', b)
  public static IndexArg1: StringGetter = (b) => StringResources.Get('IndexArg1', b)
  public static IndexArg2: StringGetter = (b) => StringResources.Get('IndexArg2', b)

  public static Notify: StringGetter = (b) => StringResources.Get('Notify', b)

  // Previously, errors were listed here in the form of a StringGetter, which would be evaluated to fetch
  // an error message to pass to the BaseError class constructor. We are switching to passing the message key itself
  // to the BaseError class, and the BaseError itself is responsible for fetching the resource. (This allows the
  // BaseError class to contain logic to fetch auxillary resources, such as HowToFix and WhyToFix messages.)
  //
  // Any new additions here should be of type ErrorResourceKey and contain the value of the resource key.
  public static ErrUnSupportedComponentBehaviorInvocation = new ErrorResourceKey(
    'ErrUnSupportedComponentBehaviorInvocation',
  )
  public static ErrUnSupportedComponentDataPropertyAccess = new ErrorResourceKey(
    'ErrUnSupportedComponentDataPropertyAccess',
  )
  public static ErrOperandExpected = new ErrorResourceKey('ErrOperandExpected')
  public static ErrBadToken = new ErrorResourceKey('ErrBadToken')
  public static UnexpectedCharacterToken = new ErrorResourceKey('UnexpectedCharacterToken')
  public static ErrMissingEndOfBlockComment = new ErrorResourceKey('ErrMissingEndOfBlockComment')
  public static ErrExpectedFound_Ex_Fnd = new ErrorResourceKey('ErrExpectedFound_Ex_Fnd')
  public static ErrInvalidName = new ErrorResourceKey('ErrInvalidName')
  public static ErrInvalidPropertyAccess = new ErrorResourceKey('ErrInvalidPropertyAccess')
  public static ErrInvalidPropertyReference = new ErrorResourceKey('ErrInvalidPropertyReference')
  public static ErrInvalidParentUse = new ErrorResourceKey('ErrInvalidParentUse')
  public static ErrTooManyUps = new ErrorResourceKey('ErrTooManyUps')
  public static ErrRuleNestedTooDeeply = new ErrorResourceKey('ErrRuleNestedTooDeeply')
  public static ErrInvalidDot = new ErrorResourceKey('ErrInvalidDot')
  public static ErrUnknownFunction = new ErrorResourceKey('ErrUnknownFunction')
  public static ErrBadArity = new ErrorResourceKey('ErrBadArity')
  public static ErrBadArityRange = new ErrorResourceKey('ErrBadArityRange')
  public static ErrBadArityMinimum = new ErrorResourceKey('ErrBadArityMinimum')
  public static ErrBadArityOdd = new ErrorResourceKey('ErrBadArityOdd')
  public static ErrBadArityEven = new ErrorResourceKey('ErrBadArityEven')
  public static ErrBadType = new ErrorResourceKey('ErrBadType')
  public static ErrBadType_Type = new ErrorResourceKey('ErrBadType_Type')
  public static ErrBadOperatorTypes = new ErrorResourceKey('ErrBadOperatorTypes')
  public static ErrGuidStrictComparison = new ErrorResourceKey('ErrGuidStrictComparison')
  public static ErrBadType_ExpectedType = new ErrorResourceKey('ErrBadType_ExpectedType')
  public static ErrBadType_ExpectedTypesCSV = new ErrorResourceKey('ErrBadType_ExpectedTypesCSV')
  public static ErrBadType_ExpectedType_ProvidedType = new ErrorResourceKey('ErrBadType_ExpectedType_ProvidedType')
  public static ErrBadSchema_ExpectedType = new ErrorResourceKey('ErrBadSchema_ExpectedType')
  public static ErrInvalidArgs_Func = new ErrorResourceKey('ErrInvalidArgs_Func')
  public static ErrNeedTable_Func = new ErrorResourceKey('ErrNeedTable_Func')
  public static ErrNeedTableCol_Func = new ErrorResourceKey('ErrNeedTableCol_Func')
  public static ErrNotAccessibleInCurrentContext = new ErrorResourceKey('ErrNotAccessibleInCurrentContext')
  public static ErrInternalControlInInputProperty = new ErrorResourceKey('ErrInternalControlInInputProperty')
  public static ErrColumnNotAccessibleInCurrentContext = new ErrorResourceKey('ErrColumnNotAccessibleInCurrentContext')
  public static WrnRowScopeOneToNExpandNumberOfCalls = new ErrorResourceKey('WrnRowScopeOneToNExpandNumberOfCalls')
  public static ErrInvalidSchemaNeedStringCol_Col = new ErrorResourceKey('ErrInvalidSchemaNeedStringCol_Col')
  public static ErrInvalidSchemaNeedNumCol_Col = new ErrorResourceKey('ErrInvalidSchemaNeedNumCol_Col')
  public static ErrInvalidSchemaNeedDateCol_Col = new ErrorResourceKey('ErrInvalidSchemaNeedDateCol_Col')
  public static ErrInvalidSchemaNeedColorCol_Col = new ErrorResourceKey('ErrInvalidSchemaNeedColorCol_Col')
  public static ErrInvalidSchemaNeedCol = new ErrorResourceKey('ErrInvalidSchemaNeedCol')
  public static ErrNeedRecord = new ErrorResourceKey('ErrNeedRecord')
  public static ErrAutoRefreshNotAllowed = new ErrorResourceKey('ErrAutoRefreshNotAllowed')
  public static ErrIncompatibleRecord = new ErrorResourceKey('ErrIncompatibleRecord')
  public static ErrNeedRecord_Func = new ErrorResourceKey('ErrNeedRecord_Func')
  public static ErrNeedEntity_EntityName = new ErrorResourceKey('ErrNeedEntity_EntityName')
  public static ErrOperatorExpected = new ErrorResourceKey('ErrOperatorExpected')
  public static ErrNumberExpected = new ErrorResourceKey('ErrNumberExpected')
  public static ErrNumberTooLarge = new ErrorResourceKey('ErrNumberTooLarge')
  public static ErrBooleanExpected = new ErrorResourceKey('ErrBooleanExpected')
  public static ErrOnlyOneViewExpected = new ErrorResourceKey('ErrOnlyOneViewExpected')
  public static ErrViewFromCurrentTableExpected = new ErrorResourceKey('ErrViewFromCurrentTableExpected')
  public static ErrColonExpected = new ErrorResourceKey('ErrColonExpected')
  public static ErrInvalidDataSource = new ErrorResourceKey('ErrInvalidDataSource')
  public static ErrExpectedDataSourceRestriction = new ErrorResourceKey('ErrExpectedDataSourceRestriction')
  public static ErrBehaviorPropertyExpected = new ErrorResourceKey('ErrBehaviorPropertyExpected')
  public static ErrTestPropertyExpected = new ErrorResourceKey('ErrTestPropertyExpected')
  public static ErrStringExpected = new ErrorResourceKey('ErrStringExpected')
  public static ErrDateExpected = new ErrorResourceKey('ErrDateExpected')
  public static ErrCannotCoerce_SourceType_TargetType = new ErrorResourceKey('ErrCannotCoerce_SourceType_TargetType')
  public static ErrNumberOrStringExpected = new ErrorResourceKey('ErrNumberOrStringExpected')
  public static ErrClosingBracketExpected = new ErrorResourceKey('ErrClosingBracketExpected')
  public static ErrEmptyInvalidIdentifier = new ErrorResourceKey('ErrEmptyInvalidIdentifier')
  public static ErrIncompatibleTypes = new ErrorResourceKey('ErrIncompatibleTypes')
  public static ErrIncompatibleTypesForEquality_Left_Right = new ErrorResourceKey(
    'ErrIncompatibleTypesForEquality_Left_Right',
  )
  public static ErrServiceFunctionUnknownOptionalParam_Name = new ErrorResourceKey(
    'ErrServiceFunctionUnknownOptionalParam_Name',
  )
  public static ErrColumnTypeMismatch_ColName_ExpectedType_ActualType = new ErrorResourceKey(
    'ErrColumnTypeMismatch_ColName_ExpectedType_ActualType',
  )
  public static ErrColumnMissing_ColName_ExpectedType = new ErrorResourceKey('ErrColumnMissing_ColName_ExpectedType')
  public static ErrTableDoesNotAcceptThisType = new ErrorResourceKey('ErrTableDoesNotAcceptThisType')
  public static ErrTypeError = new ErrorResourceKey('ErrTypeError')
  public static ErrTypeError_Ex1_Ex2_Found = new ErrorResourceKey('ErrTypeError_Ex1_Ex2_Found')
  public static ErrTypeError_Arg_Expected_Found = new ErrorResourceKey('ErrTypeError_Arg_Expected_Found')
  public static ErrTypeErrorRecordIncompatibleWithSource = new ErrorResourceKey(
    'ErrTypeErrorRecordIncompatibleWithSource',
  )
  public static ErrExpectedStringLiteralArg_Name = new ErrorResourceKey('ErrExpectedStringLiteralArg_Name')
  public static ErrArgNotAValidIdentifier_Name = new ErrorResourceKey('ErrArgNotAValidIdentifier_Name')
  public static ErrColExists_Name = new ErrorResourceKey('ErrColExists_Name')
  public static ErrColConflict_Name = new ErrorResourceKey('ErrColConflict_Name')
  public static ErrColDNE_Name = new ErrorResourceKey('ErrColDNE_Name')
  public static ErrColumnDoesNotExist_Name_Similar = new ErrorResourceKey('ErrColumnDoesNotExist_Name_Similar')
  public static ErrSortIncorrectOrder = new ErrorResourceKey('ErrSortIncorrectOrder')
  public static ErrSortWrongType = new ErrorResourceKey('ErrSortWrongType')
  public static ErrFunctionDoesNotAcceptThisType_Function_Expected = new ErrorResourceKey(
    'ErrFunctionDoesNotAcceptThisType_Function_Expected',
  )
  public static ErrIncorrectFormat_Func = new ErrorResourceKey('ErrIncorrectFormat_Func')
  public static ErrAsyncLambda = new ErrorResourceKey('ErrAsyncLambda')
  public static ErrMultipleValuesForField_Name = new ErrorResourceKey('ErrMultipleValuesForField_Name')
  public static ErrScopeModificationLambda = new ErrorResourceKey('ErrScopeModificationLambda')
  public static ErrFunctionDisallowedWithinNondeterministicOperationOrder = new ErrorResourceKey(
    'ErrFunctionDisallowedWithinNondeterministicOperationOrder',
  )
  public static ErrBadRecordFieldType_FieldName_ExpectedType = new ErrorResourceKey(
    'ErrBadRecordFieldType_FieldName_ExpectedType',
  )
  public static ErrAsTypeAndIsTypeExpectConnectedDataSource = new ErrorResourceKey(
    'ErrAsTypeAndIsTypeExpectConnectedDataSource',
  )
  public static ErrInvalidControlReference = new ErrorResourceKey('ErrInvalidControlReference')
  public static ErrInvalidStringInterpolation = new ErrorResourceKey('ErrInvalidStringInterpolation')

  public static ErrErrorIrrelevantField = new ErrorResourceKey('ErrErrorIrrelevantField')
  public static ErrAsNotInContext = new ErrorResourceKey('ErrAsNotInContext')
  public static ErrValueMustBeFullyQualified = new ErrorResourceKey('ErrValueMustBeFullyQualified')
  public static WarnColumnNameSpecifiedMultipleTimes_Name = new ErrorResourceKey(
    'WarnColumnNameSpecifiedMultipleTimes_Name',
  )
  public static WarnLiteralPredicate = new ErrorResourceKey('WarnLiteralPredicate')
  public static WarnDynamicMetadata = new ErrorResourceKey('WarnDynamicMetadata')

  public static InfoMessage: StringGetter = (b?: string) => StringResources.Get('InfoMessage', b)
  public static InfoNode_Node: StringGetter = (b?: string) => StringResources.Get('InfoNode_Node', b)
  public static InfoTok_Tok: StringGetter = (b?: string) => StringResources.Get('InfoTok_Tok', b)
  public static FormatSpan_Min_Lim: StringGetter = (b?: string) => StringResources.Get('FormatSpan_Min_Lim', b)
  public static FormatErrorSeparator: StringGetter = (b?: string) => StringResources.Get('FormatErrorSeparator', b)

  public static SuggestRemoteExecutionHint = new ErrorResourceKey('SuggestRemoteExecutionHint')
  public static SuggestRemoteExecutionHint_InOpRhs = new ErrorResourceKey('SuggestRemoteExecutionHint_InOpRhs')
  public static SuggestRemoteExecutionHint_StringMatchSecondParam = new ErrorResourceKey(
    'SuggestRemoteExecutionHint_StringMatchSecondParam',
  )
  public static SuggestRemoteExecutionHint_InOpInvalidColumn = new ErrorResourceKey(
    'SuggestRemoteExecutionHint_InOpInvalidColumn',
  )
  public static OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn = new ErrorResourceKey(
    'SuggestRemoteExecutionHint_OpNotSupportedByColumn',
  )
  public static OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService = new ErrorResourceKey(
    'SuggestRemoteExecutionHint_OpNotSupportedByService',
  )
  public static OpNotSupportedByClientSuggestionMessage_OpNotSupportedByClient = new ErrorResourceKey(
    'SuggestRemoteExecutionHint_OpNotSupportedByClient',
  )

  public static ErrNamedFormula_MissingSemicolon = new ErrorResourceKey('ErrNamedFormula_MissingSemicolon')

  // ErrorResourceKey for creating an error from an arbitrary string message. The key resolves to "{0}", meaning
  // that a single string arg can be supplied representing the entire text of the error.
  public static ErrGeneralError = new ErrorResourceKey('ErrGeneralError')
}
