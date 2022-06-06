import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class TimeType extends FormulaType {
  constructor() {
    super(DType.Time)
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
