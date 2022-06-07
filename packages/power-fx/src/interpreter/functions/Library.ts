import { BuiltinFunction } from '../../functions/BuiltinFunction';
import { TexlFunction } from '../../functions/TexlFunction';
import { IRContext } from '../../ir/IRContext';
import { FormulaType, RecordType, TableType } from '../../public/types';
import {
  BlankValue,
  BooleanValue,
  UntypedObjectValue,
  DValue,
  ErrorValue,
  FormulaValue,
  FormulaValueStatic,
  InMemoryRecordValue,
  InMemoryTableValue,
  NamedValue,
  NumberValue,
  RecordValue,
  StringValue,
  TableValue,
  ValidFormulaValue,
} from '../../public/values';
import { Dictionary } from '../../utils/Dictionary';
import { EvalVisitor } from '../EvalVisitor';
import { SymbolContext } from '../SymbolContext';
import { LambdaFormulaValue } from '../values/LambdaFormulaValue';
import { CommonErrors } from './CommonErrors';
import * as LibraryDate from './LibraryDate';
import * as LibraryLogical from './LibraryLogical';
import * as LibraryMath from './LibraryMath';
import * as LibraryOperators from './LibraryOperators';
import * as LibraryTable from './LibraryTable';
import * as LibraryText from './LibraryText';
import * as LibraryUnary from './LibraryUnary';
import * as LibraryUntypedObject from './LibraryUntypedObject';
import { RuntimeHelpers } from './RuntimeHelpers';
import {
  LibStandardErrorHanding,
  ReturnBehavior,
  TargetFunctionFull,
  TargetFunctionFullProps,
} from './StandardErrorHanding';
import { UntypedObjectArrayChecker } from './LibraryUntypedObject';
import { BuiltinFunctionsCore } from '../../texl/BuiltinFunctionsCore';
import { DType, ErrorType, TypedName } from '../../types';
import { ExpressionError } from '../../public';
import { DName } from '../../utils';

export declare type FunctionPtr = TargetFunctionFull<FormulaValue>;

export class Library {
  // functions of StandardErrorHanding
  public static IsInvalidDouble = LibStandardErrorHanding.IsInvalidDouble;
  public static StandardErrorHandling = LibStandardErrorHanding.StandardErrorHandling;
  public static StandardSingleColumnTable = LibStandardErrorHanding.StandardSingleColumnTable;
  public static GetMaxTableSize = LibStandardErrorHanding.GetMaxTableSize;
  public static ExpandToSize = LibStandardErrorHanding.ExpandToSize;
  public static Transpose = LibStandardErrorHanding.Transpose;
  public static MultiSingleColumnTable = LibStandardErrorHanding.MultiSingleColumnTable;
  public static InsertDefaultValues = LibStandardErrorHanding.InsertDefaultValues;
  public static MidFunctionExpandArgs = LibStandardErrorHanding.MidFunctionExpandArgs;
  public static ReplaceBlankWithZero = LibStandardErrorHanding.ReplaceBlankWithZero;
  public static ReplaceBlankWithEmptyString = LibStandardErrorHanding.ReplaceBlankWithEmptyString;
  public static ReplaceBlankWith = LibStandardErrorHanding.ReplaceBlankWith;
  public static ReplaceBlankWithZeroForSpecificIndices =
    LibStandardErrorHanding.ReplaceBlankWithZeroForSpecificIndices;
  public static ExactValueTypeProvider = LibStandardErrorHanding.ExactValueTypeProvider;
  public static ExactValueType = LibStandardErrorHanding.ExactValueType;
  public static ExactValueTypeOrBlankProvider =
    LibStandardErrorHanding.ExactValueTypeOrBlankProvider;
  public static ExactValueTypeOrBlank = LibStandardErrorHanding.ExactValueTypeOrBlank;
  public static ExactValueTypeOrTableOrBlankProvider =
    LibStandardErrorHanding.ExactValueTypeOrTableOrBlankProvider;
  public static ExactValueTypeOrTableOrBlank = LibStandardErrorHanding.ExactValueTypeOrTableOrBlank;
  public static ExactSequence = LibStandardErrorHanding.ExactSequence;
  public static AddColumnsTypeChecker = LibStandardErrorHanding.AddColumnsTypeChecker;
  public static DateOrDateTime = LibStandardErrorHanding.DateOrDateTime;
  public static TimeOrDateTime = LibStandardErrorHanding.TimeOrDateTime;
  public static FiniteChecker = LibStandardErrorHanding.FiniteChecker;
  public static PositiveNumberChecker = LibStandardErrorHanding.PositiveNumberChecker;
  public static StrictPositiveNumberChecker = LibStandardErrorHanding.StrictPositiveNumberChecker;
  public static DivideByZeroChecker = LibStandardErrorHanding.DivideByZeroChecker;
  public static ReplaceChecker = LibStandardErrorHanding.ReplaceChecker;
  public static NoArgExpansion = LibStandardErrorHanding.NoArgExpansion;
  public static DoNotReplaceBlank = LibStandardErrorHanding.DoNotReplaceBlank;
  public static DeferRuntimeTypeChecking = LibStandardErrorHanding.DeferRuntimeTypeChecking;
  public static DeferRuntimeValueChecking = LibStandardErrorHanding.DeferRuntimeValueChecking;

  // functions of Date
  public static Today = LibraryDate.Today;
  public static IsToday = LibraryDate.IsToday;
  public static DateAdd = LibraryDate.DateAdd;
  public static DateDiff = LibraryDate.DateDiff;
  public static Year = LibraryDate.Year;
  public static Day = LibraryDate.Day;
  public static Month = LibraryDate.Month;
  public static Hour = LibraryDate.Hour;
  public static Minute = LibraryDate.Minute;
  public static Second = LibraryDate.Second;
  public static Date = LibraryDate.Date2;
  public static Time = LibraryDate.Time;
  public static Now = LibraryDate.Now;
  public static DateParse = LibraryDate.DateParse;
  public static DateTimeParse = LibraryDate.DateTimeParse;
  public static TimeParse = LibraryDate.TimeParse;
  // public static TimeZoneOffset = LibraryDate.TimeZoneOffset

  // functions of Logical
  public static And = LibraryLogical.And;
  public static Not = LibraryLogical.Not;
  public static Or = LibraryLogical.Or;

  // function of Math
  public static Abs = LibraryMath.Abs;
  public static Average = LibraryMath.Average;
  public static AverageTable = LibraryMath.AverageTable;
  public static Exp = LibraryMath.Exp;
  public static Int = LibraryMath.Int;
  public static Ln = LibraryMath.Ln;
  public static Log = LibraryMath.Log;
  public static Max = LibraryMath.Max;
  public static MaxTable = LibraryMath.MaxTable;
  public static Min = LibraryMath.Min;
  public static MinTable = LibraryMath.MinTable;
  public static Mod = LibraryMath.Mod;
  public static Power = LibraryMath.Power;
  public static Rand = LibraryMath.Rand;
  public static RandBetween = LibraryMath.RandBetween;
  public static Round = LibraryMath.Round;
  public static RoundDown = LibraryMath.RoundDown;
  public static RoundUp = LibraryMath.RoundUp;
  public static RunAggregator = LibraryMath.RunAggregator;
  public static RunAggregator2 = LibraryMath.RunAggregator2;
  public static Sequence = LibraryMath.Sequence;
  public static Sqrt = LibraryMath.Sqrt;
  public static Sum = LibraryMath.Sum;
  public static SumTable = LibraryMath.SumTable;

  // functions of Operator
  public static AddDateAndDay = LibraryOperators.AddDateAndDay;
  public static AddDateAndTime = LibraryOperators.AddDateAndTime;
  public static AddDateTimeAndDay = LibraryOperators.AddDateTimeAndDay;
  public static AreEqual = LibraryOperators.AreEqual;
  public static DateDifference = LibraryOperators.DateDifference;
  public static GeqDate = LibraryOperators.GeqDate;
  public static GeqDateTime = LibraryOperators.GeqDateTime;
  public static GeqTime = LibraryOperators.GeqTime;
  public static GtDate = LibraryOperators.GtDate;
  public static GtDateTime = LibraryOperators.GtDateTime;
  public static GtTime = LibraryOperators.GtTime;
  public static InScalarTableOperator = LibraryOperators.InScalarTableOperator;
  public static LeqDate = LibraryOperators.LeqDate;
  public static LeqDateTime = LibraryOperators.LeqDateTime;
  public static LeqTime = LibraryOperators.LeqTime;
  public static LtDate = LibraryOperators.LtDate;
  public static LtDateTime = LibraryOperators.LtDateTime;
  public static LtTime = LibraryOperators.LtTime;
  public static NotEqual = LibraryOperators.NotEqual;
  public static NumericAdd = LibraryOperators.NumericAdd;
  public static NumericDiv = LibraryOperators.NumericDiv;
  public static NumericGeq = LibraryOperators.NumericGeq;
  public static NumericGt = LibraryOperators.NumericGt;
  public static NumericLeq = LibraryOperators.NumericLeq;
  public static NumericLt = LibraryOperators.NumericLt;
  public static NumericMul = LibraryOperators.NumericMul;
  public static OperatorAddDateAndDay = LibraryOperators.OperatorAddDateAndDay;
  public static OperatorAddDateAndTime = LibraryOperators.OperatorAddDateAndTime;
  public static OperatorAddDateTimeAndDay = LibraryOperators.OperatorAddDateTimeAndDay;
  public static OperatorBinaryAdd = LibraryOperators.OperatorBinaryAdd;
  public static OperatorBinaryDiv = LibraryOperators.OperatorBinaryDiv;
  public static OperatorBinaryEq = LibraryOperators.OperatorBinaryEq;
  public static OperatorBinaryGeq = LibraryOperators.OperatorBinaryGeq;
  public static OperatorBinaryGt = LibraryOperators.OperatorBinaryGt;
  public static OperatorBinaryLeq = LibraryOperators.OperatorBinaryLeq;
  public static OperatorBinaryLt = LibraryOperators.OperatorBinaryLt;
  public static OperatorBinaryMul = LibraryOperators.OperatorBinaryMul;
  public static OperatorBinaryNeq = LibraryOperators.OperatorBinaryNeq;
  public static OperatorDateDifference = LibraryOperators.OperatorDateDifference;
  public static OperatorGeqDate = LibraryOperators.OperatorGeqDate;
  public static OperatorGeqDateTime = LibraryOperators.OperatorGeqDateTime;
  public static OperatorGeqTime = LibraryOperators.OperatorGeqTime;
  public static OperatorGtDate = LibraryOperators.OperatorGtDate;
  public static OperatorGtDateTime = LibraryOperators.OperatorGtDateTime;
  public static OperatorGtTime = LibraryOperators.OperatorGtTime;
  public static OperatorLeqDate = LibraryOperators.OperatorLeqDate;
  public static OperatorLeqDateTime = LibraryOperators.OperatorLeqDateTime;
  public static OperatorLeqTime = LibraryOperators.OperatorLeqTime;
  public static OperatorLtDate = LibraryOperators.OperatorLtDate;
  public static OperatorLtDateTime = LibraryOperators.OperatorLtDateTime;
  public static OperatorLtTime = LibraryOperators.OperatorLtTime;
  public static OperatorScalarTableIn = LibraryOperators.OperatorScalarTableIn;
  public static OperatorScalarTableInExact = LibraryOperators.OperatorScalarTableInExact;
  public static OperatorTextIn = LibraryOperators.OperatorTextIn;
  public static OperatorTextInExact = LibraryOperators.OperatorTextInExact;
  public static OperatorTimeDifference = LibraryOperators.OperatorTimeDifference;
  public static StringInOperator = LibraryOperators.StringInOperator;
  public static TimeDifference = LibraryOperators.TimeDifference;

  // functions of Table
  public static AddColumns = LibraryTable.AddColumns;
  public static CountIf = LibraryTable.CountIf;
  public static CountRows = LibraryTable.CountRows;
  public static FilterTable = LibraryTable.FilterTable;
  public static First = LibraryTable.First;
  public static FirstN = LibraryTable.FirstN;
  // private static IsValueTypeErrorOrBlank = LibraryTable.IsValueTypeErrorOrBlank
  public static Last = LibraryTable.Last;
  public static LastN = LibraryTable.LastN;
  // pirvate static LazyAddColumns = LibraryTable.LazyAddColumns
  // private static LazyFilter = LibraryTable.LazyFilter
  public static SortTable = LibraryTable.SortTable;
  // pirvate static SortValueType = LibraryTable.SortValueType

  // functions of Text
  public static Char = LibraryText.Char;
  public static Coalesce = LibraryText.Coalesce;
  public static Concat = LibraryText.Concat;
  public static Concatenate = LibraryText.Concatenate;
  public static EndsWith = LibraryText.EndsWith;
  public static ExpandDateTimeFormatSpecifiers = LibraryText.ExpandDateTimeFormatSpecifiers;
  public static Left = LibraryText.Left;
  public static Len = LibraryText.Len;
  public static Lower = LibraryText.Lower;
  public static Mid = LibraryText.Mid;
  public static Replace = LibraryText.Replace;
  public static Right = LibraryText.Right;
  public static Split = LibraryText.Split;
  public static StartsWith = LibraryText.StartsWith;
  public static Substitute = LibraryText.Substitute;
  public static Text = LibraryText.Text;
  public static Trim = LibraryText.Trim;
  public static TrimEnds = LibraryText.TrimEnds;
  public static Upper = LibraryText.Upper;
  public static Value = LibraryText.Value;
  public static Boolean = LibraryText.Boolean;

  // functions of CustomObject
  public static Text_UO = LibraryUntypedObject.Text_UO;
  public static Index_UO = LibraryUntypedObject.Index_UO;
  public static Value_UO = LibraryUntypedObject.Value_UO;
  public static Table_UO = LibraryUntypedObject.Table_UO;
  public static Boolean_UO = LibraryUntypedObject.Boolean_UO;

  // functions of unary
  public static BooleanToNumber = LibraryUnary.BooleanToNumber;
  public static BooleanToText = LibraryUnary.BooleanToText;
  public static DateTimeToDate = LibraryUnary.DateTimeToDate;
  public static DateTimeToNumber = LibraryUnary.DateTimeToNumber;
  public static DateTimeToTime = LibraryUnary.DateTimeToTime;
  public static DateToDateTime = LibraryUnary.DateToDateTime;
  public static DateToNumber = LibraryUnary.DateToNumber;
  public static NumberToBoolean = LibraryUnary.NumberToBoolean;
  public static NumberToDate = LibraryUnary.NumberToDate;
  public static NumberToDateTime = LibraryUnary.NumberToDateTime;
  public static NumberToText = LibraryUnary.NumberToText;
  public static NumberToTime = LibraryUnary.NumberToTime;
  public static NumericNegate = LibraryUnary.NumericNegate;
  public static NumericPercent = LibraryUnary.NumericPercent;
  public static TextToBoolean = LibraryUnary.TextToBoolean;
  public static TimeToDate = LibraryUnary.TimeToDate;
  public static TimeToDateTime = LibraryUnary.TimeToDateTime;
  public static TimeToNumber = LibraryUnary.TimeToNumber;

  private static _unaryOps = LibraryUnary._unaryOps;

  public static get UnaryOps() {
    return Library._unaryOps;
  }

  // public static declare FunctionPtr = (runner: EvalVisitor, symbolContext: SymbolContext, irContext: IRContext, args: FormulaValue[]) => FormulaValue
  public static get FunctionList(): Array<TexlFunction> {
    return Array.from(Library._funcsByName.keys());
  }

  // Some TexlFunctions are overloaded
  private static readonly _funcsByName = new Dictionary<TexlFunction, FunctionPtr>([
    [
      BuiltinFunctionsCore.Abs,
      Library.StandardErrorHandling(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Abs
      ),
    ],
    [
      BuiltinFunctionsCore.AddColumns,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.AddColumnsTypeChecker,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.AddColumns
      ),
    ],
    [BuiltinFunctionsCore.And, Library.And],
    [
      BuiltinFunctionsCore.Average,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Average
      ),
    ],
    [
      BuiltinFunctionsCore.AverageT,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.AverageTable
      ),
    ],
    [BuiltinFunctionsCore.Blank, Library.Blank],
    [
      BuiltinFunctionsCore.Boolean,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Boolean
      ),
    ],
    [
      BuiltinFunctionsCore.Boolean_UO,
      Library.StandardErrorHandling<UntypedObjectValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('UntypedObjectValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Boolean_UO
      ),
    ],
    [
      BuiltinFunctionsCore.Concat,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Concat
      ),
    ],
    [BuiltinFunctionsCore.Coalesce, Library.Coalesce],
    [
      BuiltinFunctionsCore.Char,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Char
      ),
    ],
    [
      BuiltinFunctionsCore.CharT,
      Library.StandardErrorHandling(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('TableValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.StandardSingleColumnTable<NumberValue>(Library.Char)
      ),
    ],
    [
      BuiltinFunctionsCore.Concatenate,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithEmptyString,
        Library.ExactValueTypeProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Concatenate
      ),
    ],
    [
      BuiltinFunctionsCore.ConcatenateT,
      Library.StandardErrorHandling(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrTableOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.MultiSingleColumnTable(
          Library.StandardErrorHandling<StringValue>(
            Library.NoArgExpansion,
            Library.ReplaceBlankWithEmptyString,
            Library.ExactValueTypeProvider('StringValue'),
            Library.DeferRuntimeValueChecking,
            ReturnBehavior.AlwaysEvaluateAndReturnResult,
            Library.Concatenate
          )
        )
      ),
    ],
    [
      BuiltinFunctionsCore.CountIf,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.CountIf
      ),
    ],
    [
      BuiltinFunctionsCore.CountRows,
      Library.StandardErrorHandling<TableValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('TableValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.CountRows
      ),
    ],
    [
      BuiltinFunctionsCore.Date,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.ExactSequence(
          Library.PositiveNumberChecker,
          Library.FiniteChecker,
          Library.FiniteChecker
        ),
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Date
      ),
    ],
    [
      BuiltinFunctionsCore.DateAdd,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(3, new BlankValue(IRContext.NotInSource(FormulaType.Blank))),
        Library.ReplaceBlankWith(
          new BlankValue(IRContext.NotInSource(FormulaType.Blank)),
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0),
          new StringValue(IRContext.NotInSource(FormulaType.String), 'days')
        ),
        Library.ExactSequence(
          Library.DateOrDateTime,
          Library.ExactValueTypeOrBlankProvider('NumberValue'),
          Library.ExactValueTypeOrBlankProvider('StringValue')
        ),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.DateAdd
      ),
    ],
    [
      BuiltinFunctionsCore.DateDiff,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(3, new BlankValue(IRContext.NotInSource(FormulaType.Blank))),
        Library.ReplaceBlankWith(
          new BlankValue(IRContext.NotInSource(FormulaType.Blank)),
          new BlankValue(IRContext.NotInSource(FormulaType.Blank)),
          new StringValue(IRContext.NotInSource(FormulaType.String), 'days')
        ),
        Library.ExactSequence(
          Library.DateOrDateTime,
          Library.DateOrDateTime,
          Library.ExactValueTypeOrBlankProvider('StringValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.DateDiff
      ),
    ],
    [
      BuiltinFunctionsCore.DateValue,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.DateParse
      ),
    ],
    [
      BuiltinFunctionsCore.DateTimeValue,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.DateTimeParse
      ),
    ],
    [
      BuiltinFunctionsCore.Day,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DateOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Day
      ),
    ],
    [
      BuiltinFunctionsCore.EndsWith,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnFalseIfAnyArgIsBlank,
        Library.EndsWith
      ),
    ],
    [
      BuiltinFunctionsCore.Error,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnFalseIfAnyArgIsBlank,
        Library.Error
      ),
    ],
    [
      BuiltinFunctionsCore.Exp,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Exp
      ),
    ],
    [
      BuiltinFunctionsCore.IsBlank,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.IsBlank
      ),
    ],
    [
      // Implementation 100% shared with IsBlank() for the interpreter
      BuiltinFunctionsCore.IsBlankOptionSetValue,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.IsBlank
      ),
    ],
    [BuiltinFunctionsCore.IsError, Library.IsError],
    [BuiltinFunctionsCore.IsBlankOrError, Library.IsBlankOrError],
    [BuiltinFunctionsCore.IsBlankOrErrorOptionSetValue, Library.IsBlankOrError],
    [
      BuiltinFunctionsCore.IsNumeric,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.IsNumeric
      ),
    ],
    [
      BuiltinFunctionsCore.IsToday,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DateOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnFalseIfAnyArgIsBlank,
        Library.IsToday
      ),
    ],
    [BuiltinFunctionsCore.If, Library.If],
    [BuiltinFunctionsCore.IfError, Library.IfError],
    [
      BuiltinFunctionsCore.Int,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Int
      ),
    ],
    [
      BuiltinFunctionsCore.Filter,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.FilterTable
      ),
    ],
    [
      BuiltinFunctionsCore.First,
      Library.StandardErrorHandling<TableValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('TableValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.First
      ),
    ],
    [
      BuiltinFunctionsCore.FirstN,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(
          2,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 1)
        ),
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.FirstN
      ),
    ],
    [
      BuiltinFunctionsCore.ForAll,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.ForAll
      ),
    ],
    [
      BuiltinFunctionsCore.Hour,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.TimeOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Hour
      ),
    ],
    [
      BuiltinFunctionsCore.Index_UO,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('UntypedObjectValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.ExactSequence(UntypedObjectArrayChecker, Library.StrictPositiveNumberChecker),
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Index_UO
      ),
    ],
    [
      BuiltinFunctionsCore.Last,
      Library.StandardErrorHandling<TableValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('TableValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Last
      ),
    ],
    [
      BuiltinFunctionsCore.LastN,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(
          2,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 1)
        ),
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.LastN
      ),
    ],
    [
      BuiltinFunctionsCore.Left,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.PositiveNumberChecker,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.Left
      ),
    ],
    [
      BuiltinFunctionsCore.Len,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithEmptyString,
        Library.ExactValueTypeProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Len
      ),
    ],
    [
      BuiltinFunctionsCore.LenT,
      Library.StandardErrorHandling(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('TableValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.StandardSingleColumnTable<StringValue>(Library.Len)
      ),
    ],
    [
      BuiltinFunctionsCore.Ln,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.StrictPositiveNumberChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Ln
      ),
    ],
    [
      BuiltinFunctionsCore.Log,
      Library.StandardErrorHandling<NumberValue>(
        Library.InsertDefaultValues(
          2,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 10)
        ),
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.StrictPositiveNumberChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Log
      ),
    ],
    [
      BuiltinFunctionsCore.Lower,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithEmptyString,
        Library.ExactValueTypeProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Lower
      ),
    ],
    [
      BuiltinFunctionsCore.Max,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Max
      ),
    ],
    [
      BuiltinFunctionsCore.MaxT,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.MaxTable
      ),
    ],
    [
      BuiltinFunctionsCore.Mid,
      Library.StandardErrorHandling<FormulaValue>(
        Library.MidFunctionExpandArgs,
        Library.ReplaceBlankWith(
          new StringValue(IRContext.NotInSource(FormulaType.String), ''),
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0),
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0)
        ),
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Mid
      ),
    ],
    [
      BuiltinFunctionsCore.Min,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Min
      ),
    ],
    [
      BuiltinFunctionsCore.MinT,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.MinTable
      ),
    ],
    [
      BuiltinFunctionsCore.Minute,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.TimeOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Minute
      ),
    ],
    [
      BuiltinFunctionsCore.Mod,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.DivideByZeroChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Mod
      ),
    ],
    [
      BuiltinFunctionsCore.Month,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DateOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Month
      ),
    ],
    [
      BuiltinFunctionsCore.Not,
      Library.StandardErrorHandling<BooleanValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWith(
          new BooleanValue(IRContext.NotInSource(FormulaType.Boolean), false)
        ),
        Library.ExactValueTypeProvider('BooleanValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Not
      ),
    ],
    [BuiltinFunctionsCore.Now, Library.Now],
    [BuiltinFunctionsCore.Or, Library.Or],
    [
      BuiltinFunctionsCore.Power,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Power
      ),
    ],
    [BuiltinFunctionsCore.Rand, Library.Rand],
    [
      BuiltinFunctionsCore.RandBetween,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.RandBetween
      ),
    ],
    [
      BuiltinFunctionsCore.Replace,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWith(
          new StringValue(IRContext.NotInSource(FormulaType.String), ''),
          new BlankValue(IRContext.NotInSource(FormulaType.Blank)),
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0),
          new StringValue(IRContext.NotInSource(FormulaType.String), '')
        ),
        Library.ExactSequence(
          Library.ExactValueTypeProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue'),
          Library.ExactValueTypeProvider('NumberValue'),
          Library.ExactValueTypeProvider('StringValue')
        ),
        Library.ReplaceChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Replace
      ),
    ],
    [
      BuiltinFunctionsCore.Right,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.PositiveNumberChecker,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.Right
      ),
    ],
    [
      BuiltinFunctionsCore.Round,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Round
      ),
    ],
    [
      BuiltinFunctionsCore.RoundUp,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.RoundUp
      ),
    ],
    [
      BuiltinFunctionsCore.RoundDown,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.RoundDown
      ),
    ],
    [
      BuiltinFunctionsCore.Second,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.TimeOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Second
      ),
    ],
    [
      BuiltinFunctionsCore.Sequence,
      Library.StandardErrorHandling<NumberValue>(
        Library.InsertDefaultValues(
          3,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 1)
        ),
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Sequence
      ),
    ],
    [
      BuiltinFunctionsCore.Sort,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(
          3,
          new StringValue(IRContext.NotInSource(FormulaType.String), 'Ascending')
        ),
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue'),
          Library.ExactValueTypeOrBlankProvider('StringValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.SortTable
      ),
    ],
    [
      BuiltinFunctionsCore.StartsWith,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnFalseIfAnyArgIsBlank,
        Library.StartsWith
      ),
    ],
    [
      BuiltinFunctionsCore.Sum,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Sum
      ),
    ],
    [
      BuiltinFunctionsCore.SumT,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactSequence(
          Library.ExactValueTypeOrBlankProvider('TableValue'),
          Library.ExactValueTypeOrBlankProvider('LambdaFormulaValue')
        ),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.SumTable
      ),
    ],
    [
      BuiltinFunctionsCore.Split,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithEmptyString,
        Library.ExactValueTypeProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Split
      ),
    ],
    [
      BuiltinFunctionsCore.Sqrt,
      Library.StandardErrorHandling<NumberValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.PositiveNumberChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Sqrt
      ),
    ],
    [
      BuiltinFunctionsCore.Substitute,
      Library.StandardErrorHandling<FormulaValue>(
        Library.InsertDefaultValues(4, new BlankValue(IRContext.NotInSource(FormulaType.Blank))),
        Library.ReplaceBlankWith(
          new StringValue(IRContext.NotInSource(FormulaType.String), ''),
          new BlankValue(IRContext.NotInSource(FormulaType.Blank)),
          new StringValue(IRContext.NotInSource(FormulaType.String), ''),
          new BlankValue(IRContext.NotInSource(FormulaType.Blank))
        ),
        Library.ExactSequence(
          Library.ExactValueTypeProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('StringValue'),
          Library.ExactValueTypeProvider('StringValue'),
          Library.ExactValueTypeOrBlankProvider('NumberValue')
        ),
        Library.StrictPositiveNumberChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Substitute
      ),
    ],
    [BuiltinFunctionsCore.Switch, Library.Switch],
    [BuiltinFunctionsCore.Switch, Library.Table],
    [
      BuiltinFunctionsCore.Table_UO,
      Library.StandardErrorHandling<UntypedObjectValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('UntypedObjectValue'),
        UntypedObjectArrayChecker,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Table_UO
      ),
    ],
    [
      BuiltinFunctionsCore.Text,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.Text
      ),
    ],
    [
      BuiltinFunctionsCore.Text_UO,
      Library.StandardErrorHandling<UntypedObjectValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('UntypedObjectValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.Text_UO
      ),
    ],
    [
      BuiltinFunctionsCore.Time,
      Library.StandardErrorHandling<NumberValue>(
        Library.InsertDefaultValues(
          4,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0)
        ),
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeOrBlankProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Time
      ),
    ],
    [
      BuiltinFunctionsCore.TimeValue,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.TimeParse
      ),
    ],
    // [
    //   BuiltinFunctionsCore.TimeZoneOffset,
    //   Library.StandardErrorHandling<FormulaValue>(
    //     Library.NoArgExpansion,
    //     Library.DoNotReplaceBlank,
    //     Library.DateOrDateTime,
    //     Library.DeferRuntimeValueChecking,
    //     ReturnBehavior.AlwaysEvaluateAndReturnResult,
    //     Library.TimeZoneOffset,
    //   ),
    // ],
    [BuiltinFunctionsCore.Today, Library.Today],
    [
      BuiltinFunctionsCore.Trim,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.Trim
      ),
    ],
    [
      BuiltinFunctionsCore.TrimEnds,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank,
        Library.TrimEnds
      ),
    ],
    [
      BuiltinFunctionsCore.Trunc,
      Library.StandardErrorHandling<NumberValue>(
        Library.InsertDefaultValues(
          2,
          new NumberValue(IRContext.NotInSource(FormulaType.Number), 0)
        ),
        Library.ReplaceBlankWithZero,
        Library.ExactValueTypeProvider('NumberValue'),
        Library.FiniteChecker,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.RoundDown
      ),
    ],
    [
      BuiltinFunctionsCore.Upper,
      Library.StandardErrorHandling<StringValue>(
        Library.NoArgExpansion,
        Library.ReplaceBlankWithEmptyString,
        Library.ExactValueTypeProvider('StringValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Upper
      ),
    ],
    [
      BuiltinFunctionsCore.Value,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Value
      ),
    ],
    [
      BuiltinFunctionsCore.Value_UO,
      Library.StandardErrorHandling<UntypedObjectValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.ExactValueTypeOrBlankProvider('UntypedObjectValue'),
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.Value
      ),
    ],
    [
      BuiltinFunctionsCore.With,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DeferRuntimeTypeChecking,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
        Library.With
      ),
    ],
    [
      BuiltinFunctionsCore.Year,
      Library.StandardErrorHandling<FormulaValue>(
        Library.NoArgExpansion,
        Library.DoNotReplaceBlank,
        Library.DateOrDateTime,
        Library.DeferRuntimeValueChecking,
        ReturnBehavior.AlwaysEvaluateAndReturnResult,
        Library.Year
      ),
    ],
  ]);

  public static get FuncsByName() {
    return Library._funcsByName;
  }

  public static StandardTableNodeRecords(
    irContext: IRContext,
    args: FormulaValue[]
  ): Array<DValue<RecordValue>> {
    return Library.StandardTableNodeRecordsCore(irContext, args);
  }

  public static StandardSingleColumnTableFromValues(
    irContext: IRContext,
    args: FormulaValue[],
    columnName: string
  ): Array<DValue<RecordValue>> {
    return Library.StandardTableNodeRecordsCore(irContext, args, columnName);
  }

  private static StandardTableNodeRecordsCore(
    irContext: IRContext,
    args: FormulaValue[],
    columnName: string = BuiltinFunction.ColumnName_ValueStr
  ): Array<DValue<RecordValue>> {
    const tableType = irContext.resultType as TableType;
    const recordType = tableType.toRecord();
    return args.map((arg) => {
      if (arg instanceof RecordValue) {
        return DValue.Of(arg);
      }

      // Handle the single-column-table case.
      const defaultField = new NamedValue(columnName, arg);
      return DValue.Of(new InMemoryRecordValue(IRContext.NotInSource(recordType), [defaultField]));
    });
  }

  public static Table(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor, symbolContext, irContext, values } = props;
    // Table literal
    const records = values.map((value) => {
      if (value instanceof RecordValue) {
        return DValue.Of<RecordValue>(value);
      } else if (value instanceof BlankValue) {
        return DValue.Of<RecordValue>(value);
      }
      return DValue.Of<RecordValue>(ErrorValue.AsErrorValue(value));
    });
    return new InMemoryTableValue(irContext, records);
  }

  public static Blank(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor, symbolContext, irContext, values } = props;
    return new BlankValue(irContext);
  }

  public static IsBlank(props: TargetFunctionFullProps<FormulaValue>) {
    const { visitor, symbolContext, irContext, values } = props;
    // Blank or empty.
    const arg0 = values[0];
    return new BooleanValue(irContext, Library.isBlank(arg0));
  }

  public static isBlank(arg: FormulaValue): boolean {
    if (arg instanceof BlankValue) {
      return true;
    }

    if (arg instanceof StringValue) {
      return arg.value.length == 0;
    }

    return false;
  }

  public static IsNumeric(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor, symbolContext, irContext, values } = props;
    const arg0 = values[0];
    return new BooleanValue(irContext, arg0 instanceof NumberValue);
  }

  public static With(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
    const { visitor, symbolContext, irContext, values: args } = props;
    const arg0 = args[0] as RecordValue;
    const arg1 = args[1] as LambdaFormulaValue;

    const childContext = symbolContext.withScopeValues(arg0);

    return arg1.evalAsync(visitor, childContext);
  }

  // // https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-if
  // // If(Condition, Then)
  // // If(Condition, Then, Else)
  // // If(Condition, Then, Condition2, Then2)
  // // If(Condition, Then, Condition2, Then2, Default)
  public static async If(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
    const { visitor: runner, symbolContext, irContext, values: args } = props;
    for (let i = 0; i < args.length - 1; i += 2) {
      const res = await runner.evalArgAsync<BooleanValue>(
        args[i],
        symbolContext,
        args[i].irContext
      );

      if (res.isValue) {
        const test = res.value;
        if (test.value) {
          const trueBranch = args[i + 1];

          return (
            await runner.evalArgAsync<ValidFormulaValue>(
              trueBranch,
              symbolContext,
              trueBranch.irContext
            )
          ).toFormulaValue();
        }
      }

      if (res.isError) {
        // Update error "type" to the type of the If function
        const resultContext = new IRContext(
          res.error.irContext.sourceContext,
          irContext.resultType
        );
        return new ErrorValue(resultContext, res.error.errors);
      }

      // False branch
      // If it's the last value in the list, it's the false-value
      if (i + 2 == args.length - 1) {
        const falseBranch = args[i + 2];
        return (
          await runner.evalArgAsync<ValidFormulaValue>(
            falseBranch,
            symbolContext,
            falseBranch.irContext
          )
        ).toFormulaValue();
      }

      // Else, if there are more values, this is another conditional.
      // It's another condition. Loop around
    }

    // If there's no value here, then use blank.
    return new BlankValue(irContext);
  }

  public static async IfError(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
    const { visitor: runner, symbolContext, irContext, values: args } = props;
    for (let i = 0; i < args.length - 1; i += 2) {
      const res = await runner.evalArgAsync<ValidFormulaValue>(
        args[i],
        symbolContext,
        args[i].irContext
      );

      if (res.isError) {
        // const trueBranch = args[i + 1]

        // return runner.evalArg<ValidFormulaValue>(trueBranch, symbolContext, trueBranch.irContext).toFormulaValue()
        const errorHandlingBranch = args[i + 1];
        const allErrors: Array<RecordValue> = [];
        for (const error of res.error.errors) {
          const kindProperty = new NamedValue('Kind', FormulaValueStatic.New(error.kind));
          const messageProperty = new NamedValue(
            'Message',
            error.message == null
              ? FormulaValueStatic.NewBlank(FormulaType.String)
              : FormulaValueStatic.New(error.message)
          );
          const errorScope = new InMemoryRecordValue(
            IRContext.NotInSource(new RecordType(ErrorType.ReifiedError())),
            [kindProperty, messageProperty]
          );
          allErrors.push(errorScope);
        }

        const scopeVariables: NamedValue[] = [
          new NamedValue('FirstError', allErrors[0]),
          new NamedValue(
            'AllErrors',
            new InMemoryTableValue(
              IRContext.NotInSource(new TableType(ErrorType.ReifiedErrorTable())),
              allErrors.map((e) => DValue.Of<RecordValue>(e))
            )
          ),
        ];
        const ifErrorScopeParamType = new RecordType(
          DType.CreateRecord(
            new TypedName(ErrorType.ReifiedError(), new DName('FirstError')),
            new TypedName(ErrorType.ReifiedErrorTable(), new DName('AllErrors'))
          )
        );
        const childContext = symbolContext.withScopeValues(
          new InMemoryRecordValue(IRContext.NotInSource(ifErrorScopeParamType), scopeVariables)
        );
        return (
          await runner.evalArgAsync<ValidFormulaValue>(
            errorHandlingBranch,
            childContext,
            errorHandlingBranch.irContext
          )
        ).toFormulaValue();
      }

      if (i + 1 == args.length - 1) {
        return res.toFormulaValue();
      }

      if (i + 2 == args.length - 1) {
        const falseBranch = args[i + 2];
        return (
          await runner.evalArgAsync<ValidFormulaValue>(
            falseBranch,
            symbolContext,
            falseBranch.irContext
          )
        ).toFormulaValue();
      }
    }

    return CommonErrors.UnreachableCodeError(irContext);
  }

  // Error({Kind:<error kind>,Message:<error message>})
  // Error(Table({Kind:<error kind 1>,Message:<error message 1>}, {Kind:<error kind 2>,Message:<error message 2>}))
  public static Error(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor: runner, symbolContext, irContext, values: args } = props;
    const result = new ErrorValue(irContext);

    const errorRecords: Array<RecordValue> = [];
    if (args[0] instanceof RecordValue) {
      const singleErrorRecord = args[0];
      errorRecords.push(singleErrorRecord);
    } else if (args[0] instanceof TableValue) {
      const errorTable = args[0];
      errorTable.rows.forEach((errorRow) => {
        if (errorRow.isValue) {
          errorRecords.push(errorRow.value);
        }
      });
    } else {
      return CommonErrors.RuntimeTypeMismatch(irContext);
    }
    for (let i = 0; i < errorRecords.length; i++) {
      const errorRecord = errorRecords[i];
      const messageField = errorRecord.getField(ErrorType.MessageFieldName) as StringValue;
      const kindField = errorRecord.getField(ErrorType.KindFieldName);
      if (kindField instanceof NumberValue) {
        result.Add(new ExpressionError(messageField?.value, undefined, kindField.value));
      } else {
        return CommonErrors.RuntimeTypeMismatch(irContext);
      }
    }

    return result;
  }

  // // Switch( Formula, Match1, Result1 [, Match2, Result2, ... [, DefaultResult ] ] )
  // // Switch(Formula, Match1, Result1, Match2,Result2)
  // // Switch(Formula, Match1, Result1, DefaultResult)
  // // Switch(Formula, Match1, Result1)
  public static async Switch(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
    const { visitor: runner, symbolContext, irContext, values: args } = props;
    const test = args[0];

    const errors: Array<ErrorValue> = [];

    if (test instanceof ErrorValue) {
      errors.push(test);
    }

    for (let i = 1; i < args.length - 1; i += 2) {
      const match = args[i] as LambdaFormulaValue;
      const matchValue = await match.evalAsync(runner, symbolContext);

      if (matchValue instanceof ErrorValue) {
        errors.push(matchValue);
      }

      const equal = RuntimeHelpers.AreEqual(test, matchValue);

      // Comparison?

      if (equal) {
        const lambda = args[i + 1] as LambdaFormulaValue;
        const result = await lambda.evalAsync(runner, symbolContext);
        if (errors.length != 0) {
          return ErrorValue.Combine(irContext, errors);
        } else {
          return result;
        }
      }
    }

    // Min length is 3.
    // 4,6,8.. mean we have an unpaired (match,result), which is a
    // a default result at the end
    if ((args.length - 4) % 2 == 0) {
      const lambda = args[args.length - 1] as LambdaFormulaValue;
      const result = lambda.evalAsync(runner, symbolContext);
      if (errors.length != 0) {
        return ErrorValue.Combine(irContext, errors);
      } else {
        return result;
      }
    }

    // No match
    if (errors.length != 0) {
      return ErrorValue.Combine(irContext, errors);
    } else {
      return new BlankValue(irContext);
    }
  }

  // ForAll([1,2,3,4,5], Value * Value)
  public static async ForAll(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
    const { visitor: runner, symbolContext, irContext, values: args } = props;
    // Streaming
    const arg0 = args[0] as TableValue;
    const arg1 = args[1] as LambdaFormulaValue;

    const rows = await Library.LazyForAll(runner, symbolContext, arg0.rows, arg1);

    // TODO: verify semantics in the case of heterogeneous record lists
    return new InMemoryTableValue(irContext, Library.StandardTableNodeRecords(irContext, rows));
  }

  private static async LazyForAll(
    runner: EvalVisitor,
    context: SymbolContext,
    sources: Array<DValue<RecordValue>>,
    filter: LambdaFormulaValue
  ): Promise<Array<FormulaValue>> {
    const arr: FormulaValue[] = [];
    for (const row of sources) {
      let childContext: SymbolContext;
      if (row.isValue) {
        childContext = context.withScopeValues(row.value);
      } else {
        childContext = context.withScopeValues(RecordValue.Empty());
      }

      // Filter evals to a boolean
      const result = await filter.evalAsync(runner, childContext);

      arr.push(result);
    }
    return arr;
  }

  public static IsError(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor, symbolContext, irContext, values: args } = props;
    const result = args[0] instanceof ErrorValue;
    return new BooleanValue(irContext, result);
  }

  public static IsBlankOrError(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
    const { visitor, symbolContext, irContext, values: args } = props;
    if (Library.isBlank(args[0]) || args[0] instanceof ErrorValue) {
      return new BooleanValue(irContext, true);
    }
    return new BooleanValue(irContext, false);
  }
}
