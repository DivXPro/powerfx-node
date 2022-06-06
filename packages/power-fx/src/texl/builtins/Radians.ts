// Radians(number:n)

import { TexlStrings } from '../../localization/Strings'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

// Equivalent Excel function: Radians
export class RadiansFunction extends MathOneArgFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Radians', TexlStrings.AboutRadians, FunctionCategories.MathAndStat)
  }
}

// Radians(E:*[n])
// Table overload that computes the radians values of each item in the input table.
export class RadiansTableFunction extends MathOneArgTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Radians', TexlStrings.AboutRadiansT, FunctionCategories.Table)
  }
}
