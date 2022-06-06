import { PropertyRuleCategory } from './PropertyRuleCategory'

export class PropertyRuleCategoryExtensions {
  static IsValid(category: PropertyRuleCategory): boolean {
    return category >= PropertyRuleCategory.Data && category <= PropertyRuleCategory.Formulas
  }

  static IsBehavioral(category: PropertyRuleCategory): boolean {
    return category == PropertyRuleCategory.Behavior || category == PropertyRuleCategory.OnDemandData
  }
}
