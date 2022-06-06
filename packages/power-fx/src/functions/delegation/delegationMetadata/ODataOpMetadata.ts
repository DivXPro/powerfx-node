import { DType } from '../../../types/DType'
import { Dictionary } from '../../../utils/Dictionary'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

export class ODataOpMetadata extends OperationCapabilityMetadata {
  private readonly _oDataReplacement: Dictionary<DPath, DPath>

  constructor(schema: DType, oDataReplacement: Dictionary<DPath, DPath>) {
    // Contracts.AssertValue(oDataReplacement);
    super(schema)

    this._oDataReplacement = oDataReplacement
  }

  public get queryPathReplacement() {
    return this._oDataReplacement
  }

  public get defaultColumnCapabilities() {
    return new DelegationCapability(DelegationCapability.None)
  }

  public get tableCapabilities() {
    return this.defaultColumnCapabilities
  }
}
