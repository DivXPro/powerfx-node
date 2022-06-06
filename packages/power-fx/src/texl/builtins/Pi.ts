import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class PiFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Pi',
      undefined,
      TexlStrings.AboutPi,
      FunctionCategories.MathAndStat,
      DType.Number, // return type
      0, // no lambdas
      0, // min arity of 0
      0,
    ) // max arity of 0
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]]
    // return new TexlStrings.StringGetter[] { };
  }
}
