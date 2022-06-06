// RandBetween()

import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'

// Equivalent DAX/Excel function: RandBetween
export class RandBetweenFunction extends BuiltinFunction {
  // Multiple invocations may produce different return values.
  // public override bool IsStateless => false;
  public get isStateless() {
    return false
  }

  public get isSelfContained() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'RandBetween',
      undefined,
      TexlStrings.AboutRandBetween,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      2,
      2,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.RandBetweenArg1, TexlStrings.RandBetweenArg2]]
  }
}
