import { IRContext } from '../../ir/IRContext'
import DateTime from '../../utils/typescriptNet/Time/DateTime'
import { IValueVisitor } from './IValueVisitor'
import { PrimitiveValue } from './PrimitiveValue'

export class DateValue extends PrimitiveValue<DateTime> {
  constructor(irContext: IRContext, value: DateTime) {
    super(irContext, value)
    // Contract.Assert(IRContext.ResultType == FormulaType.Date);
    // Contract.Assert(value.TimeOfDay == TimeSpan.Zero);
    // Contract.Assert(value.Kind != DateTimeKind.Utc);
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return this.value.toString()
  }

  public toObject() {
    return this._value.value
  }
}
