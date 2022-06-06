import { DName } from '../../utils/DName'
import { DisplayNameProvider } from './DisplayNameProvider'
// If there are multiple DisplayNameProviders associated with a type, we may have name conflicts
// In that case, we block the use of display names using this provider
export class DisabledDisplayNameProvider extends DisplayNameProvider {
  public static get Instance() {
    return new DisabledDisplayNameProvider()
  }

  construction() {}

  public tryGetDisplayName(logicalName: DName): [boolean, DName] {
    const displayName: DName = undefined
    return [false, displayName]
  }

  public tryGetLogicalName(displayName: DName): [boolean, DName] {
    const logicalName: DName = undefined
    return [false, logicalName]
  }

  public tryRemapLogicalAndDisplayNames(displayName: DName): [boolean, { logicalName: DName; newDisplayName: DName }] {
    return [false, { logicalName: DName.Default(), newDisplayName: DName.Default() }]
  }
}
