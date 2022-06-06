import { IRContext } from '../../ir/IRContext'
import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan'
import { IValueVisitor } from './IValueVisitor'
import { PrimitiveValue } from './PrimitiveValue'

export class TimeValue extends PrimitiveValue<TimeSpan> {
  constructor(irContext: IRContext, ts: TimeSpan) {
    super(irContext, ts)
    // Contract.Assert(IRContext.ResultType == FormulaType.Time);
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }

  public toString(formatter: string) {
    return this.value.toString(formatter)
  }
}
