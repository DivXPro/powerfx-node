import { FormulaType } from './FormulaType'
import { DType } from '../../types'
import { ITypeVistor } from './ITypeVistor'

export class GuidType extends FormulaType {
  constructor() {
    super(DType.Guid)
  }

  public visit(vistor: ITypeVistor) {
    vistor.visit(this)
  }
}
