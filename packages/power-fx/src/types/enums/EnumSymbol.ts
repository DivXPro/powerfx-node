import { EnumStore } from './EnumStore'
import { StringResources } from '../../localization'
import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { DType } from '../DType'
/// <summary>
/// Entity info that respresents an enum, such as "Align" or "Font".
/// </summary>
export class EnumSymbol {
  private readonly _valuesInvariantToLoc: Dictionary<string, string>
  private readonly _valuesLocToInvariant: Dictionary<string, string>
  private readonly _valuesInvariantToDisplayName: Dictionary<string, string>

  public enumType: DType
  public get localizedEnumValues() {
    let keys = this._valuesLocToInvariant.keys()
    return [...keys]
  }

  /// <summary>
  /// The variant name for the enum
  /// </summary>
  public name: string

  public invariantName: string

  constructor(store: EnumStore, name: DName, invariantName: DName, invariantType: DType) {
    // Contracts.AssertValid(invariantName);
    // Contracts.Assert(invariantType.IsEnum);

    this.name = name.toString()
    this.invariantName = invariantName.toString()
    this.enumType = invariantType

    // Initialize the locale-specific enum values, and the loc<->invariant maps.
    this._valuesInvariantToLoc = new Dictionary<string, string>()
    this._valuesLocToInvariant = new Dictionary<string, string>()
    this._valuesInvariantToDisplayName = new Dictionary<string, string>()

    for (const typedName of this.enumType.getNames(DPath.Root)) {
      const invName = typedName.name.getValue()

      let locName: string
      const result = StringResources.TryGet(`${this.invariantName}_${typedName.name.getValue()}_Name`)
      locName = result[1]
      if (!result[0]) {
        locName = invName
      }
      this._valuesInvariantToLoc.set(invName, locName)
      this._valuesLocToInvariant.set(locName, invName)

      let displayName: string
      const result2 = StringResources.TryGet(`${this.invariantName}_${typedName.name.getValue()}_DisplayName`)
      displayName = result2[1]
      if (!result2[0]) {
        displayName = locName
      }
      // if (!StringResources.TryGet($"{InvariantName}_{typedName.Name.Value}_DisplayName", out displayName))
      //     displayName = locName;

      let custDisplayName: string
      let entityNameValue = name.getValue()
      const result3 = store.tryGetLocalizedEnumValue(entityNameValue, invName)
      custDisplayName = result3[1]
      if (!result3[0]) {
        custDisplayName = displayName
      }
      this._valuesInvariantToDisplayName.set(invName, custDisplayName)
    }
  }

  /// <summary>
  /// Look up an enum value by its locale-specific name.
  /// For example, locName="Droit" --> invName="Right", value="right"
  /// </summary>
  public tryLookupValueByLocName(locName: string): [boolean, { invName: string; value: any }] {
    // Contracts.AssertValue(locName);
    // Contracts.Assert(DName.IsValidDName(locName));
    let value: any
    const result = this._valuesLocToInvariant.tryGetValue(locName)
    const invName = result[1]
    if (!result[0]) {
      value = undefined
      return [false, { invName, value }]
    }

    const result2 = this.enumType.tryGetEnumValue(new DName(invName))
    value = result2[1]
    return [result2[0], { invName, value }]
  }

  /// <summary>
  /// Get the invariant enum value name corresponding to the given locale-specific name.
  /// For example, locName="Droit" --> invName="Right"For example, locName="Droit" --> invName="Right"
  /// </summary>
  public tryGetInvariantValueName(locName: string): [boolean, string] {
    // Contracts.AssertValue(locName);
    // Contracts.Assert(DName.IsValidDName(locName));
    let invName: string
    return this._valuesLocToInvariant.tryGetValue(locName)
  }

  /// <summary>
  /// Get the locale-specific enum value name corresponding to the given invariant name.
  /// Note: This value is not localized currently, as we do not localized the language.
  /// </summary>
  public tryGetLocValueName(invName: string): [boolean, string] {
    // Contracts.AssertValue(invName);
    // Contracts.Assert(DName.IsValidDName(invName));

    return this._valuesInvariantToLoc.tryGetValue(invName)
  }

  /// <summary>
  /// Gets the locale-specific display value for the enum value corresponding to the given invariant name.
  /// </summary>
  public tryGetDisplayLocValueName(invName: string): [boolean, string] {
    // Contracts.AssertValue(invName);
    // Contracts.Assert(DName.IsValidDName(invName));

    return this._valuesInvariantToDisplayName.tryGetValue(invName)
  }
}
