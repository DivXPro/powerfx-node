import { DType } from '../../../types/DType'
import { CollectionUtils } from '../../../utils/CollectionUtils'
import { Dictionary } from '../../../utils/Dictionary'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { CapabilitiesConstants } from './CapabilitiesConstants'
import { MetaParser } from './MetaParser'
import { SortOpMetadata } from './SortOpMetadata'

export class SortMetaParser extends MetaParser {
  public parse(
    dataServiceCapabilitiesJsonObject: Record<string, any>,
    schema: DType
  ): OperationCapabilityMetadata {
    // Contracts.AssertValid(schema);

    const columnRestrictions = new Dictionary<DPath, DelegationCapability>()
    const {
      isGet: sortRestrictionJsonObjectExist,
      data: sortRestrictionJsonObject,
    } = CollectionUtils.TryGetProperty(
      dataServiceCapabilitiesJsonObject,
      CapabilitiesConstants.Sort_Restriction
    )
    if (!sortRestrictionJsonObjectExist) {
      return null
    }

    const {
      isGet: unSortablePropertiesJsonArrayExist,
      data: unSortablePropertiesJsonArray,
    } = CollectionUtils.TryGetProperty(
      sortRestrictionJsonObject,
      CapabilitiesConstants.Sort_UnsortableProperties
    )
    if (unSortablePropertiesJsonArrayExist) {
      for (const prop of unSortablePropertiesJsonArray as any[]) {
        const columnName = new DName(prop.toString())
        const columnPath = DPath.Root.append(columnName)

        if (!columnRestrictions.has(columnPath)) {
          columnRestrictions.set(
            columnPath,
            new DelegationCapability(DelegationCapability.Sort)
          )
        }
      }
    }

    const {
      isGet: acendingOnlyPropertiesJsonArrayExist,
      data: acendingOnlyPropertiesJsonArray,
    } = CollectionUtils.TryGetProperty(
      sortRestrictionJsonObject,
      CapabilitiesConstants.Sort_AscendingOnlyProperties
    )

    if (acendingOnlyPropertiesJsonArrayExist) {
      for (const prop of acendingOnlyPropertiesJsonArray as any[]) {
        const columnName = new DName(prop.toString())
        const columnPath = DPath.Root.append(columnName)

        if (!columnRestrictions.has(columnPath)) {
          columnRestrictions.set(
            columnPath,
            new DelegationCapability(DelegationCapability.SortAscendingOnly)
          )
          continue
        }

        let existingRestrictions =
          columnRestrictions.get(columnPath).capabilities
        columnRestrictions.set(
          columnPath,
          new DelegationCapability(
            existingRestrictions | DelegationCapability.SortAscendingOnly
          )
        )
      }
    }

    return new SortOpMetadata(schema, columnRestrictions)
  }
}
