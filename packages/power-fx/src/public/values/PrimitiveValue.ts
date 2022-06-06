import { IRContext } from '../../ir/IRContext'
import { ValidFormulaValue } from './ValidFormulaValue'

export abstract class PrimitiveValue<T> extends ValidFormulaValue {
  protected readonly _value: T

  public get value(): T {
    return this._value
  }

  constructor(irContext: IRContext, value: T) {
    super(irContext)
    // Contract.Assert(value != null);
    this._value = value
  }

  public toObject(): any {
    return this._value
  }
}
