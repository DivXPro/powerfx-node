import { IRContext } from '../../ir/IRContext'
import { Control } from '../environment'
import { IValueVisitor, PrimitiveValue } from '../../public/values'

export class ControlValue extends PrimitiveValue<Control> {
  constructor(irContext: IRContext, value: Control) {
    super(irContext, value)
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
