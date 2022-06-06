import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

// TimeZoneOffset()
export class TimeZoneOffsetFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return false
  }
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'TimeZoneOffset',
      undefined,
      TexlStrings.AboutTimeZoneOffset,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      0,
      1,
      DType.DateTime,
    )
  }

  public getSignatures() {
    return [[], [TexlStrings.TimeZoneOffsetArg1]]
  }
}
