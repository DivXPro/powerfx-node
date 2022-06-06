import { BlankValue } from './BlankValue'
import { ErrorValue } from './ErrorValue'
import { FormulaValue } from './FormulaValue'
import { ValidFormulaValue } from './ValidFormulaValue'

export class DValue<T extends ValidFormulaValue> {
  private _value: T
  private _blank: BlankValue
  private _error: ErrorValue
  row: any

  constructor(value: T, blank?: BlankValue, error?: ErrorValue) {
    this._value = value
    this._blank = blank
    this._error = error
  }

  public static Of<T extends ValidFormulaValue>(t: BlankValue | ErrorValue | ValidFormulaValue): DValue<T> {
    if (t instanceof BlankValue) {
      return new DValue(null, t, null)
    } else if (t instanceof ErrorValue) {
      return new DValue(null, null, t)
    } else {
      return new DValue<T>(t as T, null, null)
    }
  }

  public get isValue(): boolean {
    return this._value != null
  }

  public isBlank(): boolean {
    return this._blank != null
  }
  public isError(): boolean {
    return this._error != null
  }

  public get value(): T {
    return this._value
  }
  public get blank(): BlankValue {
    return this._blank
  }
  public get error(): ErrorValue {
    return this._error
  }

  public toFormulaValue(): FormulaValue {
    if (this.isValue) return this.value
    else if (this.isBlank) return this.blank
    else return this.error
  }
}
