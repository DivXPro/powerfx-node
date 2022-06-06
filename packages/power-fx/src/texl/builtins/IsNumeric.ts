import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class IsNumericFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }
  constructor() {
    super(
      undefined,
      'IsNumeric',
      undefined,
      TexlStrings.AboutIsNumeric,
      FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
    )
  }

  public getSignatures() {
    return [[TexlStrings.IsNumericArg1]]
  }
}
