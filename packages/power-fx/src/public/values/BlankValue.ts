import { FormulaValue } from './FormulaValue'
import { IValueVisitor } from './IValueVisitor'
import { IRContext } from '../../ir/IRContext'

export class BlankValue extends FormulaValue {
  constructor(irContext?: IRContext) {
    super(irContext)
  }

  public toObject(): object {
    return null
  }

  public toString(): string {
    return `Blank()`
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
