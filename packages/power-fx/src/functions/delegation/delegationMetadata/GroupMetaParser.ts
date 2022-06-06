import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { CapabilitiesConstants } from './CapabilitiesConstants'
import { GroupOpMetadata } from './GroupOpMetadata'
import { MetaParser } from './MetaParser'

export class GroupMetaParser extends MetaParser {
  public parse(dataServiceCapabilitiesJsonObject: Record<string, any>, schema: DType) {
    // Contracts.AssertValid(schema);

    const columnRestrictions = new Dictionary<DPath, DelegationCapability>()
    const groupRestrictionJsonObject = dataServiceCapabilitiesJsonObject[CapabilitiesConstants.Group_Restriction]
    if (groupRestrictionJsonObject == null) {
      return null
    }
    const ungroupablePropertiesJsonArray = groupRestrictionJsonObject[CapabilitiesConstants.Group_UngroupableProperties]
    if (ungroupablePropertiesJsonArray != null) {
      for (const prop of ungroupablePropertiesJsonArray) {
        const columnName = new DName(prop.toString())
        const columnPath = DPath.Root.append(columnName)

        if (!columnRestrictions.has(columnPath)) {
          columnRestrictions.set(columnPath, new DelegationCapability(DelegationCapability.Group))
        }
      }
    }
    return new GroupOpMetadata(schema, columnRestrictions)
  }
}
