import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class AsinFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Asin', TexlStrings.AboutAsin, FunctionCategories.MathAndStat)
  }
}

// Asin(E:*[n])
// Table overload that computes the arc sine values of each item in the input table.
export class AsinTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Asin', TexlStrings.AboutAsinT, FunctionCategories.Table)
  }
}
