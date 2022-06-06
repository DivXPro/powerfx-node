import { ITypeVistor } from './ITypeVistor'
import { DType } from '../../types'
import { FormulaType } from './FormulaType'

export class HyperlinkType extends FormulaType {
  constructor() {
    super(DType.Hyperlink)
  }
  public visit(vistor: ITypeVistor) {
    throw new Error('NotImplementedException')
  }
}
