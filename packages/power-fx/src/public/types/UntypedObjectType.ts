import { FormulaType } from './FormulaType'
import { DType } from '../../types'
import { ITypeVistor } from './ITypeVistor'

export class UntypedObjectType extends FormulaType {
  constructor() {
    super(DType.UntypedObject)
  }
  public visit(vistor: ITypeVistor) {
    vistor.visit(this)
  }
}
