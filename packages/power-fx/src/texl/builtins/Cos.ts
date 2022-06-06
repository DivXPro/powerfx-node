import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class CosFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }
  constructor() {
    super('Cos', TexlStrings.AboutCos, FunctionCategories.MathAndStat)
  }
}

// Cos(E:*[n])
// Table overload that computes the cosine of each item in the input table.
export class CosTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }
  constructor() {
    super('Cos', TexlStrings.AboutCosT, FunctionCategories.Table)
  }
}
