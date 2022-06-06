import { IRContext } from '../../ir/IRContext'
import { IValueVisitor } from './IValueVisitor'
import { PrimitiveValue } from './PrimitiveValue'

export class NumberValue extends PrimitiveValue<number> {
  constructor(irContext: IRContext, value: number) {
    super(irContext, value)
    // Contract.Assert(IRContext.ResultType == FormulaType.Number);
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
