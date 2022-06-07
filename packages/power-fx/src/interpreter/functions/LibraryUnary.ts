import { UnaryOpKind } from '../../ir/node'
import {
  BooleanValue,
  DateTimeValue,
  DateValue,
  FormulaValue,
  NumberValue,
  StringValue,
  TimeValue,
} from '../../public/values'
import { Dictionary } from '../../utils/Dictionary'
import DateTime from '../../utils/typescriptNet/Time/DateTime'
import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan'
import { CommonErrors } from './CommonErrors'
import { FunctionPtr } from './Library'
import { DateParse, DateTimeParse, TimeParse } from './LibraryDate'
import { Text } from './LibraryText'
import {
  LibStandardErrorHanding,
  ReturnBehavior,
  TargetFunctionFullProps,
  TargetFunctionSimpleProps,
} from './StandardErrorHanding'
import { OptionSetValue } from '../../public/values/OptionSetValue'
import { OptionSet } from '../environment/OptionSet'
import { DName } from '../../utils'

export const _epoch = new DateTime(new Date(1899, 11, 30, 0, 0, 0, 0))

// export const UnaryOps => _unaryOps;

// #region Standard Error Handling Wrappers for Unary Operators
export const _unaryOps = new Dictionary<UnaryOpKind, FunctionPtr>([
  [
    UnaryOpKind.Negate,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.ReplaceBlankWithZero,
      LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.AlwaysEvaluateAndReturnResult,
      NumericNegate
    ),
  ],
  [
    UnaryOpKind.Percent,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.ReplaceBlankWithZero,
      LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.AlwaysEvaluateAndReturnResult,
      NumericPercent
    ),
  ],
  [
    UnaryOpKind.NumberToText,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      NumberToText
    ),
  ],
  [
    UnaryOpKind.NumberToBoolean,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      NumberToBoolean
    ),
  ],
  [
    UnaryOpKind.BooleanToText,
    LibStandardErrorHanding.StandardErrorHandling<BooleanValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('BooleanValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      BooleanToText
    ),
  ],
  [
    UnaryOpKind.BooleanToNumber,
    LibStandardErrorHanding.StandardErrorHandling<BooleanValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('BooleanValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      BooleanToNumber
    ),
  ],
  [
    UnaryOpKind.TextToBoolean,
    LibStandardErrorHanding.StandardErrorHandling<StringValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('StringValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      TextToBoolean
    ),
  ],
  [
    UnaryOpKind.DateToNumber,
    LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.DateOrDateTime,
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateToNumber
    ),
  ],
  [
    UnaryOpKind.NumberToDate,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      NumberToDate
    ),
  ],
  [
    UnaryOpKind.NumberToDateTime,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      NumberToDateTime
    ),
  ],
  [
    UnaryOpKind.DateToDateTime,
    LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.DateOrDateTime,
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateToDateTime
    ),
  ],
  [
    UnaryOpKind.DateTimeToDate,
    LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.DateOrDateTime,
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateTimeToDate
    ),
  ],
  [
    UnaryOpKind.TimeToNumber,
    LibStandardErrorHanding.StandardErrorHandling<TimeValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('TimeValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      TimeToNumber
    ),
  ],
  [
    UnaryOpKind.NumberToTime,
    LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('NumberValue'),
      LibStandardErrorHanding.FiniteChecker,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      NumberToTime
    ),
  ],
  [
    UnaryOpKind.DateTimeToTime,
    LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.DateOrDateTime,
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateTimeToTime
    ),
  ],
  [
    UnaryOpKind.DateToTime,
    LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.DateOrDateTime,
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateTimeToTime
    ),
  ],
  [
    UnaryOpKind.TimeToDate,
    LibStandardErrorHanding.StandardErrorHandling<TimeValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('TimeValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      TimeToDate
    ),
  ],
  [
    UnaryOpKind.TimeToDateTime,
    LibStandardErrorHanding.StandardErrorHandling<TimeValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('TimeValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      TimeToDateTime
    ),
  ],
  [
    UnaryOpKind.TextToDate,
    LibStandardErrorHanding.StandardErrorHandling<StringValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('StringValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateParse
    ),
  ],
  [
    UnaryOpKind.TextToDateTime,
    LibStandardErrorHanding.StandardErrorHandling<StringValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('StringValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      DateTimeParse
    ),
  ],
  [
    UnaryOpKind.TextToTime,
    LibStandardErrorHanding.StandardErrorHandling<StringValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('StringValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      TimeParse
    ),
  ],
  [
    UnaryOpKind.OptionSetToText,
    LibStandardErrorHanding.StandardErrorHandling<OptionSetValue>(
      LibStandardErrorHanding.NoArgExpansion,
      LibStandardErrorHanding.DoNotReplaceBlank,
      LibStandardErrorHanding.ExactValueTypeOrBlankProvider('OptionSetValue'),
      LibStandardErrorHanding.DeferRuntimeValueChecking,
      ReturnBehavior.ReturnBlankIfAnyArgIsBlank,
      OptionSetValueToString
    ),
  ],
])

// #endregion

// #region Unary Operator Implementations
export function NumericNegate(
  props: TargetFunctionSimpleProps<NumberValue>
): NumberValue {
  const { irContext, values: args } = props
  const result = -args[0].value
  return new NumberValue(irContext, result)
}

export function NumericPercent(
  props: TargetFunctionSimpleProps<NumberValue>
): NumberValue {
  const { irContext, values: args } = props
  const result = args[0].value / 100.0
  return new NumberValue(irContext, result)
}

export function NumberToText(
  props: TargetFunctionFullProps<NumberValue>
): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  return Text({ visitor: runner, symbolContext, irContext, values: args })
}

export function NumberToBoolean(
  props: TargetFunctionSimpleProps<NumberValue>
): BooleanValue {
  const { irContext, values: args } = props
  const n = args[0].value
  return new BooleanValue(irContext, n != 0.0)
}

export function BooleanToText(
  props: TargetFunctionSimpleProps<BooleanValue>
): StringValue {
  const { irContext, values: args } = props

  const b = args[0].value
  return new StringValue(irContext, PowerFxBooleanToString(b))
}

export function PowerFxBooleanToString(b: boolean): string {
  return b ? 'true' : 'false'
}

export function BooleanToNumber(
  props: TargetFunctionSimpleProps<BooleanValue>
): NumberValue {
  const { irContext, values: args } = props
  const b = args[0].value
  return new NumberValue(irContext, b ? 1.0 : 0.0)
}

export function TextToBoolean(
  props: TargetFunctionSimpleProps<StringValue>
): BooleanValue {
  const { irContext, values: args } = props
  const s = args[0].value
  return new BooleanValue(irContext, s === 'true')
}

export function DateToNumber(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const diff = arg0.subtract(_epoch).totalDays
  return new NumberValue(irContext, diff)
}

export function DateTimeToNumber(
  props: TargetFunctionSimpleProps<DateTimeValue>
): NumberValue {
  const { irContext, values: args } = props
  const d = args[0].value
  let diff = d.subtract(_epoch).totalDays
  return new NumberValue(irContext, diff)
}

export function NumberToDate(
  props: TargetFunctionSimpleProps<NumberValue>
): DateValue {
  const { irContext, values: args } = props
  const n = args[0].value
  const date = _epoch.addDays(n)
  return new DateValue(irContext, date)
}

export function NumberToDateTime(
  props: TargetFunctionSimpleProps<NumberValue>
): DateTimeValue {
  const { irContext, values: args } = props
  const n = args[0].value
  const date = _epoch.addDays(n)
  return new DateTimeValue(irContext, date)
}

export function DateToDateTime(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  if (args[0] instanceof DateTimeValue) {
    return args[0]
  } else if (args[0] instanceof DateValue) {
    return args[0]
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
}

export function DateTimeToDate(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  if (args[0] instanceof DateTimeValue) {
    const startOfDate = args[0].value.date
    return new DateValue(irContext, startOfDate)
  } else if (args[0] instanceof DateValue) {
    return args[0]
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
}

export function TimeToNumber(
  props: TargetFunctionSimpleProps<TimeValue>
): NumberValue {
  const { irContext, values: args } = props
  const t = args[0].value
  return new NumberValue(irContext, t.totalDays)
}

export function NumberToTime(
  props: TargetFunctionSimpleProps<NumberValue>
): TimeValue {
  const { irContext, values: args } = props
  const n = args[0].value
  const days = TimeSpan.fromDays(n)
  return new TimeValue(irContext, days)
}

export function DateTimeToTime(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const time = arg0.timeOfDay
  return new TimeValue(irContext, time)
}

export function TimeToDate(
  props: TargetFunctionSimpleProps<TimeValue>
): DateValue {
  const { irContext, values: args } = props
  const t = args[0].value
  const date = _epoch.add(t)
  return new DateValue(irContext, date.date)
}

export function TimeToDateTime(
  props: TargetFunctionSimpleProps<TimeValue>
): DateTimeValue {
  const { irContext, values: args } = props
  const t = args[0].value
  const date = _epoch.add(t)
  return new DateTimeValue(irContext, date)
}

export function OptionSetValueToString(
  props: TargetFunctionSimpleProps<OptionSetValue>
): FormulaValue {
  const { irContext, values: args } = props
  const os = args[0].type?._type?.optionSetInfo
  if (!(os instanceof OptionSet)) {
    return CommonErrors.UnreachableCodeError(irContext)
  }
  const option = args[0].option
  const result = os.options.tryGetValue(new DName(option))
  const displayName = result[1]
  if (!result[0]) {
    return CommonErrors.UnreachableCodeError(irContext)
  }
  return new StringValue(irContext, displayName.value)
}
// #endregion
