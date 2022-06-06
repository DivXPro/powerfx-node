import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StatisticalFunction } from './StatisticalFunction'

export class MinMaxFunction extends StatisticalFunction {
  public get supportsParamCoercion() {
    return true
  }

  constructor(isMin: boolean) {
    super(isMin ? 'Min' : 'Max', isMin ? TexlStrings.AboutMin : TexlStrings.AboutMax, FunctionCategories.MathAndStat)
  }
}
