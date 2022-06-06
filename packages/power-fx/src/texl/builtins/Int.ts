import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { MathOneArgFunction, MathOneArgTableFunction } from './MathFunction'

export class IntFunction extends MathOneArgFunction {
  constructor() {
    super('Int', TexlStrings.AboutInt, FunctionCategories.MathAndStat)
  }
}

// Int(E:*[n])
// Table overload that applies Int to each item in the input table.
export class IntTableFunction extends MathOneArgTableFunction {
  constructor() {
    super('Int', TexlStrings.AboutIntT, FunctionCategories.Table)
  }
}
