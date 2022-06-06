import { DelegationCapability } from '../../functions/delegation'
import { TexlStrings } from '../../localization/Strings'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StatisticalFunction } from './StatisticalFunction'
import { StatisticalTableFunction } from './StatisticalTableFunction'

export class AverageFunction extends StatisticalFunction {
  public get requiresErrorContext(): boolean {
    return true
  }

  constructor() {
    super('Average', TexlStrings.AboutAverage, FunctionCategories.MathAndStat)
  }
}

// Average(source:*, projection:n)
// Corresponding DAX function: Average
export class AverageTableFunction extends StatisticalTableFunction {
  public get requiresErrorContext(): boolean {
    return true
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.Average)
  }

  constructor() {
    super('Average', TexlStrings.AboutAverageT, FunctionCategories.Table)
  }
}
