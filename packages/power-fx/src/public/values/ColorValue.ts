import { PrimitiveValue } from './PrimitiveValue'
import { IRContext } from '../../ir'
import { IValueVisitor } from './IValueVisitor'

export class ColorValue extends PrimitiveValue<string> {
  constructor(irContext: IRContext, value: string) {
    super(irContext, value)
  }

  public visit(visitor: IValueVisitor) {
    visitor.visit(this)
  }
}
