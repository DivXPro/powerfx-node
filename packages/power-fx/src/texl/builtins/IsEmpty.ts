import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'

export class IsEmptyFunction extends BuiltinFunction {
  public readonly isSelfContained = true

  public get hasPreciseErrors() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      'IsEmpty',
      undefined,
      TexlStrings.AboutIsEmpty,
      FunctionCategories.Table | FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.IsBlankArg1]]
  }
}
