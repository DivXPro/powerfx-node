import { Span } from '../localization'
import { FormulaType } from '../public/types/FormulaType'

export class IRContext {
  public sourceContext: Span
  public resultType: FormulaType

  constructor(sourceContext: Span, resultType: FormulaType) {
    this.sourceContext = sourceContext
    this.resultType = resultType
  }

  public static NotInSource(resultType: FormulaType): IRContext {
    return new IRContext(undefined, resultType)
  }
}
