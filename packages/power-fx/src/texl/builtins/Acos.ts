import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class AcosFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Acos', TexlStrings.AboutAcos, FunctionCategories.MathAndStat)
  }
}

// Acos(E:*[n])
// Table overload that computes the arc cosine of each item in the input table.
export class AcosTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Acos', TexlStrings.AboutAcosT, FunctionCategories.Table)
  }
}
