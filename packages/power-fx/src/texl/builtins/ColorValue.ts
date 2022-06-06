import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class ColorValueFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
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
      'ColorValue',
      undefined,
      TexlStrings.AboutColorValue,
      FunctionCategories.Color,
      DType.Color,
      0,
      1,
      1,
      DType.String,
    )
  }

  public getSignatures() {
    return [[TexlStrings.ColorValueArg1]]
  }
}
