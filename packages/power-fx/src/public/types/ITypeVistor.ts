import { HyperlinkType } from './HyperLinkType'
import { UntypedObjectType } from './UntypedObjectType'
import { BlankType } from './BlankType'
import { BooleanType } from './BooleanType'
import { DateTimeNoTimeZoneType } from './DateTimeNoTimeZoneType'
import { DateTimeType } from './DateTimeType'
import { DateType } from './DateType'
import { NumberType } from './NumberType'
import { OptionSetValueType } from './OptionSetValueType'
import { RecordType } from './RecordType'
import { StringType } from './StringType'
import { TableType } from './TableType'
import { TimeType } from './TimeType'
import { GuidType } from './Guid'
import { ColorType } from './ColorType'

export interface ITypeVistor {
  visit(type: BlankType): void
  visit(type: BooleanType): void
  visit(type: NumberType): void
  visit(type: StringType): void
  visit(type: RecordType): void
  visit(type: TableType): void
  visit(type: DateType): void
  visit(type: DateTimeType): void
  visit(type: DateTimeNoTimeZoneType): void
  visit(type: TimeType): void
  visit(type: OptionSetValueType): void
  visit(type: UntypedObjectType): void
  visit(type: HyperlinkType): void
  visit(type: GuidType): void
  visit(type: ColorType): void
}
