import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class NumberType extends FormulaType {
  constructor() {
    super(new DType(DKind.Number))
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
