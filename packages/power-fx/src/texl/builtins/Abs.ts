import { TexlStrings } from '../../localization/Strings'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class AbsFunction extends MathOneArgFunction {
  constructor() {
    super('Abs', TexlStrings.AboutAbs, FunctionCategories.MathAndStat)
  }
}

// Abs(E:*[n])
// Table overload that computes the absolute values of each item in the input table.
export class AbsTableFunction extends MathOneArgTableFunction {
  constructor() {
    super('Abs', TexlStrings.AboutAbsT, FunctionCategories.Table)
  }
}
