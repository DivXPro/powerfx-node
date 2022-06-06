import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class CotFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }
  constructor() {
    super('Cot', TexlStrings.AboutCot, FunctionCategories.MathAndStat)
  }
}

// Cot(E:*[n])
// Table overload that computes the cotangent of each item in the input table.
export class CotTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }
  constructor() {
    super('Cot', TexlStrings.AboutCotT, FunctionCategories.Table)
  }
}
