import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class TanFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Tan', TexlStrings.AboutTan, FunctionCategories.MathAndStat)
  }
}

// Tan(E:*[n])
// Table overload that computes the tangent of each item in the input table.
export class TanTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Tan', TexlStrings.AboutTanT, FunctionCategories.Table)
  }
}
