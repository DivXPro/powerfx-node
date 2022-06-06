// Rand()

import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'

// Equivalent DAX/Excel function: Rand
export class RandFunction extends BuiltinFunction {
  // Multiple invocations may produce different return values.
  // public override bool  => false;
  public get isStateless() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'Rand', undefined, TexlStrings.AboutRand, FunctionCategories.MathAndStat, DType.Number, 0, 0, 0)
  }

  public getSignatures(): any {
    return [[]]
    // return EnumerableUtils.Yield<TexlStrings.StringGetter[]>();
  }
}
