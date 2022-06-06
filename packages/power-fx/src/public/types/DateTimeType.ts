import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class DateTimeType extends FormulaType {
  constructor() {
    super(DType.DateTime)
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
