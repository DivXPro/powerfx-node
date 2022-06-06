import { IRContext } from '../../ir/IRContext'
import { FormulaType } from '../../public/types'
import {
  BlankValue,
  BooleanValue,
  DateTimeValue,
  DateValue,
  FormulaValue,
  NumberValue,
  StringValue,
  TableValue,
  TimeValue,
} from '../../public/values'
import DateTime from '../../utils/typescriptNet/Time/DateTime'
import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan'
import { CommonErrors } from './CommonErrors'
import { _epoch } from './LibraryUnary'
import { RuntimeHelpers } from './RuntimeHelpers'
import {
  LibStandardErrorHanding,
  ReturnBehavior,
  TargetFunctionSimple,
  TargetFunctionSimpleProps,
} from './StandardErrorHanding'

// #region Operator Standard Error Handling Wrappers
export const OperatorBinaryAdd = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericAdd,
)

export const OperatorBinaryMul = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericMul,
)

export const OperatorBinaryDiv = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.DivideByZeroChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericDiv,
)

export const OperatorBinaryGt = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericGt,
)

export const OperatorBinaryGeq = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericGeq,
)

export const OperatorBinaryLt = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericLt,
)

export const OperatorBinaryLeq = LibStandardErrorHanding.StandardErrorHandling<NumberValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWithZero,
  LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NumericLeq,
)

export const OperatorBinaryEq = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  AreEqual,
)

export const OperatorBinaryNeq = LibStandardErrorHanding.StandardErrorHandling(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  NotEqual,
)

export const OperatorTextIn = LibStandardErrorHanding.StandardErrorHandling(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  StringInOperator(false),
)

export const OperatorTextInExact = LibStandardErrorHanding.StandardErrorHandling(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  StringInOperator(true),
)

export const OperatorScalarTableIn = LibStandardErrorHanding.StandardErrorHandling(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  InScalarTableOperator(false),
)

export const OperatorScalarTableInExact = LibStandardErrorHanding.StandardErrorHandling(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.DeferRuntimeTypeChecking,
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  InScalarTableOperator(true),
)

export const OperatorAddDateAndTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.DateOrDateTime,
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  AddDateAndTime,
)

export const OperatorAddDateAndDay = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.DateOrDateTime,
    LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  ),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  AddDateAndDay,
)

export const OperatorAddDateTimeAndDay = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.DateOrDateTime,
    LibStandardErrorHanding.ExactValueTypeProvider('NumberValue'),
  ),
  LibStandardErrorHanding.FiniteChecker,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  AddDateTimeAndDay,
)

export const OperatorDateDifference = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  DateDifference,
)

export const OperatorTimeDifference = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.DoNotReplaceBlank,
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  DateDifference,
)

export const OperatorLtDateTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LtDateTime,
)

export const OperatorLeqDateTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LtDateTime,
)

export const OperatorGtDateTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GtDateTime,
)

export const OperatorGeqDateTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
    new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GeqDateTime,
)

export const OperatorLtDate = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LtDate,
)

export const OperatorLeqDate = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LeqDate,
)

export const OperatorGtDate = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GtDate,
)

export const OperatorGeqDate = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
    new DateValue(IRContext.NotInSource(FormulaType.Date), _epoch),
  ),
  LibStandardErrorHanding.ExactSequence(LibStandardErrorHanding.DateOrDateTime, LibStandardErrorHanding.DateOrDateTime),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GeqDate,
)

export const OperatorLtTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
  ),
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LtTime,
)

export const OperatorLeqTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
  ),
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  LeqTime,
)

export const OperatorGtTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
  ),
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GtTime,
)

export const OperatorGeqTime = LibStandardErrorHanding.StandardErrorHandling<FormulaValue>(
  LibStandardErrorHanding.NoArgExpansion,
  LibStandardErrorHanding.ReplaceBlankWith(
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
    new TimeValue(IRContext.NotInSource(FormulaType.Time), TimeSpan.zero),
  ),
  LibStandardErrorHanding.ExactSequence(
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
    LibStandardErrorHanding.ExactValueTypeProvider('TimeValue'),
  ),
  LibStandardErrorHanding.DeferRuntimeValueChecking,
  ReturnBehavior.AlwaysEvaluateAndReturnResult,
  GeqTime,
)

export function NumericAdd(props: { irContext: IRContext; values: NumberValue[] }): NumberValue {
  const { irContext, values: args } = props
  const result = args[0].value + args[1].value
  return new NumberValue(irContext, result)
}

export function NumericMul(props: { irContext: IRContext; values: NumberValue[] }): NumberValue {
  const { irContext, values: args } = props
  const result = args[0].value * args[1].value
  return new NumberValue(irContext, result)
}

export function NumericDiv(props: { irContext: IRContext; values: NumberValue[] }): NumberValue {
  const { irContext, values: args } = props
  const result = args[0].value / args[1].value
  return new NumberValue(irContext, result)
}

export function NumericGt(props: { irContext: IRContext; values: NumberValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const result = args[0].value > args[1].value
  return new BooleanValue(irContext, result)
}

export function NumericGeq(props: { irContext: IRContext; values: NumberValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const result = args[0].value >= args[1].value
  return new BooleanValue(irContext, result)
}

export function NumericLt(props: { irContext: IRContext; values: NumberValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const result = args[0].value < args[1].value
  return new BooleanValue(irContext, result)
}

export function NumericLeq(props: { irContext: IRContext; values: NumberValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const result = args[0].value <= args[1].value
  return new BooleanValue(irContext, result)
}

export function AreEqual(props: { irContext: IRContext; values: FormulaValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const arg1 = args[0]
  const arg2 = args[1]
  return new BooleanValue(irContext, RuntimeHelpers.AreEqual(arg1, arg2))
}

export function NotEqual(props: { irContext: IRContext; values: FormulaValue[] }): BooleanValue {
  const { irContext, values: args } = props
  const arg1 = args[0]
  const arg2 = args[1]
  return new BooleanValue(irContext, !RuntimeHelpers.AreEqual(arg1, arg2))
}

// See in_SS in JScript membershipReplacementFunctions
export function StringInOperator(exact: boolean): TargetFunctionSimple<FormulaValue> {
  return (props: TargetFunctionSimpleProps<FormulaValue>) => {
    const { irContext, values: args } = props
    const left = args[0]
    const right = args[1]
    if (left instanceof BlankValue) {
      return new BooleanValue(irContext, right instanceof BlankValue)
    }

    if (right instanceof BlankValue) {
      return new BooleanValue(irContext, false)
    }

    const leftStr = left as StringValue
    const rightStr = right as StringValue

    if (exact) {
      return new BooleanValue(irContext, rightStr.value.indexOf(leftStr.value) >= 0)
    }

    return new BooleanValue(irContext, rightStr.value.toLowerCase().indexOf(leftStr.value.toLowerCase()) >= 0)
  }
}

// Left is a scalar. Right is a single-column table.
// See in_ST()
export function InScalarTableOperator(exact: boolean): TargetFunctionSimple<FormulaValue> {
  return (props: TargetFunctionSimpleProps<FormulaValue>) => {
    const { irContext, values: args } = props
    let left = args[0]
    let right = args[1]

    if (!exact && left instanceof StringValue) {
      const strLhs = left
      left = strLhs.toLower()
    }

    const source = right as TableValue

    for (const row of source.rows) {
      if (row.isValue) {
        const rhs = row.value.fields[0].value

        if (!exact && rhs instanceof StringValue) {
          const strRhs = rhs
          right = strRhs.toLower()
        }

        if (RuntimeHelpers.AreEqual(left, rhs)) {
          return new BooleanValue(irContext, true)
        }
      }
    }

    return new BooleanValue(irContext, false)
  }
}

export function AddDateAndTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props

  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const arg1 = args[1] as TimeValue

  try {
    const result = arg0.add(arg1.value)
    return new DateTimeValue(irContext, result)
  } catch {
    return CommonErrors.ArgumentOutOfRange(irContext)
  }
}

export function AddDateAndDay(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const arg1 = args[1] as NumberValue

  try {
    const result = arg0.addDays(arg1.value)
    if (args[0] instanceof DateTimeValue) {
      return new DateTimeValue(irContext, result)
    } else {
      return new DateValue(irContext, result.date)
    }
  } catch {
    return CommonErrors.ArgumentOutOfRange(irContext)
  }
}

export function AddDateTimeAndDay(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const arg1 = args[1] as NumberValue

  try {
    var result = arg0.addDays(arg1.value)
    return new DateTimeValue(irContext, result)
  } catch {
    return CommonErrors.ArgumentOutOfRange(irContext)
  }
}

export function DateDifference(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0.subtract(arg1)
  return new TimeValue(irContext, result)
}

export function TimeDifference(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TimeValue
  const arg1 = args[1] as TimeValue

  var result = arg0.value.subtract(arg1.value)
  return new TimeValue(irContext, result)
}

export function LtDateTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 < arg1
  return new BooleanValue(irContext, result)
}

export function LeqDateTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 <= arg1
  return new BooleanValue(irContext, result)
}

export function GtDateTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 > arg1
  return new BooleanValue(irContext, result)
}

export function GeqDateTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 >= arg1
  return new BooleanValue(irContext, result)
}

export function LtDate(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 < arg1
  return new BooleanValue(irContext, result)
}

export function LeqDate(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 <= arg1
  return new BooleanValue(irContext, result)
}

export function GtDate(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 > arg1
  return new BooleanValue(irContext, result)
}

export function GeqDate(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  let arg0: DateTime
  if (args[0] instanceof DateTimeValue) {
    arg0 = args[0].value
  } else if (args[0] instanceof DateValue) {
    arg0 = args[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  let arg1: DateTime
  if (args[1] instanceof DateTimeValue) {
    arg1 = args[1].value
  } else if (args[1] instanceof DateValue) {
    arg1 = args[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const result = arg0 >= arg1
  return new BooleanValue(irContext, result)
}

export function LtTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TimeValue
  const arg1 = args[1] as TimeValue

  const result = arg0.value < arg1.value
  return new BooleanValue(irContext, result)
}

export function LeqTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TimeValue
  const arg1 = args[1] as TimeValue

  const result = arg0.value <= arg1.value
  return new BooleanValue(irContext, result)
}

export function GtTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TimeValue
  const arg1 = args[1] as TimeValue

  const result = arg0.value > arg1.value
  return new BooleanValue(irContext, result)
}

export function GeqTime(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TimeValue
  const arg1 = args[1] as TimeValue

  const result = arg0.value >= arg1.value
  return new BooleanValue(irContext, result)
}
