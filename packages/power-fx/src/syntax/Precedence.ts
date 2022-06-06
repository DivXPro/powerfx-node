export enum Precedence {
  None,
  SingleExpr,
  Or,
  And,
  In,
  Compare,
  Concat,
  Add,
  Mul,
  Error,
  As,
  PrefixUnary,
  Power,
  PostfixUnary,
  Primary,
  Atomic,
}
