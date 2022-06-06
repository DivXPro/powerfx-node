import { IRContext } from '../../ir/IRContext'
import { DValue } from './DValue'
import { IValueVisitor } from './IValueVisitor'
import { RecordValue } from './RecordValue'
import { ValidFormulaValue } from './ValidFormulaValue'

export abstract class TableValue extends ValidFormulaValue {
  public abstract get rows(): DValue<RecordValue>[]

  public get isColumn(): boolean {
    return this.irContext.resultType._type.isColumn
  }

  constructor(irContext: IRContext) {
    super(irContext)
    // Contract.Assert(IRContext.ResultType is TableType);
  }

  public toObject(): any {
    if (this.isColumn) {
      const array = this.rows.map((val) => {
        if (val.isValue) {
          return val.value.fields[0].value.toObject()
        } else if (val.isBlank) {
          return val.blank.toObject()
        } else {
          return val.error.toObject()
        }
      })
      return array
    } else {
      const array = this.rows.map((val) => {
        if (val.isValue) {
          return val.value.toObject()
        } else if (val.isBlank) {
          return val.blank.toObject()
        } else {
          return val.error.toObject()
        }
      })
      return array
    }
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
