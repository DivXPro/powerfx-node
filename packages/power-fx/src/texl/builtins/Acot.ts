import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class AcotFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Acot', TexlStrings.AboutAcot, FunctionCategories.MathAndStat)
  }
}

// Acot(E:*[n])
// Table overload that computes the arc cotangent of each item in the input table.
export class AcotTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Acot', TexlStrings.AboutAcotT, FunctionCategories.Table)
  }
}
