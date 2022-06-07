import {
  IFieldMeta,
  MetaValueType,
  IMetaBase,
  IFieldItems,
} from '@toy-box/meta-schema'
import {
  FormulaValue,
  FormulaValueStatic,
  StringValue,
  NumberValue,
  BlankValue,
  BooleanValue,
  DateValue,
  DateTimeValue,
  NamedValue,
  InMemoryRecordValue,
  RecordValue,
  InMemoryTableValue,
  DValue,
} from '../public/values'
import { IRContext } from '../ir'
import { FormulaType, NamedFormulaType, RecordType, TableType } from '../public'
import { DateTime } from '../utils'

export function makeFormulaValue(meta: IMetaBase, value: any): FormulaValue {
  if (value == null) {
    return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
  }
  switch (meta.type) {
    case MetaValueType.STRING:
    case MetaValueType.TEXT:
    case MetaValueType.OBJECT_ID:
    case MetaValueType.SINGLE_OPTION:
      return new StringValue(
        IRContext.NotInSource(FormulaType.String),
        value.toString()
      )
    case MetaValueType.RATE:
    case MetaValueType.NUMBER:
    case MetaValueType.PERCENT:
      return typeof value === 'number'
        ? new NumberValue(IRContext.NotInSource(FormulaType.Number), value)
        : new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    case MetaValueType.INTEGER:
      return typeof value === 'number'
        ? new NumberValue(
            IRContext.NotInSource(FormulaType.Number),
            Number.parseInt(value.toString())
          )
        : new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    case MetaValueType.BOOLEAN:
      return typeof value === 'boolean'
        ? new BooleanValue(IRContext.NotInSource(FormulaType.Boolean), value)
        : new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    case MetaValueType.DATE:
      return new DateValue(
        IRContext.NotInSource(FormulaType.Date),
        new DateTime(value)
      )
    case MetaValueType.DATETIME:
    case MetaValueType.TIMESTAMP:
      return new DateTimeValue(
        IRContext.NotInSource(FormulaType.DateTime),
        new DateTime(value)
      )
    case MetaValueType.OBJECT: {
      const fields: NamedValue[] = []
      let type = new RecordType()
      for (let key in meta.properties) {
        const name = key
        const fieldValue = value[key]
        const paValue = makeFormulaValue(meta.properties[key], fieldValue)
        fields.push(new NamedValue(name, paValue))
        type = type.add(
          new NamedFormulaType(name, paValue.irContext.resultType)
        )
      }
      return new InMemoryRecordValue(IRContext.NotInSource(type), fields)
    }
    case MetaValueType.MULTI_OPTION: {
      const records: RecordValue[] = []

      for (let i = 0; i < Array.from(value).length; ++i) {
        const item = value[i]
        const val = FormulaValueStatic.GuaranteeRecord(
          FormulaValueStatic.New(item)
        )
        records.push(val)
      }

      // Constructor will handle both single-column table
      let type: TableType
      if (records.length === 0) {
        type = new TableType(undefined)
      } else {
        type = TableType.FromRecord(
          FormulaValueStatic.GuaranteeRecord(records[0]).irContext
            .resultType as RecordType
        )
      }
      return new InMemoryTableValue(
        IRContext.NotInSource(type),
        records.map((r) => new DValue<RecordValue>(r))
      )
    }
    case MetaValueType.ARRAY: {
      const records: RecordValue[] = []

      for (let i = 0; i < Array.from(value).length; ++i) {
        const item = value[i]
        const fieldItems = (meta as IFieldMeta).items as IFieldItems
        const val = FormulaValueStatic.GuaranteeRecord(
          makeFormulaValue(fieldItems, item)
        )
        records.push(val)
      }

      // Constructor will handle both single-column table
      let type: TableType
      if (records.length === 0) {
        type = new TableType(undefined)
      } else {
        type = TableType.FromRecord(
          FormulaValueStatic.GuaranteeRecord(records[0]).irContext
            .resultType as RecordType
        )
      }
      return new InMemoryTableValue(
        IRContext.NotInSource(type),
        records.map((r) => new DValue<RecordValue>(r))
      )
    }
    default:
      return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
  }
}
