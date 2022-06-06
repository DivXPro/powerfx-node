import { IRContext } from '../../ir/IRContext'
import { TableType } from '../types/TableType'
import { DValue } from './DValue'
import { InMemoryRecordValue } from './InMemoryRecordValue'
import { RecordValue } from './RecordValue'
import { TableValue } from './TableValue'

export class InMemoryTableValue extends TableValue {
  private readonly _records: DValue<RecordValue>[]

  public get rows(): DValue<RecordValue>[] {
    return this._records
  }
  // public get getRows(): DValue<RecordValue>[] {
  //   return this._records
  // }

  constructor(irContext: IRContext, records: DValue<RecordValue>[]) {
    super(irContext)
    // Contract.Assert(IRContext.ResultType is TableType);

    const tableType = irContext.resultType as TableType
    const recordType = tableType.toRecord()
    const list: DValue<RecordValue>[] = []
    records.forEach((r) => {
      if (r.isValue) {
        let recordValue = new DValue<RecordValue>(
          new InMemoryRecordValue(IRContext.NotInSource(recordType), r.value.fields),
          null,
          null,
        )
        list.push(recordValue)
      } else {
        list.push(r)
      }
    })
    this._records = list
  }
}
