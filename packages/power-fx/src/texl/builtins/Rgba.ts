import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'

// RGBA(red, green, blue, alpha)
export class RGBAFunction extends BuiltinFunction {
  // public override bool IsTrackedInTelemetry => false;

  public get supportsParamCoercion() {
    return true
  }
  public get isTrackedInTelemetry() {
    return false
  }
  public get supportsInlining() {
    return true
  }

  // public override bool SupportsInlining => true;

  // This is important to set so that calls to RGBA(consts,...) are also considered const
  public get isSelfContained() {
    return true
  }

  constructor() {
    super(
      undefined,
      'RGBA',
      undefined,
      TexlStrings.AboutRGBA,
      FunctionCategories.Color,
      DType.Color,
      0,
      4,
      4,
      DType.Number,
      DType.Number,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.RGBAArg1, TexlStrings.RGBAArg2, TexlStrings.RGBAArg3, TexlStrings.RGBAArg4]]
  }
}
