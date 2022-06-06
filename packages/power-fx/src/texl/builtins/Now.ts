import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class NowFunction extends BuiltinFunction {
  // Multiple invocations may produce different return values.

  public get isStateless() {
    return false
  }

  public get isGlobalReliant() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'Now', undefined, TexlStrings.AboutNow, FunctionCategories.DateTime, DType.DateTime, 0, 0, 0)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]] // EnumerableUtils.Yield<TexlStrings.StringGetter[]>();
  }
}
