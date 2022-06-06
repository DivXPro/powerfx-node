import { DKind } from '../types/DKind'
import { DType } from '../types/DType'
import { Contracts } from '../utils/Validation'
import { CoercionKind } from './CoercionKind'
import { InvalidCoercionException } from './InvalidCoercionException'

export class CoercionMatrix {
  public static GetCoercionKind(fromType: DType, toType: DType): CoercionKind {
    Contracts.AssertValid(fromType)
    Contracts.AssertValid(toType)

    if (!fromType.isAggregate && !fromType.isOptionSet && !fromType.isView && fromType === toType) {
      return CoercionKind.None
    }

    if (fromType.isAggregate && toType.kind === DKind.DataEntity) {
      return CoercionKind.AggregateToDataEntity
    }

    if (toType.isLargeImage && (fromType.kind === DKind.Image || fromType === DType.MinimalLargeImage)) {
      if (fromType.kind == DKind.Image) {
        return CoercionKind.ImageToLargeImage
      } else {
        return CoercionKind.SingleColumnRecordToLargeImage
      }
    }

    return CoercionMatrix.FlattenCoercionMatrix(fromType, toType)
  }

  private static FlattenCoercionMatrix(fromType: DType, toType: DType): CoercionKind {
    switch (toType.kind) {
      case DKind.Number:
      case DKind.Currency:
        return CoercionMatrix.GetToNumberCoercion(fromType)

      case DKind.Color:
      case DKind.PenImage:
        // It is not safe to coerce these.
        Contracts.Assert(false, 'Unsupported type coercion')
        break

      case DKind.Hyperlink:
        if (DType.String.accepts(fromType)) {
          switch (fromType.kind) {
            case DKind.Blob:
              return CoercionKind.BlobToHyperlink
            case DKind.Image:
              return CoercionKind.ImageToHyperlink
            case DKind.Media:
              return CoercionKind.MediaToHyperlink
            default:
              return CoercionKind.TextToHyperlink
          }
        }

        Contracts.Assert(false, 'Unsupported type coercion')
        break

      case DKind.Image:
        if (fromType.isLargeImage) return CoercionKind.LargeImageToImage

        if (fromType.kind !== DKind.Media && fromType.kind !== DKind.Blob && DType.String.accepts(fromType))
          return CoercionKind.TextToImage

        Contracts.Assert(false, 'Unsupported type coercion')
        break

      case DKind.Media:
        if (fromType.kind !== DKind.Image && fromType.kind !== DKind.Blob && DType.String.accepts(fromType)) {
          return CoercionKind.TextToMedia
        }

        Contracts.Assert(false, 'Unsupported type coercion')
        break

      case DKind.Blob:
        if (DType.String.accepts(fromType)) {
          return CoercionKind.TextToBlob
        }

        Contracts.Assert(false, 'Unsupported type coercion')
        break

      case DKind.String:
        return CoercionMatrix.GetToStringCoercion(fromType)

      case DKind.Enum:
        return CoercionMatrix.GetToEnumCoercion(fromType, toType)

      case DKind.Boolean:
        Contracts.Assert(
          DType.Number.accepts(fromType) ||
            DType.String.accepts(fromType) ||
            (DType.OptionSetValue.accepts(fromType) && (fromType.optionSetInfo?.isBooleanValued ?? false)),
          'Unsupported type coercion',
        )
        if (DType.Number.accepts(fromType)) return CoercionKind.NumberToBoolean

        if (DType.String.accepts(fromType)) return CoercionKind.TextToBoolean

        if (DType.OptionSetValue.accepts(fromType) && (fromType.optionSetInfo?.isBooleanValued ?? false))
          return CoercionKind.BooleanOptionSetToBoolean

        return CoercionKind.None // Implicit coercion?

      case DKind.Record:
        Contracts.Assert(fromType.isAggregate)
        Contracts.Assert(fromType.kind == toType.kind)

        return CoercionKind.RecordToRecord

      case DKind.Table:
        Contracts.Assert(fromType.isAggregate)
        Contracts.Assert(fromType.kind == DKind.Table || fromType.kind == DKind.Record)

        if (fromType.kind == DKind.Table) return CoercionKind.TableToTable

        if (fromType.kind == DKind.Record) return CoercionKind.RecordToTable

        Contracts.Assert(false, 'Unexpected type for coercion.')
        break

      case DKind.DateTime:
      case DKind.DateTimeNoTimeZone:
        Contracts.Assert(
          DType.String.accepts(fromType) ||
            DType.Number.accepts(fromType) ||
            DType.Time.accepts(fromType) ||
            DType.Date.accepts(fromType),
          'Unsupported type coercion',
        )
        if (DType.Number.accepts(fromType)) {
          return CoercionKind.NumberToDateTime
        } else if (DType.Date.accepts(fromType)) {
          return CoercionKind.DateToDateTime
        } else if (DType.Time.accepts(fromType)) {
          return CoercionKind.TimeToDateTime
        }
        return CoercionKind.TextToDateTime

      case DKind.Time:
        Contracts.Assert(
          DType.String.accepts(fromType) ||
            DType.Number.accepts(fromType) ||
            DType.DateTime.accepts(fromType) ||
            DType.Date.accepts(fromType),
          'Unsupported type coercion',
        )
        if (DType.Number.accepts(fromType)) {
          return CoercionKind.NumberToTime
        } else if (DType.Date.accepts(fromType)) {
          return CoercionKind.DateToTime
        } else if (DType.DateTime.accepts(fromType)) {
          return CoercionKind.DateTimeToTime
        }
        return CoercionKind.TextToTime

      case DKind.Date:
        Contracts.Assert(
          DType.String.accepts(fromType) ||
            DType.Number.accepts(fromType) ||
            DType.DateTime.accepts(fromType) ||
            DType.Time.accepts(fromType),
          'Unsupported type coercion',
        )
        if (DType.Number.accepts(fromType)) {
          return CoercionKind.NumberToDate
        } else if (DType.Time.accepts(fromType)) {
          return CoercionKind.TimeToDate
        } else if (DType.DateTime.accepts(fromType)) {
          return CoercionKind.DateTimeToDate
        }
        return CoercionKind.TextToDate

      case DKind.OptionSetValue:
        Contracts.Assert(
          DType.OptionSetValue.accepts(fromType) ||
            (DType.Boolean.accepts(fromType) && (toType.optionSetInfo?.isBooleanValued ?? false)),
          'Unsupported type coercion',
        )

        if (DType.Boolean.accepts(fromType) && (toType.optionSetInfo?.isBooleanValued ?? false))
          return CoercionKind.BooleanToOptionSet

        return CoercionKind.None // Implicit coercion?

      case DKind.ViewValue:
        Contracts.Assert(DType.ViewValue.accepts(fromType), 'Unsupported type coercion')
        return CoercionKind.None // Implicit coercion?
      default:
        // Nothing else can be coerced.
        Contracts.Assert(false, 'Unsupported type coercion')
        break
    }
    // This should be impossible, the caller can catch and treat it as CoercionKind.None but should investigate.
    throw new InvalidCoercionException(
      `Attempting to generate invalid coercion from ${fromType.getKindString()} to ${toType.getKindString()}`,
    )
  }

  private static GetToNumberCoercion(fromType: DType): CoercionKind {
    Contracts.Assert(
      DType.String.accepts(fromType) ||
        DType.Boolean.accepts(fromType) ||
        DType.Number.accepts(fromType) ||
        DType.DateTime.accepts(fromType) ||
        DType.Time.accepts(fromType) ||
        DType.Date.accepts(fromType) ||
        DType.DateTimeNoTimeZone.accepts(fromType) ||
        fromType.isControl ||
        (DType.OptionSetValue.accepts(fromType) && (fromType.optionSetInfo?.isBooleanValued ?? false)),
      'Unsupported type coercion',
    )

    if (DType.String.accepts(fromType)) return CoercionKind.TextToNumber

    if (DType.Boolean.accepts(fromType)) return CoercionKind.BooleanToNumber

    if (fromType.kind == DKind.DateTime || fromType.kind == DKind.DateTimeNoTimeZone)
      return CoercionKind.DateTimeToNumber

    if (fromType.kind == DKind.Time) return CoercionKind.TimeToNumber

    if (fromType.kind == DKind.Date) return CoercionKind.DateToNumber

    if (DType.OptionSetValue.accepts(fromType) && (fromType.optionSetInfo?.isBooleanValued ?? false))
      return CoercionKind.BooleanOptionSetToNumber

    return CoercionKind.None
  }

  /// <summary>
  /// Resolves the coercion type for any type to a type with <see cref="DKind.Enum"/> kind
  /// </summary>
  /// <param name="fromType">
  /// Type that is being coerced to an enum type
  /// </param>
  /// <param name="toType">
  /// An enum type that a value of <see cref="fromType"/> is being coerced to
  /// </param>
  /// <returns>
  /// The result will generally resemble the coercion kind whose meaning resembles "fromType to
  /// toType.EnumSuperKind", but with special cases evident within.
  /// </returns>
  private static GetToEnumCoercion(fromType: DType, toType: DType): CoercionKind {
    Contracts.Assert(toType.kind === DKind.Enum)

    switch (toType.enumSuperKind) {
      case DKind.Number:
        return CoercionMatrix.GetCoercionKind(fromType, DType.Number)
      default:
        return CoercionMatrix.GetToStringCoercion(fromType)
    }
  }

  private static GetToStringCoercion(fromType: DType): CoercionKind {
    let _number: boolean = DType.Number.accepts(fromType)
    let _datetime = DType.DateTime.accepts(fromType)
    let _date = DType.Date.accepts(fromType)
    let _time = DType.Time.accepts(fromType)
    let _boolean = DType.Boolean.accepts(fromType)
    let _string = DType.String.accepts(fromType)
    let _guid = DType.Guid.accepts(fromType)
    let _optionSet = DType.OptionSetValue.accepts(fromType)
    let _viewValue = DType.ViewValue.accepts(fromType)
    Contracts.Assert(
      _number || _boolean || _datetime || _date || _time || _string || _guid || _optionSet || _viewValue,
      'Unsupported type coercion',
    )

    if (DType.Number.accepts(fromType) || DType.DateTime.accepts(fromType)) {
      if (fromType.kind == DKind.Date) return CoercionKind.DateToText
      else if (fromType.kind == DKind.Time) return CoercionKind.TimeToText
      else if (fromType.kind == DKind.DateTime) return CoercionKind.DateTimeToText

      return CoercionKind.NumberToText
    } else if (DType.Boolean.accepts(fromType)) return CoercionKind.BooleanToText
    else if (DType.Hyperlink.accepts(fromType)) {
      switch (fromType.kind) {
        case DKind.Blob:
          return CoercionKind.BlobToHyperlink
        case DKind.Image:
          return CoercionKind.ImageToHyperlink
        case DKind.Media:
          return CoercionKind.MediaToHyperlink
        default:
          return CoercionKind.None
      }
    } else if (DType.OptionSetValue.accepts(fromType)) return CoercionKind.OptionSetToText
    else if (DType.ViewValue.accepts(fromType)) return CoercionKind.ViewToText
    else return CoercionKind.None // Implicit coercion?
  }
}
