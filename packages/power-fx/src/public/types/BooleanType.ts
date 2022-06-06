import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class BooleanType extends FormulaType {
  constructor() {
    super(new DType(DKind.Boolean))
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
