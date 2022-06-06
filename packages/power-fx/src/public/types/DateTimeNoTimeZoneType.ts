import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class DateTimeNoTimeZoneType extends FormulaType {
  constructor() {
    super(DType.DateTimeNoTimeZone)
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
