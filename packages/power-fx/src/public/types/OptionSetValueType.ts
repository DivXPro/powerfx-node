import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'
import { IExternalOptionSet } from '../../entities/external/IExternalOptionSet'

export class OptionSetValueType extends FormulaType {
  constructor(optionSet?: IExternalOptionSet) {
    if (optionSet != null) {
      super(DType.CreateOptionSetValueType(optionSet))
    } else {
      super(new DType(DKind.OptionSetValue))
    }
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
