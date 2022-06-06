import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { FilterOpMetadata } from './FilterOpMetadata'
import { GroupOpMetadata } from './GroupOpMetadata'
import { ODataOpMetadata } from './ODataOpMetadata'
import { SortOpMetadata } from './SortOpMetadata'

// Container type for all OperationCapabilityMetadata. This represents a metadata for the entire table.
export class CompositeCapabilityMetadata extends OperationCapabilityMetadata {
  private readonly _compositeMetadata: Array<OperationCapabilityMetadata>

  constructor(schema: DType, compositeMetadata: Array<OperationCapabilityMetadata>) {
    // Contracts.AssertValue(compositeMetadata);
    super(schema)
    this._compositeMetadata = compositeMetadata
  }

  public get oDataPathReplacementMap(): Dictionary<DPath, DPath> {
    const op = this._compositeMetadata.filter((metadata) => metadata instanceof ODataOpMetadata)[0]
    return op != null ? op.queryPathReplacement : new Dictionary<DPath, DPath>()
  }

  public get filterDelegationMetadata(): FilterOpMetadata {
    return this._compositeMetadata.filter((metadata) => metadata instanceof FilterOpMetadata)[0] as FilterOpMetadata
  }

  public get sortDelegationMetadata() {
    return this._compositeMetadata.filter((metadata) => metadata instanceof SortOpMetadata)[0] as SortOpMetadata
  }

  public get groupDelegationMetadata() {
    return this._compositeMetadata.filter((metadata) => metadata instanceof GroupOpMetadata)[0] as GroupOpMetadata
  }

  public get tableCapabilities(): DelegationCapability {
    let capabilities = DelegationCapability.None
    for (const metadata of this._compositeMetadata) {
      capabilities |= metadata.tableCapabilities.capabilities
    }

    return new DelegationCapability(capabilities)
  }

  public get tableAttributes(): DelegationCapability {
    let capabilities = DelegationCapability.None
    for (const metadata of this._compositeMetadata) {
      capabilities |= metadata.defaultColumnCapabilities.capabilities
    }

    return new DelegationCapability(capabilities)
  }

  public get defaultColumnCapabilities(): DelegationCapability {
    let capabilities = DelegationCapability.None
    for (const metadata of this._compositeMetadata) {
      capabilities |= metadata.defaultColumnCapabilities.capabilities
    }

    return new DelegationCapability(capabilities)
  }
}
