import { DelegationCapability } from '../../functions/delegation'
import { TexlStrings } from '../../localization/Strings'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StatisticalFunction } from './StatisticalFunction'
import { StatisticalTableFunction } from './StatisticalTableFunction'

// Sum(arg1:n, arg2:n, ..., argN:n)
export class SumFunction extends StatisticalFunction {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super('Sum', TexlStrings.AboutSum, FunctionCategories.MathAndStat)
  }
}

// Sum(source:*, projection:n)
// Corresponding DAX functions: Sum, SumX
export class SumTableFunction extends StatisticalTableFunction {
  public get requiresErrorContext() {
    return true
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.Sum)
  }

  constructor() {
    super('Sum', TexlStrings.AboutSumT, FunctionCategories.Table)
  }
}
