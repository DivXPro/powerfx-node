import { PrimitiveValue } from './PrimitiveValue'
import { IRContext } from '../../ir'
import { IValueVisitor } from './IValueVisitor'

export class GuidValue extends PrimitiveValue<string> {
  constructor(irContext: IRContext, value: string) {
    super(irContext, value)
  }

  public visit(visitor: IValueVisitor) {
    visitor.visit(this)
  }
}
