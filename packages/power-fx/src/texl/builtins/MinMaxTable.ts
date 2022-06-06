import { DelegationCapability } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StatisticalTableFunction } from './StatisticalTableFunction'

export class MinMaxTableFunction extends StatisticalTableFunction {
  private readonly _delegationCapability: DelegationCapability

  public get requiresErrorContext() {
    return true
  }

  public get functionDelegationCapability(): DelegationCapability {
    return this._delegationCapability
  }

  constructor(isMin: boolean) {
    super(isMin ? 'Min' : 'Max', isMin ? TexlStrings.AboutMinT : TexlStrings.AboutMaxT, FunctionCategories.Table)

    this._delegationCapability = new DelegationCapability(isMin ? DelegationCapability.Min : DelegationCapability.Max)
  }
}
