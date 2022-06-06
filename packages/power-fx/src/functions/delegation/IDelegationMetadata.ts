import { DType } from '../../types/DType'
import { DPath } from '../../utils/DPath'
import { DelegationCapability } from './DelegationCapability'
import { FilterOpMetadata } from './delegationMetadata/FilterOpMetadata'
import { GroupOpMetadata } from './delegationMetadata/GroupOpMetadata'
import { SortOpMetadata } from './delegationMetadata/SortOpMetadata'

export interface IDelegationMetadata {
  schema: DType
  tableAttributes: DelegationCapability
  tableCapabilities: DelegationCapability
  sortDelegationMetadata: SortOpMetadata
  filterDelegationMetadata: FilterOpMetadata
  groupDelegationMetadata: GroupOpMetadata
  oDataPathReplacementMap: Map<DPath, DPath>
}
