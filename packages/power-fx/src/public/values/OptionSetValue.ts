import { FormulaValue } from './FormulaValue'
import { IRContext } from '../../ir'
import { IValueVisitor } from './IValueVisitor'

export class OptionSetValue extends FormulaValue {
  /// <summary>
  /// Logical name for this option set value.
  /// </summary>
  public readonly option: string

  constructor(option: string, irContext: IRContext) {
    super(irContext)
    this.option = option
  }

  public toObject() {
    return this.option
  }

  public toString() {
    return `OptionSetValue (${this.option})`
  }

  public visit(visitor: IValueVisitor) {
    visitor.visit(this)
  }
}
