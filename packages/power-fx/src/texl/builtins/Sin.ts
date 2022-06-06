// Sin(number:n)

import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

// Equivalent Excel function: Sin
export class SinFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Sin', TexlStrings.AboutSin, FunctionCategories.MathAndStat)
  }
}

// Sin(E:*[n])
// Table overload that computes the sine values of each item in the input table.
export class SinTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Sin', TexlStrings.AboutSinT, FunctionCategories.Table)
  }
}
