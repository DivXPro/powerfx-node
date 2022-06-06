import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'

export class BlankType extends FormulaType {
  constructor() {
    super(new DType(DKind.ObjNull))
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }
}
