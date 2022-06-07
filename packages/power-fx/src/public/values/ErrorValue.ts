import { FormulaValue } from './FormulaValue'
import { IRContext } from '../../ir/IRContext'
import { ExpressionError } from '../ExpressionError'
import { IValueVisitor } from './IValueVisitor'

export class ErrorValue extends FormulaValue {
  private _errors: ExpressionError[] = []

  constructor(
    irContext: IRContext,
    error?: ExpressionError | ExpressionError[]
  ) {
    super(irContext)
    if (error instanceof ExpressionError) {
      this.Add(error)
    } else {
      this._errors = error || []
    }
  }

  public get errors(): ExpressionError[] {
    return this._errors
  }

  public Add(error: ExpressionError): void {
    this._errors.push(error)
  }

  public toObject() {
    // This is strongly typed already.
    return this
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }

  public static AsErrorValue(value: FormulaValue) {
    if (value instanceof ErrorValue) {
      return value
    }
    return new ErrorValue(value.irContext, [])
  }

  public static Combine(
    irContext: IRContext,
    values: ErrorValue[]
  ): ErrorValue {
    return new ErrorValue(irContext, ErrorValue.CombineErrors(values))
  }

  private static CombineErrors(values: ErrorValue[]): ExpressionError[] {
    let arr: ExpressionError[] = []
    for (let v in values) {
      for (let error in values[v]._errors) {
        arr.push(values[v]._errors[error])
      }
    }
    return arr
  }
}
