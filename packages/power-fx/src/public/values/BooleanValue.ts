import { IRContext } from '../../ir/IRContext'
import { IValueVisitor } from './IValueVisitor'
import { PrimitiveValue } from './PrimitiveValue'

export class BooleanValue extends PrimitiveValue<boolean> {
  constructor(irContext: IRContext, value: boolean) {
    super(irContext, value)
    // Contract.Assert(IRContext.ResultType == FormulaType.Boolean);
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
