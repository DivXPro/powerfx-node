import { IRContext } from '../../ir/IRContext'
import { FormulaValue } from './FormulaValue'

export abstract class ValidFormulaValue extends FormulaValue {
  constructor(irContext: IRContext) {
    super(irContext)
  }
}
