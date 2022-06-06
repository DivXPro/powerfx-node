import { IIntellisenseResult } from '../texl/intellisense/IIntellisenseResult'
import { CheckResult } from './CheckResult'

export interface IPowerFxScope {
  /// <summary>
  /// Check for errors in the given expression.
  /// </summary>
  /// <param name="expression"></param>
  /// <returns></returns>
  check(expression: string): CheckResult

  /// <summary>
  /// Provide intellisense for expression
  /// </summary>
  Suggest(expression: string, cursorPosition: number): IIntellisenseResult
}
