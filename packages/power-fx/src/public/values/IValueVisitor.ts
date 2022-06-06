import { BlankValue } from './BlankValue'
import { BooleanValue } from './BooleanValue'
import { UntypedObjectValue } from './UntypedObjectValue'
import { DateTimeValue } from './DateTimeValue'
import { DateValue } from './DateValue'
import { ErrorValue } from './ErrorValue'
import { NumberValue } from './NumberValue'
import { RecordValue } from './RecordValue'
import { StringValue } from './StringValue'
import { TableValue } from './TableValue'
import { TimeValue } from './TimeValue'
import { OptionSetValue } from './OptionSetValue'
import { ColorValue } from './ColorValue'
import { GuidValue } from './GuidValue'

export interface IValueVisitor {
  visit(value: BlankValue): void
  visit(value: NumberValue): void
  visit(value: BooleanValue): void
  visit(value: ColorValue): void
  visit(value: GuidValue): void
  visit(value: StringValue): void
  visit(value: ErrorValue): void
  visit(value: RecordValue): void
  visit(value: TableValue): void
  visit(value: TimeValue): void
  visit(value: DateValue): void
  visit(value: DateTimeValue): void
  visit(value: UntypedObjectValue): void
  visit(value: OptionSetValue): void
}
