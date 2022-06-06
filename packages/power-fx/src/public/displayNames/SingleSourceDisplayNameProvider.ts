import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { NameCollisionException } from '../NameCollisionException'
import { DisplayNameProvider } from './DisplayNameProvider'

export class SingleSourceDisplayNameProvider extends DisplayNameProvider {
  // First is Logical Name, Second is Display Name
  private readonly _logicalToDisplay: Dictionary<DName, DName>
  private readonly _displayToLogical: Dictionary<DName, DName>

  constructor(logicalToDisplay?: Dictionary<DName, DName>, displayToLogical?: Dictionary<DName, DName>) {
    super()
    this._logicalToDisplay = logicalToDisplay ?? new Dictionary<DName, DName>()
    this._displayToLogical = displayToLogical ?? new Dictionary<DName, DName>()
  }

  public addField(logicalName: DName, displayName: DName): SingleSourceDisplayNameProvider {
    // Check for collisions between display and logical names
    if (
      this._displayToLogical.has(logicalName) ||
      this._logicalToDisplay.has(logicalName) ||
      this._logicalToDisplay.has(displayName) ||
      this._displayToLogical.has(displayName)
    ) {
      throw new NameCollisionException(displayName.value)
    }

    const newDisplayToLogical = this._displayToLogical.set(displayName, logicalName)
    const newLogicalToDisplay = this._logicalToDisplay.set(logicalName, displayName)

    return new SingleSourceDisplayNameProvider(newLogicalToDisplay, newDisplayToLogical)
  }

  public tryGetLogicalName(displayName: DName): [boolean, DName] {
    return this._displayToLogical.tryGetValue(displayName)
  }

  public tryGetDisplayName(logicalName: DName): [boolean, DName] {
    return this._logicalToDisplay.tryGetValue(logicalName)
  }

  public tryRemapLogicalAndDisplayNames(displayName: DName): [boolean, { logicalName: DName; newDisplayName: DName }] {
    const newDisplayName = displayName
    const result = this.tryGetLogicalName(displayName)
    return [result[0], { logicalName: result[1], newDisplayName }]
  }
}
