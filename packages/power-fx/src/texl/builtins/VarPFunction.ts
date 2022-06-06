import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StatisticalFunction } from './StatisticalFunction'
import { StatisticalTableFunction } from './StatisticalTableFunction'
// VarP(arg1:n, arg2:n, ..., argN:n)

// Corresponding Excel function: VARP
export class VarPFunction extends StatisticalFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('VarP', TexlStrings.AboutVarP, FunctionCategories.MathAndStat)
  }
}

// VarP(source:*, projection:n)
// Corresponding DAX function: VAR.P
export class VarPTableFunction extends StatisticalTableFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('VarP', TexlStrings.AboutVarPT, FunctionCategories.Table)
  }
}
