import { IRContext } from '../../ir/IRContext'
import {
  BlankValue,
  BooleanValue,
  DateTimeValue,
  DateValue,
  FormulaValue,
  NumberValue,
  StringValue,
  TimeValue,
} from '../../public/values'
import DateTime from '../../utils/typescriptNet/Time/DateTime'
import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan'
import TimeUnit from '../../utils/typescriptNet/Time/TimeUnit'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'
import { CommonErrors } from './CommonErrors'

export function Today(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  // $$$ timezone?
  const datetime = DateTime.today

  return new DateValue(irContext, datetime)
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-now-today-istoday
export function IsToday(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  let arg0: DateTime
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value
  } else if (values[0] instanceof DateValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const now = DateTime.today
  const same = arg0.year === now.year && arg0.month === now.month && arg0.day === now.day
  return new BooleanValue(irContext, same)
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/show-text-dates-times
// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-dateadd-datediff
export function DateAdd(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props

  let datetime: DateTime
  if (values[0] instanceof DateTimeValue) {
    datetime = values[0].value
  } else if (values[0] instanceof DateValue) {
    datetime = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const delta = values[1] as NumberValue
  const units = values[2] as StringValue

  try {
    let newDate: DateTime
    switch (units.value.toLowerCase()) {
      case 'milliseconds':
        newDate = datetime.addMilliseconds(delta.value)
        break
      case 'seconds':
        newDate = datetime.addSeconds(delta.value)
        break
      case 'minutes':
        newDate = datetime.addMinutes(delta.value)
        break
      case 'hours':
        newDate = datetime.addHours(delta.value)
        break
      case 'days':
        newDate = datetime.addDays(delta.value)
        break
      case 'months':
        newDate = datetime.addMonths(delta.value)
        break
      case 'quarters':
        newDate = datetime.addMonths(delta.value * 3)
        break
      case 'years':
        newDate = datetime.addYears(delta.value)
        break
      default:
        // TODO: Task 10723372: Implement Unit Functionality in DateAdd, DateDiff Functions
        return CommonErrors.NotYetImplementedError(irContext, 'DateAdd Only supports Days for the unit field')
    }

    if (values[0] instanceof DateTimeValue) {
      return new DateTimeValue(irContext, newDate)
    } else {
      return new DateValue(irContext, newDate.date)
    }
  } catch {
    return CommonErrors.ArgumentOutOfRange(irContext)
  }
}

export function DateDiff(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props

  let start: DateTime
  if (values[0] instanceof DateTimeValue) {
    start = values[0].value
  } else if (values[0] instanceof DateValue) {
    start = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  let end: DateTime
  if (values[1] instanceof DateTimeValue) {
    end = values[1].value
  } else if (values[1] instanceof DateValue) {
    end = values[1].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const units = values[2] as StringValue

  const diff = DateTime.between(start, end)
  // The function DateDiff only returns a whole number of the units being subtracted, and the precision is given in the unit specified.
  switch (units.value.toLowerCase()) {
    case 'milliseconds':
      var milliseconds = Math.floor(diff.getTotalMilliseconds())
      return new NumberValue(irContext, milliseconds)
    case 'seconds':
      var seconds = Math.floor(diff.seconds)
      return new NumberValue(irContext, seconds)
    case 'minutes':
      var minutes = Math.floor(diff.minutes)
      return new NumberValue(irContext, minutes)
    case 'hours':
      var hours = Math.floor(diff.hours)
      return new NumberValue(irContext, hours)
    case 'days':
      var days = Math.floor(diff.days)
      return new NumberValue(irContext, days)
    case 'months':
      const months = (end.year - start.year) * 12 + end.month - start.month
      return new NumberValue(irContext, months)
    case 'quarters':
      const quarters = (end.year - start.year) * 4 + Math.floor(end.month / 3.0) - Math.floor(start.month / 3.0)
      return new NumberValue(irContext, quarters)
    case 'years':
      const years = end.year - start.year
      return new NumberValue(irContext, years)
    default:
      // TODO: Task 10723372: Implement Unit Functionality in DateAdd, DateDiff Functions
      return CommonErrors.NotYetImplementedError(irContext, 'DateDiff Only supports Days for the unit field')
  }
}

// // https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-datetime-parts
export function Year(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    // TODO: Standardize the number 0 - year 1900 logic
    return new NumberValue(irContext, 1900)
  }

  let arg0: DateTime
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value
  } else if (values[0] instanceof DateValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const x = arg0.year
  return new NumberValue(irContext, x)
}

export function Day(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    return new NumberValue(irContext, 0)
  }

  let arg0: DateTime
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value
  } else if (values[0] instanceof DateValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const x = arg0.day
  return new NumberValue(irContext, x)
}

export function Month(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    return new NumberValue(irContext, 1)
  }

  let arg0: DateTime
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value
  } else if (values[0] instanceof DateValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  const x = arg0.month
  return new NumberValue(irContext, x)
}

export function Hour(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    return new NumberValue(irContext, 0)
  }

  let arg0: TimeSpan
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value.timeOfDay
  } else if (values[0] instanceof TimeValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  const x = arg0.hours
  return new NumberValue(irContext, x)
}

export function Minute(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    return new NumberValue(irContext, 0)
  }

  let arg0: TimeSpan
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value.timeOfDay
  } else if (values[0] instanceof TimeValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const x = arg0.minutes
  return new NumberValue(irContext, x)
}

export function Second(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  if (values[0] instanceof BlankValue) {
    return new NumberValue(irContext, 0)
  }

  let arg0: TimeSpan
  if (values[0] instanceof DateTimeValue) {
    arg0 = values[0].value.timeOfDay
  } else if (values[0] instanceof TimeValue) {
    arg0 = values[0].value
  } else {
    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  const x = arg0.seconds
  return new NumberValue(irContext, x)
}

// // https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-date-time
// // Date(Year,Month,Day)
export function Date2(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  // $$$ fix impl
  const year = values[0].value
  const month = values[1].value
  const day = values[2].value

  // The final date is built up this way to allow for inputs which overflow,
  // such as: Date(2000, 25, 69) -> 3/10/2002
  const result = new DateTime(new Date(year, 0, 1)).addMonths(month - 1).addDays(day - 1)

  return new DateValue(irContext, result)
}

export function Time(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const hour = values[0].value
  const minute = values[1].value
  const second = values[2].value
  const millisecond = values[3].value

  // The final time is built up this way to allow for inputs which overflow,
  // such as: Time(10, 70, 360) -> 11:16 AM
  const result = new TimeSpan(hour, TimeUnit.Hours)
    .add(new TimeSpan(minute, TimeUnit.Minutes))
    .add(new TimeSpan(second, TimeUnit.Seconds))
    .add(TimeSpan.fromMilliseconds(millisecond))

  return new TimeValue(irContext, result)
}

export function Now(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  return new DateTimeValue(irContext, DateTime.now)
}

export function DateParse(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: StringValue[]
}): FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  const str = values[0].value
  // TODO: 考虑visitor.CultureInfo, DateTimeStyles.None
  const result = DateTime.TryParse(str)
  if (result[0]) {
    return new DateValue(irContext, result[1])
  }
  return CommonErrors.InvalidDateTimeError(irContext)
  // if (DateTime.TryParse(str, visitor.CultureInfo, DateTimeStyles.None, out var result))
  // {
  //     return new DateValue(irContext, result.Date);
  // }
  // else
  // {
  //     return CommonErrors.InvalidDateTimeError(irContext);
  // }
}

export function DateTimeParse(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: StringValue[]
}): FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  const str = values[0].value
  const result = DateTime.TryParse(str)
  if (result[0]) {
    return new DateTimeValue(irContext, result[1])
  }
  return CommonErrors.InvalidDateTimeError(irContext)
  // if (DateTime.TryParse(str, visitor.CultureInfo, DateTimeStyles.None, out var result))
  // {
  //     return new DateTimeValue(irContext, result);
  // }
  // else
  // {
  //     return CommonErrors.InvalidDateTimeError(irContext);
  // }
}

export function TimeParse(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: StringValue[]
}): FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  const str = values[0].value
  const result = TimeSpan.tryParse(str)
  if (result[0]) {
    return new TimeValue(irContext, result[1])
  } else {
    return CommonErrors.InvalidDateTimeError(irContext)
  }
}

// export function TimeZoneOffset(irContext: IRContext, values: FormulaValue[]): FormulaValue {
//   const tzInfo = TimeZoneInfo.Local;
//   if (values.Length == 0)
//   {
//       var tzOffsetDays = tzInfo.GetUtcOffset(DateTime.Now).TotalDays;
//       return new NumberValue(irContext, tzOffsetDays * -1);
//   }
//   switch (values[0])
//   {
//       case DateTimeValue dtv:
//           return new NumberValue(irContext, tzInfo.GetUtcOffset(dtv.Value.ToUniversalTime()).TotalDays * -1);
//       case DateValue dv:
//           return new NumberValue(irContext, tzInfo.GetUtcOffset(dv.Value.ToUniversalTime()).TotalDays * -1);
//       default:
//           return CommonErrors.InvalidDateTimeError(irContext);
//   }
// }
