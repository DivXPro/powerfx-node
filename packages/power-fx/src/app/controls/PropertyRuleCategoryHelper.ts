import { PropertyRuleCategory } from './PropertyRuleCategory'

export class PropertyRuleCategoryHelper {
  public static IsValidPropertyRuleCategory(category: string) {
    return PropertyRuleCategory[category as any] != null
  }

  public static TryParsePropertyCategory(category: string): [boolean, PropertyRuleCategory | undefined] {
    // Contracts.CheckNonEmpty(category, "category");

    // Enum.TryParse uses a bunch of reflection and boxing. If this becomes an issue, we can
    // use plain-old switch statement.
    if (Object.keys(PropertyRuleCategory).some((k) => k === category)) {
      return [true, PropertyRuleCategory[category as any] as unknown as PropertyRuleCategory]
    }
    return [false, undefined]
    // return Enum.TryParse(category, ignoreCase: true, result: out categoryEnum);
  }
}
