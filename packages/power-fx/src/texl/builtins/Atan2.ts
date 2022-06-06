import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class Atan2Function extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Atan2',
      undefined,
      TexlStrings.AboutAtan2,
      FunctionCategories.MathAndStat,
      DType.Number, // return type
      0, // no lambdas
      2, // min arity of 2
      2, // max arity of 2
      DType.Number, // first param is numeric
      DType.Number, // second param is numeric
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.AboutAtan2Arg1, TexlStrings.AboutAtan2Arg2]]
  }

  public get supportsParamCoercion() {
    return true
  }
}
