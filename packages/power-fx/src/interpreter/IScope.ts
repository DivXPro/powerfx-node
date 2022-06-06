import { FormulaValue } from '../public/values'
import { RecordValue } from '../public/values/RecordValue'

export interface IScope {
  resolve(name: string): FormulaValue
}

export class RecordScope implements IScope {
  public readonly _context: RecordValue
  constructor(context: RecordValue) {
    this._context = context
  }

  public resolve(name: string): FormulaValue {
    const field = this._context.fields.find((field) => field.name === name)
    return field?.value
  }
}
