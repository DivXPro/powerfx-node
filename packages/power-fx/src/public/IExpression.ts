/// <summary>
/// A parsed expression.
/// </summary>

import { FormulaValue } from './values'
import { RecordValue } from './values/RecordValue'

/// <returns></returns>
export interface IExpression {
  /// <summary>
  /// Evaluate the expression with a given set of record values.
  /// </summary>
  eval(parameters: RecordValue): Promise<FormulaValue>
}
