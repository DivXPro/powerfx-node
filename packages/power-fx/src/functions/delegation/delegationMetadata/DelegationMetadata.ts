import { DelegationMetadataParser } from './DelegationMetadataParser'
import { CompositeCapabilityMetadata } from './CompositeCapabilityMetadata'
import { IDelegationMetadata } from '../IDelegationMetadata'
import { DType } from '../../../types/DType'
/// <summary>
/// This represents a delegatable operation metadata about the imported delegatable CdpDataSourceInfo.
/// </summary>
export class DelegationMetadata implements IDelegationMetadata {
  private readonly _compositeMetadata: CompositeCapabilityMetadata
  schema: DType
  get tableAttributes() {
    return this._compositeMetadata.tableAttributes
  }
  get tableCapabilities() {
    return this._compositeMetadata.tableCapabilities
  }
  get sortDelegationMetadata() {
    return this._compositeMetadata.sortDelegationMetadata
  }
  get filterDelegationMetadata() {
    return this._compositeMetadata.filterDelegationMetadata
  }
  get groupDelegationMetadata() {
    return this._compositeMetadata.groupDelegationMetadata
  }
  get oDataPathReplacementMap() {
    return this._compositeMetadata.oDataPathReplacementMap
  }

  constructor(schema: DType, delegationMetadataJson: string) {
    // Contracts.AssertValid(schema);

    const metadataParser = new DelegationMetadataParser()
    this._compositeMetadata = metadataParser.parse(delegationMetadataJson, schema)
    // Contracts.AssertValue(_compositeMetadata);

    this.schema = schema
  }
}
