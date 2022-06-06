import { IRContext } from '../../ir/IRContext'
import { Dictionary } from '../../utils/Dictionary'
import { FormulaType } from '../types/FormulaType'
import { NamedFormulaType } from '../types/NamedFormulaType'
import { RecordType } from '../types/RecordType'
import { FormulaValue } from './FormulaValue'
import { InMemoryTableValue } from './InMemoryTableValue'
import { NamedValue } from './NamedValue'
import { RecordValue } from './RecordValue'
import { TableValue } from './TableValue'
import { BlankValue } from './BlankValue'

export class InMemoryRecordValue extends RecordValue {
  private _fields: Map<string, FormulaValue> = new Map()

  public get fields(): NamedValue[] {
    // from field in _fields select new NamedValue(field);
    let arr: NamedValue[] = []
    this._fields.forEach((value, key) => {
      arr.push(new NamedValue(key, value))
    })
    return arr
  }

  constructor(irContext: IRContext, fieldsArr: NamedValue[]) {
    super(irContext)
    // Contract.Assert(IRContext.ResultType is RecordType);
    const recordType = irContext.resultType as RecordType
    let fieldDictionary: Dictionary<string, NamedFormulaType> = new Dictionary()
    recordType.getNames().forEach((item) => {
      fieldDictionary.set(item.name.value, item)
    })
    for (const field of fieldsArr) {
      this._fields.set(field.name, this.PropagateFieldType(field.value, fieldDictionary.get(field.name).type))
    }
  }

  private PropagateFieldType(fieldValue: FormulaValue, fieldType: FormulaType): FormulaValue {
    let recordValue: RecordValue
    if (fieldValue instanceof RecordValue) {
      recordValue = <RecordValue>fieldValue
      return new InMemoryRecordValue(IRContext.NotInSource(fieldType), recordValue.fields)
    }
    let tableValue: TableValue
    if (fieldValue instanceof TableValue) {
      tableValue = <TableValue>fieldValue
      return new InMemoryTableValue(IRContext.NotInSource(fieldType), tableValue.rows)
    }
    return fieldValue
  }

  public setField(name: string, value: FormulaValue) {
    this._fields.set(name, value)
    ;(this.irContext.resultType as RecordType).add(name, value.type)
  }
}
