import { DName } from '../../utils/DName'

export abstract class DisplayNameProvider {
  public abstract tryGetLogicalName(displayName: DName): [boolean, DName]
  public abstract tryGetDisplayName(logicalName: DName): [boolean, DName]
  /// <summary>
  /// This function attempts to remap logical and display names given a display name.
  /// It's used for scenarios where display names are changed under the hood while the expression is in display name format already.
  /// This is a legacy Canvas app behavior, and should not be supported implemented by non-canvas hosts.
  /// If this isn't supported by a given display name provider, this should return the same as
  /// <see cref="TryGetLogicalName(DName, out DName)"/>, with the newDisplayName output populated by the first arg.
  /// </summary>
  public abstract tryRemapLogicalAndDisplayNames(
    displayName: DName,
  ): [boolean, { logicalName: DName; newDisplayName: DName }]
}
