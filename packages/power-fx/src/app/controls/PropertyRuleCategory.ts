export enum PropertyRuleCategory {
  Data = 0,
  Design = 1,
  Behavior = 2,
  ConstantData = 3,
  OnDemandData = 4,
  Scope = 5,
  /// <summary>
  /// Represents a missing property category when deserializing
  /// Should be cleaned up by document converter, only occurs if
  /// control template is invalid
  /// </summary>
  Unknown = 6,
  Formulas = 7,
}

/// <summary>
/// Rule provider types. These are primarily used by the components.
/// System - Set on all rules on on component definition.
/// User - Set when any customization on property rules in component instance.
/// Unknown - Unknown when provider is not known.
/// </summary>
export enum RuleProviderType {
  Unknown,
  System,
  User,
}
