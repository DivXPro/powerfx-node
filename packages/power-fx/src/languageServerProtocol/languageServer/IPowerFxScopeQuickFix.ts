/// <summary>
/// Provides quick fix

import { CodeActionResult } from '../protocol/CodeActionResult'

/// </summary>
export interface IPowerFxScopeQuickFix {
  /// <summary>
  /// Provider quick fix suggesions.
  /// </summary>
  /// <param name="expression">The formula expression.</param>
  /// <returns>Collection of quick fixes.</returns>
  Suggest(expression: string): CodeActionResult[]
}
