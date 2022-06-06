import { CheckResult } from './CheckResult'
import { FormulaType } from './types'

export interface IPowerFxEngine {
  /// <summary>
  /// Checks that the provided expression is valid. This means that it is syntactically value and that all types referenced in the epxression are defined in the parameterType.
  /// </summary>
  /// <param name="expressionText">the string representation of the expression to be checked.</param>
  /// <param name="parameterType">the (composite) type definition required to validate the expression.</param>
  /// <returns></returns>
  check(expressionText: string, parameterType: FormulaType): CheckResult
}
