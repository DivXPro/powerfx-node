import { IRContext } from '../../ir/IRContext'
import { IValueVisitor } from './IValueVisitor'
// import { NumberValue } from './NumberValue';
// import { StringValue } from './StringValue';
// import { BooleanValue } from './BooleanValue';
// import DateTime from '../../utils/typescriptNet/Time/DateTime';
// import { DateTimeValue } from './DateTimeValue';
// import TimeSpan from '../../utils/typescriptNet/Time/TimeSpan';
// import { TimeValue } from './TimeValue';
// import { IsIUntypedObject, IUntypedObject, UntypedObjectValue } from './UntypedObjectValue';
// import { BlankValue } from './BlankValue';
// import { FormulaType, NamedFormulaType, RecordType, TableType, UntypedObjectType } from '../types';
// import { DateValue } from './DateValue';
// import { NamedValue } from './NamedValue';
// import { RecordValue } from './RecordValue';
// import { InMemoryRecordValue } from './InMemoryRecordValue';
// import { TableValue } from './TableValue';
// import { InMemoryTableValue } from './InMemoryTableValue';
// import { DValue } from './DValue';
// import { ErrorValue } from './ErrorValue';
// import { LambdaFormulaValue } from '../../interpreter';

export abstract class FormulaValue {
  // IR contextual information flows from Binding >> IR >> Values
  // In general the interpreter should trust that the binding had
  // the correct runtime types for all values.
  public readonly irContext: IRContext
  public get type() {
    return this.irContext.resultType
  }

  public get typeName() {
    return this.constructor.name
  }

  constructor(irContext?: IRContext) {
    this.irContext = irContext
  }

  public abstract toObject(): any

  public abstract visit(visitor: IValueVisitor): void

  // public static New(value: number): NumberValue;
  // public static New(value?: number): FormulaValue;
  // public static New(value: string): StringValue;
  // public static New(value: boolean): BooleanValue;
  // public static New(value: DateTime): DateTimeValue;
  // public static New(value: TimeSpan): TimeValue;
  // public static New(value: IUntypedObject): UntypedObjectValue;
  // public static New(value?: any): any {
  //   if (value === null) {
  //     return new BlankValue(IRContext.NotInSource(FormulaType.Blank));
  //   }
  //   if (typeof value === 'number') {
  //     return new NumberValue(IRContext.NotInSource(FormulaType.Number), <number>value);
  //   }
  //   if (typeof value === 'string') {
  //     return new StringValue(IRContext.NotInSource(FormulaType.String), <string>value);
  //   }
  //   if (typeof value === 'boolean') {
  //     return new BooleanValue(IRContext.NotInSource(FormulaType.Boolean), <boolean>value);
  //   }
  //   if (value instanceof Date) {
  //     return new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), new DateTime(value));
  //   }
  //   if (value instanceof DateTime) {
  //     return new DateTimeValue(IRContext.NotInSource(FormulaType.DateTime), value);
  //   }
  //   if (value instanceof TimeSpan) {
  //     return new TimeValue(IRContext.NotInSource(FormulaType.Time), value);
  //   }
  //   if (IsIUntypedObject(value)) {
  //     return new UntypedObjectValue(IRContext.NotInSource(new UntypedObjectType()), value);
  //   }
  // }

  // public static NewDateOnly(value: Date): DateValue {
  //   //   if (value.timeOfDay != TimeSpan.Zero) {
  //   //     throw new ArgumentException("Invalid DateValue, the provided DateTime contains a non-zero TimeOfDay");
  //   //   }
  //   //   if (value.Kind == DateTimeKind.Utc) {
  //   //     throw new ArgumentException("Invalid DateValue, the provided DateTime must be local");
  //   //   }
  //   return new DateValue(IRContext.NotInSource(FormulaType.Date), new DateTime(value));
  // }

  // public static NewBlank(type: FormulaType = null): BlankValue {
  //   if (type == null) {
  //     type = FormulaType.Blank;
  //   }
  //   return new BlankValue(IRContext.NotInSource(type));
  // }

  // public static FromJsonString(jsonString: string) {
  //   try {
  //     const json = JSON.parse(jsonString);
  //     return FormulaValue.FromJson(json);
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  // public static FromJson(element: any): FormulaValue {
  //   let valueKine = typeof element;
  //   switch (valueKine) {
  //     case 'string':
  //       return new StringValue(IRContext.NotInSource(FormulaType.String), <string>element);
  //     case 'number':
  //       return new NumberValue(IRContext.NotInSource(FormulaType.Number), <number>element);
  //     case 'boolean':
  //       if (element) {
  //         return new BooleanValue(IRContext.NotInSource(FormulaType.Boolean), true);
  //       }
  //       return new BooleanValue(IRContext.NotInSource(FormulaType.Boolean), false);
  //     case 'object':
  //       if (element == null) {
  //         return new BlankValue(IRContext.NotInSource(FormulaType.Blank));
  //       }
  //       if (Array.isArray(element)) {
  //         //数组
  //         return FormulaValue.TableFromJsonArray(element);
  //       }
  //       return FormulaValue.RecordFromJsonObject(element);
  //     default:
  //       throw new Error(`Unrecognized JsonElement ${element.ValueKind}`);
  //   }
  // }

  // /// <summary>
  // /// Create a record from the list of fields provided.
  // /// </summary>
  // /// <param name="fields"></param>
  // /// <returns></returns>
  // public static RecordFromFields(fields: NamedValue[], recordType?: RecordType): RecordValue {
  //   if (recordType == null) {
  //     let type = new RecordType();
  //     for (let item in fields) {
  //       let field = fields[item];
  //       type = type.add(new NamedFormulaType(field.name, field.value.irContext.resultType));
  //     }
  //     return new InMemoryRecordValue(IRContext.NotInSource(type), fields);
  //   } else {
  //     return new InMemoryRecordValue(IRContext.NotInSource(recordType), fields);
  //   }
  // }

  // // Json objects parse to records.
  // static RecordFromJsonObject(element: any): RecordValue {
  //   // Contract.Assert(element.ValueKind == JsonValueKind.Object);

  //   let fields: NamedValue[] = [];
  //   let type = new RecordType();

  //   for (let key in element) {
  //     const name = key;
  //     let value = element[key];
  //     // const paValue = this.FromJson(value)
  //     const paValue = this.FromJson(this.isJSON(value) ? JSON.parse(value) : value);
  //     fields.push(new NamedValue(name, paValue));
  //     type = type.add(new NamedFormulaType(name, paValue.irContext.resultType));
  //   }
  //   return new InMemoryRecordValue(IRContext.NotInSource(type), fields);
  // }

  // private static isJSON(str: any) {
  //   try {
  //     const obj = JSON.parse(str);
  //     if (typeof obj == 'object' && obj) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (e) {
  //     console.warn('error：' + str + '!!!' + e);
  //     return false;
  //   }
  // }

  // public static TableFromRecords(values: RecordValue[], type?: TableType): TableValue {
  //   if (type == null) {
  //     const recordType = <RecordType>values[0].irContext.resultType;
  //     return FormulaValue.TableFromRecords(values, recordType.toTable());
  //   }
  //   return new InMemoryTableValue(
  //     IRContext.NotInSource(type),
  //     values.map((r) => {
  //       return new DValue<RecordValue>(r, null, null);
  //     })
  //   );
  // }

  // public static GuaranteeRecord(rawVal: FormulaValue): RecordValue {
  //   if (rawVal instanceof RecordValue) {
  //     return rawVal;
  //   }
  //   // Handle the single-column-table case.
  //   const defaultField = new NamedValue('Value', rawVal);
  //   return FormulaValue.RecordFromFields([defaultField]);
  // }

  // // More type safe than base class's ParseJson
  // // Parse json.
  // // [1,2,3]  is a single column table, actually equivalent to:
  // // [{Value : 1, Value: 2, Value :3 }]
  // public static TableFromJsonArray(array: any): TableValue {
  //   // Contract.Assert(array.ValueKind == JsonValueKind.Array);

  //   let records: RecordValue[] = [];

  //   for (let i = 0; i < Array.from(array).length; ++i) {
  //     const element = array[i];
  //     const val = FormulaValue.GuaranteeRecord(FormulaValue.FromJson(element));
  //     records.push(val);
  //   }

  //   // Constructor will handle both single-column table
  //   let type: TableType;
  //   if (records.length == 0) {
  //     type = new TableType();
  //   } else {
  //     type = TableType.FromRecord(
  //       <RecordType>FormulaValue.GuaranteeRecord(records[0]).irContext.resultType
  //     );
  //   }
  //   return new InMemoryTableValue(
  //     IRContext.NotInSource(type),
  //     records.map((r) => new DValue<RecordValue>(r, null, null))
  //   );
  // }

  // public static CheckFormulaValueType(value: FormulaValue, type: string): boolean {
  //   switch (type) {
  //     case 'BlankValue':
  //       return value instanceof BlankValue;
  //     case 'BooleanValue':
  //       return value instanceof BooleanValue;
  //     case 'DateTimeValue':
  //       return value instanceof DateTimeValue;
  //     case 'DateValue':
  //       return value instanceof DateValue;
  //     case 'ErrorValue':
  //       return value instanceof ErrorValue;
  //     case 'InMemoryRecordValue':
  //       return value instanceof InMemoryRecordValue;
  //     case 'InMemoryTableValue':
  //       return value instanceof InMemoryTableValue;
  //     case 'NamedValue':
  //       return value instanceof NamedValue;
  //     case 'NumberValue':
  //       return value instanceof NumberValue;
  //     case 'RecordValue':
  //       return value instanceof RecordValue;
  //     case 'StringValue':
  //       return value instanceof StringValue;
  //     case 'TableValue':
  //       return value instanceof TableValue;
  //     case 'TimeValue':
  //       return value instanceof TimeValue;
  //     case 'LambdaFormulaValue':
  //       return value instanceof LambdaFormulaValue;
  //     default:
  //       return false;
  //   }
  // }
}
