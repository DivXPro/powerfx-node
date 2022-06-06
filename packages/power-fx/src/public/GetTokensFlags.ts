export enum GetTokensFlags { //: uint
  /// <summary>
  /// No token
  /// </summary>
  None = 0x0,

  /// <summary>
  /// Tokens only used in the given expression
  /// </summary>
  UsedInExpression = 0x1,

  /// <summary>
  /// All available functions can be used
  /// </summary>
  AllFunctions = 0x2,
}
