import { BinaryOp } from '../../lexer/BinaryOp'
import { UnaryOp } from '../../lexer/UnaryOp'
import { Dictionary } from '../../utils/Dictionary'
import { Lazy } from '../../utils/Lazy'

export class ODataFunctionMappings {
  // These values are passed as a parameter to Runtime Apis from codegen code.
  // So they need to be in sync with AppMagic.Data.Query.FilterOperator enum values in filter.ts.
  public static readonly BinaryOpToOperatorMap = new Lazy<Dictionary<BinaryOp, string>>(
    () =>
      new Dictionary<BinaryOp, string>([
        [BinaryOp.Equal, 'Equals'],
        [BinaryOp.NotEqual, 'NotEquals'],
        [BinaryOp.Less, 'LessThan'],
        [BinaryOp.LessEqual, 'LessThanOrEqual'],
        [BinaryOp.Greater, 'GreaterThan'],
        [BinaryOp.GreaterEqual, 'GreaterThanOrEqual'],
        [BinaryOp.And, 'And'],
        [BinaryOp.Or, 'Or'],
        [BinaryOp.In, 'Contains'],
        [BinaryOp.Add, 'Add'],
        [BinaryOp.Mul, 'Mul'],
        [BinaryOp.Div, 'Div'],
      ]),
  )

  public static readonly UnaryOpToOperatorMap = new Lazy<Dictionary<UnaryOp, string>>(
    () =>
      new Dictionary<UnaryOp, string>([
        [UnaryOp.Not, 'Not'],
        [UnaryOp.Minus, 'Sub'],
      ]),
  )
}
