import {
  AbsFunction,
  AbsTableFunction,
  AcosFunction,
  AcosTableFunction,
  AcotFunction,
  AcotTableFunction,
  AddColumnsFunction,
  AmPmFunction,
  AmPmShortFunction,
  AsTypeFunction,
  Atan2Function,
  AtanFunction,
  AtanTableFunction,
  AverageFunction,
  AverageTableFunction,
  BlankFunction,
  BooleanFunction,
  BooleanFunction_UO,
  CharFunction,
  CharTFunction,
  CoalesceFunction,
  ColorFadeFunction,
  ColorFadeTFunction,
  ColorValueFunction,
  ConcatenateFunction,
  ConcatenateTableFunction,
  ConcatFunction,
  CosFunction,
  CosTableFunction,
  CotFunction,
  CotTableFunction,
  CountAFunction,
  CountFunction,
  CountIfFunction,
  CountRowsFunction,
  DateAddFunction,
  DateAddTFunction,
  DateDiffFunction,
  DateDiffTFunction,
  DateFunction,
  DateTimeValueFunction,
  DateValueFunction,
  DayFunction,
  DegreesFunction,
  DegreesTableFunction,
  EndsWithFunction,
  ExpFunction,
  ExpTableFunction,
  FilterFunction,
  FindFunction,
  FindTFunction,
  FirstLastFunction,
  FirstLastNFunction,
  ForAllFunction,
  HourFunction,
  IfErrorFunction,
  IfFunction,
  IndexFunction_UO,
  IntFunction,
  IntTableFunction,
  IsBlankFunction,
  IsBlankOptionSetValueFunction,
  IsClock24Function,
  IsErrorFunction,
  IsNumericFunction,
  ISOWeekNumFunction,
  IsTodayFunction,
  IsUTCTodayFunction,
  LeftRightScalarFunction,
  LeftRightScalarTableFunction,
  LeftRightTableScalarFunction,
  LeftRightTableTableFunction,
  LenFunction,
  LenTFunction,
  LnFunction,
  LnTableFunction,
  LogFunction,
  LogTFunction,
  LookUpFunction,
  LowerUpperFunction,
  LowerUpperTFunction,
  MidFunction,
  MidTFunction,
  MinMaxFunction,
  MinMaxTableFunction,
  MinuteFunction,
  ModFunction,
  ModTFunction,
  MonthFunction,
  MonthsLongFunction,
  MonthsShortFunction,
  NotFunction,
  NowFunction,
  ParseJsonFunction,
  PiFunction,
  PowerFunction,
  PowerTFunction,
  ProperFunction,
  ProperTFunction,
  RadiansFunction,
  RadiansTableFunction,
  RandBetweenFunction,
  RandFunction,
  ReplaceFunction,
  ReplaceTFunction,
  RGBAFunction,
  RoundDownScalarFunction,
  RoundDownTableFunction,
  RoundScalarFunction,
  RoundTableFunction,
  RoundUpScalarFunction,
  RoundUpTableFunction,
  SecondFunction,
  SequenceFunction,
  ShuffleFunction,
  SinFunction,
  SinTableFunction,
  SortByColumnsFunction,
  SortByColumnsOrderTableFunction,
  SortFunction,
  SplitFunction,
  SqrtFunction,
  SqrtTableFunction,
  StartsWithFunction,
  StdevPFunction,
  StdevPTableFunction,
  SubstituteFunction,
  SubstituteTFunction,
  SumFunction,
  SumTableFunction,
  SwitchFunction,
  TableFunction,
  TableFunction_UO,
  TanFunction,
  TanTableFunction,
  TextFunction,
  TextFunction_UO,
  TimeFunction,
  TimeValueFunction,
  TimeZoneOffsetFunction,
  TodayFunction,
  TrimEndsFunction,
  TrimEndsTFunction,
  TrimFunction,
  TrimTFunction,
  TruncFunction,
  TruncTableFunction,
  UTCNowFunction,
  UTCTodayFunction,
  ValueFunction,
  ValueFunction_UO,
  VariadicLogicalFunction,
  VarPFunction,
  VarPTableFunction,
  WeekdayFunction,
  WeekdaysLongFunction,
  WeekdaysShortFunction,
  WeekNumFunction,
  WithFunction,
  YearFunction,
  // Notify,
} from './builtins'
import { TexlFunction } from '../functions/TexlFunction'
import { IsBlankOrErrorFunction, IsBlankOrErrorOptionSetValueFunction } from './builtins/IsBlankOrError'
import { IsEmptyFunction } from './builtins/IsEmpty'

export const BuiltinFunctionsCore: Record<string, TexlFunction> = {
  AmPm: new AmPmFunction(),
  AmPmShort: new AmPmShortFunction(),
  Abs: new AbsFunction(),
  AbsT: new AbsTableFunction(),
  Acos: new AcosFunction(),
  AcosT: new AcosTableFunction(),
  Acot: new AcotFunction(),
  AcotT: new AcotTableFunction(),
  AddColumns: new AddColumnsFunction(),
  And: new VariadicLogicalFunction(true),
  AsType: new AsTypeFunction(),
  Atan: new AtanFunction(),
  AtanT: new AtanTableFunction(),
  Atan2: new Atan2Function(),
  Average: new AverageFunction(),
  AverageT: new AverageTableFunction(),
  Blank: new BlankFunction(),
  Clock24: new IsClock24Function(),
  Char: new CharFunction(),
  CharT: new CharTFunction(),
  Coalesce: new CoalesceFunction(),
  ColorFade: new ColorFadeFunction(),
  ColorFadeT: new ColorFadeTFunction(),
  ColorValue: new ColorValueFunction(),
  Concat: new ConcatFunction(),
  Concatenate: new ConcatenateFunction(),
  ConcatenateT: new ConcatenateTableFunction(),
  Cos: new CosFunction(),
  CosT: new CosTableFunction(),
  Cot: new CotFunction(),
  CotT: new CotTableFunction(),
  Count: new CountFunction(),
  CountA: new CountAFunction(),
  CountIf: new CountIfFunction(),
  CountRows: new CountRowsFunction(),
  Date: new DateFunction(),
  DateAdd: new DateAddFunction(),
  DateAddT: new DateAddTFunction(),
  DateDiff: new DateDiffFunction(),
  DateDiffT: new DateDiffTFunction(),
  DateTimeValue: new DateTimeValueFunction(),
  DateValue: new DateValueFunction(),
  Day: new DayFunction(),
  Degrees: new DegreesFunction(),
  DegreesT: new DegreesTableFunction(),
  EndsWith: new EndsWithFunction(),
  Error: new IsErrorFunction(),
  Exp: new ExpFunction(),
  ExpT: new ExpTableFunction(),
  Filter: new FilterFunction(),
  Find: new FindFunction(),
  FindT: new FindTFunction(),
  First: new FirstLastFunction(true),
  FirstN: new FirstLastNFunction(true),
  ForAll: new ForAllFunction(),
  Hour: new HourFunction(),
  If: new IfFunction(),
  IfError: new IfErrorFunction(),
  Int: new IntFunction(),
  IntT: new IntTableFunction(),
  IsBlank: new IsBlankFunction(),
  IsBlankOptionSetValue: new IsBlankOptionSetValueFunction(),
  IsBlankOrError: new IsBlankOrErrorFunction(),
  IsBlankOrErrorOptionSetValue: new IsBlankOrErrorOptionSetValueFunction(),
  IsEmpty: new IsEmptyFunction(),
  IsError: new IsErrorFunction(),
  IsToday: new IsTodayFunction(),
  IsNumeric: new IsNumericFunction(),
  ISOWeekNum: new ISOWeekNumFunction(),
  Last: new FirstLastFunction(false),
  LastN: new FirstLastNFunction(false),
  Left: new LeftRightScalarFunction(true),
  LeftTS: new LeftRightTableScalarFunction(true),
  LeftTT: new LeftRightTableTableFunction(true),
  LeftST: new LeftRightScalarTableFunction(true),
  Len: new LenFunction(),
  LenT: new LenTFunction(),
  Ln: new LnFunction(),
  LnT: new LnTableFunction(),
  Log: new LogFunction(),
  LogT: new LogTFunction(),
  LookUp: new LookUpFunction(),
  Lower: new LowerUpperFunction(true),
  LowerT: new LowerUpperTFunction(true),
  Max: new MinMaxFunction(false),
  MaxT: new MinMaxTableFunction(false),
  Mid: new MidFunction(),
  MidT: new MidTFunction(),
  Min: new MinMaxFunction(true),
  MinT: new MinMaxTableFunction(true),
  Minute: new MinuteFunction(),

  Mod: new ModFunction(),
  ModT: new ModTFunction(),
  Month: new MonthFunction(),

  MonthsLong: new MonthsLongFunction(),
  MonthsShort: new MonthsShortFunction(),
  Not: new NotFunction(),
  Now: new NowFunction(),
  Or: new VariadicLogicalFunction(false),
  Power: new PowerFunction(),
  PowerT: new PowerTFunction(),
  Pi: new PiFunction(),
  Proper: new ProperFunction(),
  ProperT: new ProperTFunction(),
  Radians: new RadiansFunction(),
  RadiansT: new RadiansTableFunction(),
  Rand: new RandFunction(),
  RandBetween: new RandBetweenFunction(),
  Replace: new ReplaceFunction(),
  ReplaceT: new ReplaceTFunction(),
  RGBA: new RGBAFunction(),
  Right: new LeftRightScalarFunction(false),
  RightTS: new LeftRightTableScalarFunction(false),
  RightTT: new LeftRightTableTableFunction(false),
  RightST: new LeftRightScalarTableFunction(false),
  Round: new RoundScalarFunction(),
  RoundT: new RoundTableFunction(),
  RoundDown: new RoundDownScalarFunction(),
  RoundDownT: new RoundDownTableFunction(),
  RoundUp: new RoundUpScalarFunction(),
  RoundUpT: new RoundUpTableFunction(),
  Second: new SecondFunction(),

  Sequence: new SequenceFunction(),
  Shuffle: new ShuffleFunction(),
  Sin: new SinFunction(),
  Sort: new SortFunction(),
  SortByColumns: new SortByColumnsFunction(),
  SortByColumnsOrderTable: new SortByColumnsOrderTableFunction(),
  SinT: new SinTableFunction(),
  Split: new SplitFunction(),
  Sqrt: new SqrtFunction(),
  SqrtT: new SqrtTableFunction(),
  StartsWith: new StartsWithFunction(),
  StdevP: new StdevPFunction(),
  StdevPT: new StdevPTableFunction(),
  Substitute: new SubstituteFunction(),
  SubstituteT: new SubstituteTFunction(),
  Sum: new SumFunction(),
  SumT: new SumTableFunction(),
  Switch: new SwitchFunction(),
  Table: new TableFunction(),
  Tan: new TanFunction(),
  TanT: new TanTableFunction(),
  Time: new TimeFunction(),

  TimeValue: new TimeValueFunction(),
  TimeZoneOffset: new TimeZoneOffsetFunction(),
  Today: new TodayFunction(),

  Trim: new TrimFunction(),
  TrimT: new TrimTFunction(),
  TrimEnds: new TrimEndsFunction(),
  TrimEndsT: new TrimEndsTFunction(),
  Trunc: new TruncFunction(),
  TruncT: new TruncTableFunction(),
  Upper: new LowerUpperFunction(false),
  UpperT: new LowerUpperTFunction(false),
  Value: new ValueFunction(),

  VarP: new VarPFunction(),
  VarPT: new VarPTableFunction(),
  Text: new TextFunction(),

  Weekday: new WeekdayFunction(),
  WeekdaysLong: new WeekdaysLongFunction(),
  WeekdaysShort: new WeekdaysShortFunction(),
  WeekNum: new WeekNumFunction(),
  With: new WithFunction(),
  Year: new YearFunction(),

  // NOTE: These functions should not be part of the core library until they are implemented in all runtimes
  Index_UO: new IndexFunction_UO(),
  ParseJson: new ParseJsonFunction(),
  Table_UO: new TableFunction_UO(),
  Text_UO: new TextFunction_UO(),
  Value_UO: new ValueFunction_UO(),
  Boolean: new BooleanFunction(),
  Boolean_UO: new BooleanFunction_UO(),

  // NOTE: These functions should not be part of the core library until they are implemented in all runtimes
  IsUTCToday: new IsUTCTodayFunction(),
  UTCNow: new UTCNowFunction(),
  UTCToday: new UTCTodayFunction(),

  // behavior functions
  // Notify: new Notify(),
}

export const BuiltinFunctionsLibrary = Object.keys(BuiltinFunctionsCore).map((name) => BuiltinFunctionsCore[name])
