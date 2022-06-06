// // Support for aggregators. Helpers to ensure that Scalar and Tabular behave the same.

import { IRContext } from '../../ir/IRContext'
import { FormulaType } from '../../public/types/FormulaType'
import { BlankValue, ErrorValue, FormulaValue, InMemoryTableValue, NumberValue, TableValue } from '../../public/values'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'
import { LambdaFormulaValue } from '../values/LambdaFormulaValue'
import { CommonErrors } from './CommonErrors'
import { LibStandardErrorHanding } from './StandardErrorHanding'
import { Library } from './Library'
import { ExpressionError } from '../../public/ExpressionError'
import { ErrorKind } from '../../public/ErrorKind'

export interface IAggregator {
  apply: (value: FormulaValue) => void
  getResult: (irContext: IRContext) => FormulaValue
}

export class SumAgg implements IAggregator {
  protected _count: number
  protected _accumulator: number

  public apply(value: FormulaValue) {
    if (value instanceof BlankValue) {
      return
    }

    const n1 = value as NumberValue

    this._accumulator += n1.value
    this._count++
  }

  public getResult(irContext: IRContext): FormulaValue {
    if (this._count == 0) {
      return new BlankValue(irContext)
    }

    return new NumberValue(irContext, this._accumulator)
  }
}

export class MinAgg implements IAggregator {
  protected _minValue = Number.MAX_VALUE
  protected _count: number

  public apply(value: FormulaValue) {
    this._count++
    if (value instanceof BlankValue) {
      return
    }

    const n1 = value as NumberValue
    if (n1.value < this._minValue) {
      this._minValue = n1.value
    }
  }

  public getResult(irContext: IRContext): FormulaValue {
    if (this._count == 0) {
      return new BlankValue(irContext)
    }

    return new NumberValue(irContext, this._minValue)
  }
}

class MaxAgg implements IAggregator {
  protected _maxValue = Number.MIN_VALUE
  protected _count: number

  public apply(value: FormulaValue) {
    this._count++
    if (value instanceof BlankValue) {
      return
    }

    const n1 = value as NumberValue
    if (n1.value > this._maxValue) {
      this._maxValue = n1.value
    }
  }

  public getResult(irContext: IRContext): FormulaValue {
    if (this._count == 0) {
      return new BlankValue(irContext)
    }

    return new NumberValue(irContext, this._maxValue)
  }
}

class AverageAgg extends SumAgg {
  public getResult(irContext: IRContext): FormulaValue {
    if (this._count == 0) {
      return CommonErrors.DivByZeroError(irContext)
    }

    return new NumberValue(irContext, this._accumulator / this._count)
  }
}

export function RunAggregator(agg: IAggregator, irContext: IRContext, values: FormulaValue[]): FormulaValue {
  for (const value of values) {
    agg.apply(value)
  }

  return agg.getResult(irContext)
}

export async function RunAggregator2(
  agg: IAggregator,
  visitor: EvalVisitor,
  context: SymbolContext,
  irContext: IRContext,
  values: FormulaValue[],
): Promise<FormulaValue> {
  const arg0 = values[0] as TableValue
  const arg1 = values[1] as LambdaFormulaValue

  for (const row of arg0.rows) {
    if (row.isValue) {
      const childContext = context.withScopeValues(row.value)
      let value = await arg1.evalAsync(visitor, childContext)

      if (value instanceof NumberValue) {
        value = LibStandardErrorHanding.FiniteChecker(irContext, 0, value)
      }

      if (value instanceof ErrorValue) {
        return value
      }

      agg.apply(value)
    }
  }

  return agg.getResult(irContext)
}

export function Sqrt(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const n1 = values[0]

  const result = Math.sqrt(n1.value)

  return new NumberValue(irContext, result)
}

// Sum(1,2,3)
export function Sum(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props

  return RunAggregator(new SumAgg(), irContext, values)
}

// Sum([1,2,3], Value * Value)
export function SumTable(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> {
  const { visitor, symbolContext, irContext, values } = props
  return RunAggregator2(new SumAgg(), visitor, symbolContext, irContext, values)
}

// Max(1,2,3)
export function Max(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  return RunAggregator(new MaxAgg(), irContext, values)
}

// Max([1,2,3], Value * Value)
export function MaxTable(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> {
  const { visitor, symbolContext, irContext, values } = props
  return RunAggregator2(new MaxAgg(), visitor, symbolContext, irContext, values)
}

// Min(1,2,3)
export function Min(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  return RunAggregator(new MinAgg(), irContext, values)
}

// Min([1,2,3], Value * Value)
export function MinTable(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> {
  const { visitor, symbolContext, irContext, values } = props
  return RunAggregator2(new MinAgg(), visitor, symbolContext, irContext, values)
}

// Average ignores blanks.
// Average(1,2,3)
export function Average(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const { irContext, values } = props
  return RunAggregator(new AverageAgg(), irContext, values)
}

// Average([1,2,3], Value * Value)
export function AverageTable(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> | FormulaValue {
  const { visitor, symbolContext, irContext, values } = props
  const arg0 = values[0] as TableValue

  if (arg0.rows.length == 0) {
    return CommonErrors.DivByZeroError(irContext)
  }

  return RunAggregator2(new AverageAgg(), visitor, symbolContext, irContext, values)
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-mod
export function Mod(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const arg0 = values[0]
  const arg1 = values[1]

  return new NumberValue(irContext, arg0.value % arg1.value)
}

// https://docs.microsoft.com/en-us/powerapps/maker/canvas-apps/functions/function-sequence
export function Sequence(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const records = values[0].value
  const start = values[1].value
  const step = values[2].value

  const rows = LazySequence(records, start, step).map(
    (n) => new NumberValue(IRContext.NotInSource(FormulaType.Number), n),
  )

  return new InMemoryTableValue(irContext, Library.StandardTableNodeRecords(irContext, rows))
}

export function LazySequence(records: number, start: number, step: number) {
  let x = start
  const seq: number[] = []
  for (let i = 1; i <= records; i++) {
    seq.push(x)
    x += step
  }
  return seq
}

export function Abs(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const arg0 = values[0]
  const x = arg0.value
  const val = Math.abs(x)
  return new NumberValue(irContext, val)
}
export function Round(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const numberArg = values[0].value
  const digitsArg = values[1].value

  const x = round(numberArg, digitsArg)
  return new NumberValue(irContext, x)
}

export function round(number: number, digits: number) {
  if (digits == 0) {
    return Math.round(number)
  }

  const multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits))

  // Deal with catastrophic loss of precision
  if (isNaN(multiplier)) {
    return Math.round(number)
  }

  return Math.round(number * multiplier) / multiplier
}

// Char is used for PA string escaping
export function RoundUp(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const numberArg = values[0].value
  const digitsArg = values[1].value

  const x = roundUp(numberArg, digitsArg)
  return new NumberValue(irContext, x)
}

export function roundUp(number: number, digits: number): number {
  if (digits == 0) {
    return number < 0 ? Math.floor(number) : Math.ceil(number)
  }

  const multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits))

  // Contracts.Assert(multiplier != 0);

  // Deal with catastrophic loss of precision
  if (isNaN(multiplier)) {
    return number < 0 ? Math.floor(number) : Math.ceil(number)
  }

  // TASK: 74286: Spec corner case behavior: NaN, +Infinity, -Infinity.
  return number < 0 ? Math.floor(number * multiplier) / multiplier : Math.ceil(number * multiplier) / multiplier
}

export function RoundDown(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const numberArg = values[0].value
  const digitsArg = values[1].value

  const x = roundDown(numberArg, digitsArg)
  return new NumberValue(irContext, x)
}

export function roundDown(number: number, digits: number): number {
  if (digits == 0) {
    return number < 0 ? Math.ceil(number) : Math.floor(number)
  }

  const multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits))

  // DebugContracts.assert(multiplier !== 0);

  // Deal with catastrophic loss of precision
  if (isNaN(multiplier)) {
    return number < 0 ? Math.ceil(number) : Math.floor(number)
  }

  // TASK: 74286: Spec corner case behavior: NaN, +Infinity, -Infinity.
  return number < 0 ? Math.ceil(number * multiplier) / multiplier : Math.floor(number * multiplier) / multiplier
}

export function Int(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const arg0 = values[0]
  const x = arg0.value
  const val = Math.floor(x)
  return new NumberValue(irContext, val)
}

export function Ln(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const number = values[0].value
  return new NumberValue(irContext, Math.log(number))
}

export function Log(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const number = values[0].value
  const numberBase = values[1].value
  return new NumberValue(irContext, Math.log(number) / Math.log(numberBase))
}

export function Exp(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const exponent = values[0].value
  return new NumberValue(irContext, Math.pow(Math.E, exponent))
}

export function Power(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const number = values[0].value
  const exponent = values[1].value
  return new NumberValue(irContext, Math.pow(number, exponent))
}

export function Rand(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): FormulaValue {
  const { irContext, values } = props
  return new NumberValue(irContext, Math.random())
}

export function RandBetween(props: { irContext: IRContext; values: NumberValue[] }): FormulaValue {
  const { irContext, values } = props
  const lower = values[0].value
  const upper = values[1].value

  if (lower > upper) {
    return new ErrorValue(
      irContext,
      new ExpressionError('Lower value cannot be greater than Upper value', irContext.sourceContext, ErrorKind.Numeric),
    )
  }
  return new NumberValue(irContext, Math.floor(Math.random() * (upper - lower)) + lower)
}
