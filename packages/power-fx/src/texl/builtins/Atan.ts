import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class AtanFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Atan', TexlStrings.AboutAtan, FunctionCategories.MathAndStat)
  }
}

// Atan(E:*[n])
// Table overload that computes the arc tangent of each item in the input table.
export class AtanTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Atan', TexlStrings.AboutAtanT, FunctionCategories.Table)
  }
}
