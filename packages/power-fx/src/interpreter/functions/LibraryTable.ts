import { IRContext } from '../../ir/IRContext'
import { ErrorKind } from '../../public/ErrorKind'
import { ExpressionError } from '../../public/ExpressionError'
import { TableType } from '../../public/types'
import {
  BlankValue,
  BooleanValue,
  DValue,
  ErrorValue,
  FormulaValue,
  InMemoryRecordValue,
  InMemoryTableValue,
  NamedValue,
  NumberValue,
  PrimitiveValue,
  RecordValue,
  StringValue,
  TableValue,
} from '../../public/values'
import { KeyValuePair } from '../../utils/types'
import DateTime from '../../utils/typescriptNet/Time/DateTime'
import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'
import { LambdaFormulaValue } from '../values/LambdaFormulaValue'
import { CommonErrors } from './CommonErrors'
import {
  TargetFunctionFullProps,
  TargetFunctionSimpleProps,
} from './StandardErrorHanding'

export function First(
  props: TargetFunctionSimpleProps<TableValue>
): FormulaValue {
  const { irContext, values: args } = props
  return args[0].rows[0]?.toFormulaValue() ?? new BlankValue(irContext)
}

export function Last(
  props: TargetFunctionSimpleProps<TableValue>
): FormulaValue {
  const { irContext, values: args } = props
  return (
    args[0].rows[args[0].rows.length]?.toFormulaValue() ??
    new BlankValue(irContext)
  )
}

export function FirstN(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TableValue
  const arg1 = args[1] as NumberValue

  const rows = arg0.rows.filter((row, idx) => idx < arg1.value)
  return new InMemoryTableValue(irContext, rows)
}

export function LastN(
  props: TargetFunctionSimpleProps<FormulaValue>
): FormulaValue {
  const { irContext, values: args } = props
  const arg0 = args[0] as TableValue
  const arg1 = args[1] as NumberValue

  // $$$ How to do on a streaming service?
  const allRows = [...arg0.rows]
  const len = allRows.length
  const take = arg1.value // $$$ rounding?

  //   let rows = allRows.Skip(len - take).Take(take)
  const rows = allRows.filter((row, idx) => len - take <= idx)

  return new InMemoryTableValue(irContext, rows)
}

// Create new table
export async function AddColumns(
  props: TargetFunctionFullProps<FormulaValue>
): Promise<FormulaValue> {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const sourceArg = args[0] as TableValue

  const newColumns = NamedLambda.Parse(args)

  const tableType = irContext.resultType as TableType
  const recordIRContext = new IRContext(
    irContext.sourceContext,
    tableType.toRecord()
  )
  const rows = await LazyAddColumns(
    runner,
    symbolContext,
    sourceArg.rows,
    recordIRContext,
    newColumns
  )

  return new InMemoryTableValue(irContext, rows)
}

export async function LazyAddColumns(
  runner: EvalVisitor,
  context: SymbolContext,
  sources: Array<DValue<RecordValue>>,
  recordIRContext: IRContext,
  newColumns: NamedLambda[]
): Promise<Array<DValue<RecordValue>>> {
  const arr: Array<DValue<RecordValue>> = []
  for (const row of sources) {
    if (row.isValue) {
      // $$$ this is super inefficient... maybe a custom derived RecordValue?
      const fields: Array<NamedValue> = [...row.value.fields]

      const childContext = context.withScopeValues(row.value)

      for (const column of newColumns) {
        const value = await column.lambda.evalAsync(runner, childContext)
        fields.push(new NamedValue(column.name, value))
      }

      arr.push(DValue.Of(new InMemoryRecordValue(recordIRContext, fields)))
    } else {
      arr.push(row)
    }
  }
  return arr
}

// CountRows
export function CountRows(
  props: TargetFunctionFullProps<TableValue>
): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const arg0 = args[0]

  // Streaming
  const count = arg0.rows.length
  return new NumberValue(irContext, count)
}

export async function CountIf(
  props: TargetFunctionFullProps<FormulaValue>
): Promise<FormulaValue> {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  // Streaming
  const sources = args[0] as TableValue
  const filter = args[1] as LambdaFormulaValue

  let count = 0

  const errors: Array<ErrorValue> = []

  for (const row of sources.rows) {
    if (row.isValue) {
      const childContext = symbolContext.withScopeValues(row.value)
      const result = await filter.evalAsync(runner, childContext)

      if (result instanceof ErrorValue) {
        errors.push(result)
        continue
      }

      const include = (result as BooleanValue).value

      if (include) {
        count++
      }
    }

    if (row.isError) {
      errors.push(row.error)
    }
  }

  if (errors.length != 0) {
    return ErrorValue.Combine(irContext, errors)
  }

  return new NumberValue(irContext, count)
}

// Filter ([1,2,3,4,5], Value > 5)
export function FilterTable(
  props: TargetFunctionFullProps<FormulaValue>
): FormulaValue {
  const { visitor: runner, symbolContext, irContext, values: args } = props

  // Streaming
  const arg0 = args[0] as TableValue
  const arg1 = args[1] as LambdaFormulaValue

  if (args.length > 2) {
    return new ErrorValue(
      irContext,
      new ExpressionError(
        'Filter() only supports one predicate',
        irContext.sourceContext,
        ErrorKind.Validation
      )
    )
  }
  const rows = LazyFilter(runner, symbolContext, arg0.rows, arg1)

  return new InMemoryTableValue(irContext, rows)
}

export async function SortTable(
  props: TargetFunctionFullProps<FormulaValue>
): Promise<FormulaValue> {
  const { visitor: runner, symbolContext, irContext, values: args } = props
  const arg0 = args[0] as TableValue
  const arg1 = args[1] as LambdaFormulaValue
  const arg2 = args[2] as StringValue
  const pairs: KeyValuePair<DValue<RecordValue>, FormulaValue>[] = []
  for (const row of arg0.rows) {
    if (row.isValue) {
      const childContext = symbolContext.withScopeValues(row.value)
      pairs.push({
        key: row,
        value: await arg1.evalAsync(runner, childContext),
      })
    } else {
      pairs.push({ key: row, value: row.toFormulaValue() })
    }
  }
  // const pairs: KeyValuePair<DValue<RecordValue>, FormulaValue>[] = arg0.rows.map((row) => {
  //   if (row.isValue) {
  //     const childContext = symbolContext.withScopeValues(row.value)
  //     return { key: row, value: arg1.evalAsync(runner, childContext) }
  //     //   return new KeyValuePair<DValue<RecordValue>, FormulaValue>(row, arg1.Eval(runner, childContext))
  //   }
  //   return { key: row, value: row.toFormulaValue() }
  //   // return new KeyValuePair<DValue<RecordValue>, FormulaValue>(row, row.ToFormulaValue())
  // })

  const errors = pairs
    .map((pair) => pair.value)
    .filter((value) => value instanceof ErrorValue) as Array<ErrorValue>

  const allNumbers = pairs.every((pair) =>
    IsValueTypeErrorOrBlank(pair.value, 'NumberValue')
  )
  const allStrings = pairs.every((pair) =>
    IsValueTypeErrorOrBlank(pair.value, 'StringValue')
  )
  const allBooleans = pairs.every((pair) =>
    IsValueTypeErrorOrBlank(pair.value, 'BooleanValue')
  )

  if (!(allNumbers || allStrings || allBooleans)) {
    errors.push(CommonErrors.RuntimeTypeMismatch(irContext))
    return ErrorValue.Combine(irContext, errors)
  }

  if (errors.length != 0) {
    return ErrorValue.Combine(irContext, errors)
  }

  let compareToResultModifier = 1
  if (arg2.value.toLowerCase() == 'descending') {
    compareToResultModifier = -1
  }

  if (allNumbers) {
    return SortValueType<NumberValue, number>(
      pairs,
      irContext,
      compareToResultModifier
    )
  } else if (allStrings) {
    return SortValueType<StringValue, string>(
      pairs,
      irContext,
      compareToResultModifier
    )
  } else {
    return SortValueType<BooleanValue, boolean>(
      pairs,
      irContext,
      compareToResultModifier
    )
  }
}

export function IsValueTypeErrorOrBlank(
  val: FormulaValue,
  type: string
): boolean {
  return (
    val.typeName === type ||
    val instanceof BlankValue ||
    val instanceof ErrorValue
  )
}

export function SortValueType<
  TPFxPrimitive extends PrimitiveValue<TDotNetPrimitive>,
  TDotNetPrimitive = number | DateTime | TimeSpan | boolean | string
>(
  pairs: Array<KeyValuePair<DValue<RecordValue>, FormulaValue>>,
  irContext: IRContext,
  compareToResultModifier: number
): FormulaValue {
  // where TPFxPrimitive : PrimitiveValue<TDotNetPrimitive>
  // where TDotNetPrimitive : IComparable<TDotNetPrimitive>
  pairs.sort((a, b) => {
    if (a.value instanceof BlankValue) {
      return b.value instanceof BlankValue ? 0 : 1
    } else if (b.value instanceof BlankValue) {
      return -1
    }

    const n1 = a.value as PrimitiveValue<any>
    const n2 = b.value as PrimitiveValue<any>
    if (typeof n1.value === 'boolean' || n1.value === 'number' || 'string') {
      if (n1.value === n2.value) {
        return 0
      } else {
        return n1.value > n2.value ? 1 : -1
      }
    }
    if (n1.value instanceof DateTime) {
      return n1.value.compareTo(n2.value)
    }
    if (n1.value instanceof TimeSpan) {
      return n1.value.compareTo(n2.value)
    }
    return -1
  })

  return new InMemoryTableValue(
    irContext,
    pairs.map((pair) => pair.key)
  )
}

export function LazyFilter(
  runner: EvalVisitor,
  context: SymbolContext,
  sources: Array<DValue<RecordValue>>,
  filter: LambdaFormulaValue
): Array<DValue<RecordValue>> {
  const arr: DValue<RecordValue>[] = []
  for (const row of sources) {
    if (row.isValue) {
      const childContext = context.withScopeValues(row.value)

      // Filter evals to a boolean
      const result = filter.evalAsync(runner, childContext)
      let include = false
      if (result instanceof BooleanValue) {
        include = result.value
      } else if (result instanceof ErrorValue) {
        arr.push(DValue.Of<RecordValue>(result))
      }
      if (include) {
        arr.push(row)
      }
    }
  }
  return arr
}

// AddColumns accepts pairs of args.
class NamedLambda {
  public name: string

  public lambda: LambdaFormulaValue

  constructor(name: string, lambda: LambdaFormulaValue) {
    this.name = name
    this.lambda = lambda
  }

  public static Parse(args: FormulaValue[]): NamedLambda[] {
    const list: Array<NamedLambda> = []

    for (let i = 1; i < args.length; i += 2) {
      const columnName = (args[1] as StringValue).value
      const arg1 = args[2] as LambdaFormulaValue
      list.push(new NamedLambda(columnName, arg1))
    }

    return list
  }
}
