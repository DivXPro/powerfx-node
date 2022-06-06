import { FormulaType } from './FormulaType'
import { DType } from '../../types'
import { ITypeVistor } from './ITypeVistor'

export class ColorType extends FormulaType {
  constructor() {
    super(DType.Color)
  }

  public visit(vistor: ITypeVistor) {
    vistor.visit(this)
  }
}
