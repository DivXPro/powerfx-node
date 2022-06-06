// Sqrt(number:n)

import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

// Equivalent DAX function: Sqrt
export class SqrtFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Sqrt', TexlStrings.AboutSqrt, FunctionCategories.MathAndStat)
  }
}

// Sqrt(E:*[n])
// Table overload that computes the square root values of each item in the input table.
export class SqrtTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Sqrt', TexlStrings.AboutSqrtT, FunctionCategories.Table)
  }
}
