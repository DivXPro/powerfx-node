import { StringResources } from '../localization'

export class LanguageConstants {
  /// <summary>
  /// The string value representing SortOrder enum.
  /// </summary>
  public static get SortOrderEnumString() {
    return StringResources.Get('LocaleSpecificEnum_SortOrder')
  }

  /// <summary>
  /// Defines ascending sort order string constant.
  /// </summary>
  static AscendingSortOrderString = 'ascending'

  /// <summary>
  /// Defines descending sort order string constant.
  /// </summary>
  static DescendingSortOrderString = 'descending'

  /// <summary>
  /// The string value representing the locale invariant calendar function namespace.
  /// </summary>
  static InvariantCalendarNamespace = 'Calendar'

  /// <summary>
  /// The string value representing the locale invariant clock function namespace.
  /// </summary>
  static InvariantClockNamespace = 'Clock'

  /// <summary>
  /// The invariant string value representing SortOrder enum.
  /// </summary>
  static get SortOrderEnumStringInvariant() {
    return 'SortOrder'
  }
}
