import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class ExpFunction extends MathOneArgFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Exp', TexlStrings.AboutExp, FunctionCategories.MathAndStat)
  }
}

// Exp(E:*[n])
// Table overload that computes the E raised to the respective values of each item in the input table.
export class ExpTableFunction extends MathOneArgTableFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Exp', TexlStrings.AboutExpT, FunctionCategories.Table)
  }
}
