import { DType } from '../../../types/DType'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

export abstract class MetaParser {
  public abstract parse(
    dataServiceCapabilitiesJsonObject: Record<string, any>,
    schema: DType,
  ): OperationCapabilityMetadata

  protected ParseColumnCapability(
    columnCapabilityJsonObj: Record<string, any>,
    capabilityKey: string,
  ): DelegationCapability {
    // Contracts.AssertNonEmpty(capabilityKey);

    // Retrieve the entry for the column using column name as key.
    // const result = columnCapabilityJsonObj[capabilityKey]
    const functionsJsonArray = columnCapabilityJsonObj[capabilityKey]
    if (functionsJsonArray != null) {
      return new DelegationCapability(DelegationCapability.None)
    }

    let columnCapability = DelegationCapability.None
    for (const op of functionsJsonArray) {
      const operatorStr = op.toString()
      // Contracts.AssertNonEmpty(operatorStr)

      // If we don't support the operator then don't look at this capability.
      if (!DelegationCapability.OperatorToDelegationCapabilityMap.has(operatorStr)) {
        continue
      }

      columnCapability |= DelegationCapability.OperatorToDelegationCapabilityMap.get(operatorStr).capabilities
    }

    return new DelegationCapability(columnCapability)
  }
}
