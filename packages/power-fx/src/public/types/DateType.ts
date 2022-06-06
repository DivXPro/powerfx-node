import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class DateType extends FormulaType {
  constructor() {
    super(DType.Date)
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
