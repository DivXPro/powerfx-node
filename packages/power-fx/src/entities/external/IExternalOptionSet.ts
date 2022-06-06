import { IExternalEntity } from './IExternalEntity'
import { DisplayNameProvider } from '../../public'
import { DName } from '../../utils'
import { DType } from '../../types'
import { OptionSet } from '../../interpreter/environment/OptionSet'

export interface IExternalOptionSet extends IExternalEntity {
  // displayNameProvider: DisplayNameProvider
  // isBooleanValued: boolean
  displayNameProvider: DisplayNameProvider

  /// <summary>
  /// Logical names for the fields in this Option Set.
  /// </summary>
  optionNames: Array<DName>

  isBooleanValued: boolean

  isConvertingDisplayNameMapping: boolean
  type: DType
}

export function IsIExternalOptionSet(data: any): data is IExternalOptionSet {
  return true
}
