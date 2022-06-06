import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class UTCNowFunction extends BuiltinFunction {
  // Multiple invocations may result in different return values.
  public get isStateless() {
    return false
  }

  public get isGlobalReliant() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor() {
    super(undefined, 'UTCNow', undefined, TexlStrings.AboutUTCNow, FunctionCategories.DateTime, DType.Date, 0, 0, 0)
  }

  public getSignatures(): Array<StringGetter[]> {
    return []
  }
}
