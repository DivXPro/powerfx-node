import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class DegreesFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Degrees', TexlStrings.AboutDegrees, FunctionCategories.MathAndStat)
  }
}

// Degrees(E:*[n])
// Table overload that computes the degrees values of each item in the input table.
export class DegreesTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Degrees', TexlStrings.AboutDegreesT, FunctionCategories.Table)
  }
}
