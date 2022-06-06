import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class LnFunction extends MathOneArgFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Ln', TexlStrings.AboutLn, FunctionCategories.MathAndStat)
  }
}

// Ln(E:*[n])
// Table overload that computes the natural logarithm values of each item in the input table.
export class LnTableFunction extends MathOneArgTableFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Ln', TexlStrings.AboutLnT, FunctionCategories.Table)
  }
}
