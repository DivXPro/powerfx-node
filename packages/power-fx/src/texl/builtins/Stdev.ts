import { FunctionCategories } from '../../types/FunctionCategories'
import { TexlStrings } from '../../localization'
import { StatisticalFunction } from './StatisticalFunction'
import { StatisticalTableFunction } from './StatisticalTableFunction'

// Corresponding Excel function: STDEV.P
export class StdevPFunction extends StatisticalFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('StdevP', TexlStrings.AboutStdevP, FunctionCategories.MathAndStat)
  }
}

// StdevP(source:*, projection:n)
// Corresponding DAX function: STDEV.P
export class StdevPTableFunction extends StatisticalTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('StdevP', TexlStrings.AboutStdevPT, FunctionCategories.Table)
  }
}
