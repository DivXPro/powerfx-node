import { FormulaType } from '../../public'

export class PublishExpressionTypeParams {
  /// <summary>
  /// The URI for which the expression type is reported.
  /// </summary>
  public uri: string = ''

  /// <summary>
  /// The detected type of the expression.
  /// </summary>
  public type: FormulaType
}
