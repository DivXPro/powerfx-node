import { FormulaValue } from './FormulaValue'

export class NamedValue {
  public name: string
  public value: FormulaValue

  //   public NamedValue(KeyValuePair <string, FormulaValue > pair)
  //             : this(pair.Key, pair.Value)
  // {
  // }

  constructor(name: string, value: FormulaValue) {
    if (name) {
      this.name = name
    } else {
      throw new Error('NamedValue ArgumentNullException')
    }
    this.value = value
  }
}
