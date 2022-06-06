import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class ColorFadeFunction extends BuiltinFunction {
  public get isTrackedInTelemetry() {
    return true
  }

  public get supportsInlining() {
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
      'ColorFade',
      undefined,
      TexlStrings.AboutColorFade,
      FunctionCategories.Color,
      DType.Color,
      0,
      2,
      2,
      DType.Color,
      DType.Number,
    )
  }

  public getSignatures() {
    // Parameters are a numeric color value, and a fadeDelta (-1 to 1)
    return [[TexlStrings.ColorFadeArg1, TexlStrings.ColorFadeArg2]]
  }
}
