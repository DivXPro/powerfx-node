import { IRContext } from '../../ir/IRContext'
import { FormulaType } from '../types/FormulaType'
import { IValueVisitor } from './IValueVisitor'
import { PrimitiveValue } from './PrimitiveValue'

export class StringValue extends PrimitiveValue<string> {
  constructor(irContext: IRContext, value: string) {
    super(irContext, value)
    // Contract.Assert(IRContext.ResultType == FormulaType.String);
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }

  toLower(): StringValue {
    return new StringValue(IRContext.NotInSource(FormulaType.String), this.value.toLowerCase())
  }
}
