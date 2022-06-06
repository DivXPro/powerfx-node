import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { IRContext } from '../../ir/IRContext'
import { FormulaType } from '../../public/types'
import {
  BlankValue,
  BooleanValue,
  DateTimeValue,
  DateValue,
  ErrorValue,
  FormulaValue,
  InMemoryTableValue,
  NumberValue,
  StringValue,
  TableValue,
  TimeValue,
  ValidFormulaValue,
} from '../../public/values'
import { isNullOrEmpty } from '../../utils/CharacterUtils'
import { CultureInfo } from '../../utils/CultureInfo'
import { StringBuilder } from '../../utils/StringBuilder'
import { LambdaFormulaValue } from '../values/LambdaFormulaValue'
import { CommonErrors } from './CommonErrors'
import { Library } from './Library'
import { DateTimeToNumber, DateToNumber } from './LibraryUnary'
import { TargetFunctionFullProps, TargetFunctionSimpleProps } from './StandardErrorHanding'

// Char is used for PA string escaping
export function Char(props: TargetFunctionSimpleProps<NumberValue>): StringValue {
  const { irContext, values: args } = props
  const arg0 = args[0]
  const str = String.fromCharCode(arg0.value)
  return new StringValue(irContext, str)
}

export async function Concat(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
  // Streaming
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const arg0 = args[0] as TableValue
  const arg1 = args[1] as LambdaFormulaValue

  const sb = new StringBuilder()

  for (const row of arg0.rows) {
    if (row.isValue) {
      const childContext = symbolContext.withScopeValues(row.value)

      // Filter eval to a boolean
      const result = await arg1.evalAsync(runner, childContext)

      const str = result as StringValue
      sb.append(str.value)
    }
  }

  return new StringValue(irContext, sb.toString())
}

// Scalar
// Operator & maps to this function call.
export function Concatenate(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  const sb = new StringBuilder()

  for (const arg of args) {
    sb.append(arg.value)
  }

  return new StringValue(irContext, sb.toString())
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-value
// Convert string to number
export function Value(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const arg0 = args[0]

  if (arg0 instanceof NumberValue) {
    return arg0
  }

  if (arg0 instanceof DateValue) {
    return DateToNumber({ irContext, values: [arg0] })
  }

  if (arg0 instanceof DateTimeValue) {
    return DateTimeToNumber({ irContext, values: [arg0] })
  }

  // let str = (arg0 as StringValue).value.trim()
  // const styles = NumberStyles.Any;
  let str: string = null

  if (arg0 instanceof StringValue) {
    str = arg0.value.trim()
  }

  if (isNullOrEmpty(str)) {
    return new BlankValue(irContext)
  }

  let div = 1
  if (str[str.length - 1] == '%') {
    str = str.substr(0, str.length - 1)
    div = 100
    // styles = NumberStyles.Number;
  } else if (str[0] == '%') {
    str = str.substr(1, str.length - 1)
    div = 100
    // styles = NumberStyles.Number;
  }

  let val = parseFloat(str)
  if (isNaN(val)) {
    return CommonErrors.InvalidNumberFormatError(irContext)
  }

  val /= div

  return new NumberValue(irContext, val)
}

// Convert string to boolean
export function Boolean(props: TargetFunctionFullProps<StringValue>): FormulaValue {
  const arg0 = props.values[0]

  const str = arg0.value.trim().toLowerCase()
  if (isNullOrEmpty(str)) {
    return new BlankValue(props.irContext)
  }

  if (str !== 'true' && str !== 'false') {
    return CommonErrors.InvalidBooleanFormatError(props.irContext)
  }

  return new BooleanValue(props.irContext, str === 'true')
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-text
export function Text(props: TargetFunctionFullProps<FormulaValue>): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  // only DateValue and DateTimeValue are supported for now with custom format strings.
  if (args.length > 1 && args[0] instanceof StringValue) {
    return CommonErrors.NotYetImplementedError(irContext, "Text() doesn't support format args for type StringValue")
  }

  let resultString: string
  let formatString: string

  if (args.length > 1 && args[1] instanceof StringValue) {
    formatString = args[1].value
  }

  // TODO:
  let suppliedCulture: CultureInfo
  // if (args.Length > 2 && args[2] is StringValue locale)
  // {
  //     suppliedCulture = new CultureInfo(locale.Value);
  // }

  switch (args[0].typeName) {
    case 'NumberValue':
      resultString = (args[0] as NumberValue).value.toString()
      // resultString = num.Value.ToString(formatString ?? "g", suppliedCulture ?? runner.CultureInfo);
      break
    case 'StringValue':
      resultString = (args[0] as StringValue).value
      break
    case 'DateValue':
      formatString = ExpandDateTimeFormatSpecifiers(formatString, suppliedCulture ?? runner.cultureInfo)
      resultString = (args[0] as DateValue).value.toString(formatString ?? 'yyyy/MM/dd')
      // resultString = (args[0] as DateValue).value.toString(formatString ?? 'M/d/yyyy', suppliedCulture ?? runner.CultureInfo)
      break
    case 'DateTimeValue':
      formatString = ExpandDateTimeFormatSpecifiers(formatString, suppliedCulture ?? runner.cultureInfo)
      resultString = (args[0] as DateTimeValue).value.toString(formatString)
      // formatString = ExpandDateTimeFormatSpecifiers(formatString, suppliedCulture ?? runner.CultureInfo);
      // resultString = dt.Value.ToString(formatString ?? "g", suppliedCulture ?? runner.CultureInfo);
      break
    case 'TimeValue':
      formatString = ExpandDateTimeFormatSpecifiers(formatString, suppliedCulture ?? runner.cultureInfo)
      resultString = (args[0] as TimeValue).value.toString(formatString)
      // formatString = ExpandDateTimeFormatSpecifiers(formatString, suppliedCulture ?? runner.CultureInfo);
      // resultString = _epoch.Add(t.Value).ToString(formatString ?? "t", suppliedCulture ?? runner.CultureInfo);
      break
    default:
      break
  }

  if (resultString != null) {
    return new StringValue(irContext, resultString)
  }

  return CommonErrors.NotYetImplementedError(irContext, `Text format for ${args[0]?.typeName}`)
}

export function ExpandDateTimeFormatSpecifiers(format: string, culture: CultureInfo): string {
  if (format == null) {
    return format
  }

  // TODO: 处理日期格式化现实问题
  // const info = DateTimeFormatInfo.GetInstance(culture)

  //忽略时区 使用zh-CN 本地时间
  const info_ShortDatePattern = 'yyyy/M/d'
  const info_ShortTimePattern = 'H:mm'
  const info_FullDateTimePattern = 'yyyy年M月d日 H:mm:ss'
  const info_LongTimePattern = 'H:mm:ss'
  const info_LongDatePattern = 'yyyy年M月d日'
  const info_UniversalSortableDateTimePattern = 'yyyy-MM-dd HH:mm:ssZ'

  switch (format.toLocaleLowerCase().replace(/^\'+|\'+$/, '')) {
    case 'shortdatetime24':
      // TODO: This might be wrong for some cultures
      return ReplaceWith24HourClock(info_ShortDatePattern + ' ' + info_ShortTimePattern)
    case 'shortdatetime':
      // TODO: This might be wrong for some cultures
      return info_ShortDatePattern + ' ' + info_ShortTimePattern
    case 'shorttime24':
      return ReplaceWith24HourClock(info_ShortTimePattern)
    case 'shorttime':
      return info_ShortTimePattern
    case 'shortdate':
      return info_ShortDatePattern
    case 'longdatetime24':
      return ReplaceWith24HourClock(info_FullDateTimePattern)
    case 'longdatetime':
      return info_FullDateTimePattern
    case 'longtime24':
      return ReplaceWith24HourClock(info_LongTimePattern)
    case 'longtime':
      return info_LongTimePattern
    case 'longdate':
      return info_LongDatePattern
    case 'utc':
      return info_UniversalSortableDateTimePattern
  }

  return format
}

export function ReplaceWith24HourClock(format: string) {
  // const pattern = '^(?<openAMPM>s*t+s*)? ' + '(?(openAMPM) h+(?<nonHours>[^ht]+)$ ' + '| s*h+(?<nonHours>[^ht]+)s*t+)'
  const pattern = '^(?<openAMPM>s*t+s*)? (?(openAMPM) h+(?<nonHours>[^ht]+)$ | s*h+(?<nonHours>[^ht]+)s*t+)/gi'
  // return new RegExp.replace(format, pattern, 'HH${nonHours}', RegexOptions.IgnorePatternWhitespace)
  return format.replace(pattern, 'HH${nonHours}')
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-isblank-isempty
// Take first non-blank value.
export async function Coalesce(props: TargetFunctionFullProps<FormulaValue>): Promise<FormulaValue> {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const errors: Array<ErrorValue> = []

  for (const arg of args) {
    const res = await runner.evalArgAsync<ValidFormulaValue>(arg, symbolContext, arg.irContext)

    if (res.isValue) {
      const val = res.value
      if (!(val instanceof StringValue && val.value === '')) {
        if (errors.length == 0) {
          return res.toFormulaValue()
        } else {
          return ErrorValue.Combine(irContext, errors)
        }
      }
    }

    if (res.isError) {
      errors.push(res.error)
    }
  }

  if (errors.length == 0) {
    return new BlankValue(irContext)
  } else {
    return ErrorValue.Combine(irContext, errors)
  }
}

export function Lower(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  return new StringValue(irContext, args[0].value.toLowerCase())
}

export function Upper(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  return new StringValue(irContext, args[0].value.toUpperCase())
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-len
export function Len(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  return new NumberValue(irContext, args[0].value.length)
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-left-mid-right
export function Mid(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const errors: Array<ErrorValue> = []
  const start = args[1] as NumberValue
  if (isNaN(start.value) || !isFinite(start.value) || start.value <= 0) {
    errors.push(CommonErrors.ArgumentOutOfRange(start.irContext))
  }

  const count = args[2] as NumberValue
  if (isNaN(count.value) || !isFinite(count.value) || count.value < 0) {
    errors.push(CommonErrors.ArgumentOutOfRange(count.irContext))
  }

  if (errors.length != 0) {
    return ErrorValue.Combine(irContext, errors)
  }

  const source = args[0] as StringValue
  const start0Based = start.value - 1
  if (source.value === '' || start0Based >= source.value.length) {
    return new StringValue(irContext, '')
  }

  const minCount = Math.min(count.value, source.value.length - start0Based)
  const result = source.value.substr(start0Based, minCount)

  return new StringValue(irContext, result)
}

export function Left(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const source = args[0] as StringValue
  const count = args[1] as NumberValue

  if (count.value >= source.value.length) {
    return source
  }

  return new StringValue(irContext, source.value.substr(0, count.value))
}

export function Right(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const source = args[0] as StringValue
  const count = args[1] as NumberValue

  if (count.value == 0) {
    return new StringValue(irContext, '')
  }

  if (count.value >= source.value.length) {
    return source
  }

  return new StringValue(irContext, source.value.substr(source.value.length - count.value, count.value))
}

export function Replace(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const source = args[0] as StringValue
  const start = args[1] as NumberValue
  const count = args[2] as NumberValue
  const replacement = args[3] as StringValue

  const start0Based = start.value - 1
  const prefix = start0Based < source.value.length ? source.value.substr(0, start0Based) : source.value

  const suffixIndex = start0Based + count.value
  const suffix = suffixIndex < source.value.length ? source.value.substr(suffixIndex) : ''
  const result = prefix + replacement.value + suffix

  return new StringValue(irContext, result)
}

export function Split(props: TargetFunctionFullProps<StringValue>): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const text = args[0].value
  const separator = args[1].value

  // The separator can be zero, one, or more characters that are matched as a whole in the text string. Using a zero length or blank
  // string results in each character being broken out individually.
  const substrings = isNullOrEmpty(separator) ? text.split('') : text.split(separator)
  const rows = substrings.map((s) => new StringValue(IRContext.NotInSource(FormulaType.String), s))

  return new InMemoryTableValue(
    irContext,
    Library.StandardSingleColumnTableFromValues(irContext, rows, BuiltinFunction.OneColumnTableResultName.toString()),
  )
}

export function Substitute(props: TargetFunctionSimpleProps<FormulaValue>): FormulaValue {
  const { irContext, values: args } = props
  const source = args[0] as StringValue

  if (args[1] instanceof BlankValue || (args[1] instanceof StringValue && isNullOrEmpty(args[1].value))) {
    return source
  }

  const match = args[1] as StringValue
  const replacement = args[2] as StringValue

  let instanceNum = -1
  if (args[3] instanceof NumberValue) {
    instanceNum = args[3].value
  }

  let sourceValue = source.value
  let idx = sourceValue.indexOf(match.value)
  if (instanceNum < 0) {
    while (idx >= 0) {
      const temp = sourceValue.substr(0, idx) + replacement.value
      sourceValue = sourceValue.substr(idx + match.value.length)
      const idx2 = sourceValue.indexOf(match.value)
      if (idx2 < 0) {
        idx = idx2
      } else {
        idx = temp.length + idx2
      }

      sourceValue = temp + sourceValue
    }
  } else {
    let num = 0
    while (idx >= 0 && ++num < instanceNum) {
      let idx2 = sourceValue.substr(idx + match.value.length).indexOf(match.value)
      if (idx2 < 0) {
        idx = idx2
      } else {
        idx += match.value.length + idx2
      }
    }

    if (idx >= 0 && num == instanceNum) {
      sourceValue = sourceValue.substr(0, idx) + replacement.value + sourceValue.substr(idx + match.value.length)
    }
  }

  return new StringValue(irContext, sourceValue)
}

export function StartsWith(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  const text = args[0]
  const start = args[1]

  return new BooleanValue(irContext, text.value.startsWith(start.value))
}

export function EndsWith(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  const text = args[0]
  const end = args[1]

  return new BooleanValue(irContext, text.value.endsWith(end.value))
}

export function Trim(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  const text = args[0]

  // Remove all whitespace except ASCII 10, 11, 12, 13 and 160, then trim to follow Excel's behavior
  const regex = /[^\S\xA0\n\v\f\r]+/

  const result = text.value.replace(regex, ' ').trim()

  return new StringValue(irContext, result)
}

export function TrimEnds(props: TargetFunctionSimpleProps<StringValue>): FormulaValue {
  const { irContext, values: args } = props
  const text = args[0]

  const result = text.value.trim()

  return new StringValue(irContext, result)
}
