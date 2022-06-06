import { FormulaType } from './types/FormulaType'
import { RecordType } from './types/RecordType'

export class FormulaWithParameters {
  public readonly _expression: string // Formula
  public readonly _schema: FormulaType // context formula can access.

  /// <summary>
  ///
  /// </summary>
  /// <param name="expression">The text version of the expression</param>
  /// <param name="parameterTypes">The static type of parameters (context) available to this formula.
  /// If omited, this formula doesn't have any additional parameters.
  /// </param>
  constructor(expression: string, parameterTypes?: FormulaType) {
    this._expression = expression
    this._schema = parameterTypes ?? new RecordType()
  }
}
