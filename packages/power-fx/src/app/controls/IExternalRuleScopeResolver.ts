import { ScopedNameLookupInfo } from '../../binding/bindingInfo'
import { DName } from '../../utils/DName'

export interface IExternalRuleScopeResolver {
  lookup(identName: DName): [boolean, ScopedNameLookupInfo]
}
