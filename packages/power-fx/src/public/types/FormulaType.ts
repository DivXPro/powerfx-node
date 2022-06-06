import { DType } from '../../types/DType'
import { ITypeVistor } from './ITypeVistor'
import { BlankType } from './BlankType'
import { BooleanType } from './BooleanType'
import { NumberType } from './NumberType'
import { StringType } from './StringType'
import { TimeType } from './TimeType'
import { DateType } from './DateType'
import { DateTimeType } from './DateTimeType'
import { DateTimeNoTimeZoneType } from './DateTimeNoTimeZoneType'
import { OptionSetValueType } from './OptionSetValueType'
import { UntypedObjectType } from './UntypedObjectType'
import { HyperlinkType } from './HyperLinkType'
import { ColorType } from './ColorType'
import { GuidType } from './Guid'
import { DKind } from '../../types'
import { RecordType } from './RecordType'
import { TableType } from './TableType'
import { DName, DPath } from '../../utils'

export abstract class FormulaType {
  // protected isn't enough to let derived classes access this.
  public readonly _type: DType

  // chained by derived type
  protected constructor(type: DType) {
    this._type = type
  }

  public equals(other: any): boolean {
    if (other instanceof FormulaType) {
      return this._type.equals(other._type)
    }
    return false
  }

  public getHashCode() {
    return this._type.getHashCode()
  }

  public abstract visit(visitor: ITypeVistor): void

  public static Blank = new BlankType()

  // Well-known types
  public static Boolean = new BooleanType()

  public static Number = new NumberType()

  public static String = new StringType()

  public static Time = new TimeType()

  public static Date = new DateType()

  public static DateTime = new DateTimeType()

  public static DateTimeNoTimeZone = new DateTimeNoTimeZoneType()

  public static OptionSetValue = new OptionSetValueType()

  public static UntypedObject = new UntypedObjectType()

  public static Hyperlink = new HyperlinkType()

  public static Color = new ColorType()

  public static Guid = new GuidType()

  // Get the correct derived type
  static Build(type: DType): FormulaType {
    switch (type.kind) {
      case DKind.ObjNull:
        return FormulaType.Blank
      case DKind.Record:
        return new RecordType(type)
      case DKind.Table:
        return new TableType(type)
      case DKind.Number:
        return FormulaType.Number
      case DKind.String:
        return FormulaType.String
      case DKind.Boolean:
        return FormulaType.Boolean
      case DKind.Currency:
        return FormulaType.Number // TODO: validate
      case DKind.Hyperlink:
        return FormulaType.Hyperlink
      case DKind.Color:
        return FormulaType.Color
      case DKind.Guid:
        return FormulaType.Guid

      case DKind.Time:
        return FormulaType.Time
      case DKind.Date:
        return FormulaType.Date
      case DKind.DateTime:
        return FormulaType.DateTime
      case DKind.DateTimeNoTimeZone:
        return FormulaType.DateTimeNoTimeZone

      case DKind.OptionSetValue: {
        const isBoolean = type.optionSetInfo?.isBooleanValued
        return isBoolean ? FormulaType.Boolean : FormulaType.OptionSetValue
      }
      // This isn't quite right, but once we're in the IR, an option set acts more like a record with optionsetvalue fields.
      case DKind.OptionSet:
        return new RecordType(DType.CreateRecord(...type.getAllNames(DPath.Root)))
      case DKind.UntypedObject:
        return FormulaType.UntypedObject
      case DKind.Control:
        return new RecordType(type.getType(new DName(DType.MetaFieldName)))
      case DKind.DataEntity:
        return new RecordType(type.getType(new DName(DType.MetaFieldName)))
      case DKind.Flow:
        return new RecordType(type.getType(new DName(DType.MetaFieldName)))
      default:
        throw new Error(`Not implemented type: ${DKind[type.kind]}`)
    }
  }
}
