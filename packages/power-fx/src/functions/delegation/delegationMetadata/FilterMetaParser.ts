import { DType } from '../../../types/DType'
import { CollectionUtils } from '../../../utils/CollectionUtils'
import { Dictionary } from '../../../utils/Dictionary'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { CapabilitiesConstants } from './CapabilitiesConstants'
import { FilterOpMetadata } from './FilterOpMetadata'
import { MetaParser } from './MetaParser'
import { ODataMetaParser } from './ODataMetaParser'

export class FilterMetaParser extends MetaParser {
  public parse(dataServiceCapabilitiesJsonObject: Record<string, any>, schema: DType): OperationCapabilityMetadata {
    // Contracts.AssertValid(schema);

    // Check if any filter metadata is specified or not.
    const { isGet: filterRestrictionExists, data: filterRestrictionJsonObject } = CollectionUtils.TryGetProperty(
      dataServiceCapabilitiesJsonObject,
      CapabilitiesConstants.Filter_Restriction,
    )
    const { isGet: globalFilterFunctionsExists, data: globalFilterFunctionsJsonArray } = CollectionUtils.TryGetProperty(
      dataServiceCapabilitiesJsonObject,
      CapabilitiesConstants.Filter_Functions,
    )
    const { isGet: globalFilterSupportsExists, data: globalFilterSupportedFunctionsJsonArray } =
      CollectionUtils.TryGetProperty(dataServiceCapabilitiesJsonObject, CapabilitiesConstants.Filter_SupportedFunctions)
    const { isGet: columnCapabilitiesExists, data: columnCapabilitiesJsonObj } = CollectionUtils.TryGetProperty(
      dataServiceCapabilitiesJsonObject,
      CapabilitiesConstants.ColumnsCapabilities,
    )

    if (
      !filterRestrictionExists &&
      !globalFilterFunctionsExists &&
      !globalFilterSupportsExists &&
      !columnCapabilitiesExists
    ) {
      return null
    }

    // Go through all filter restrictions if defined.
    const columnRestrictions = new Dictionary<DPath, DelegationCapability>()

    // If any nonFilterablepropertis exist then mark each column as such.
    if (filterRestrictionExists) {
      const { isGet, data: nonFilterablePropertiesJsonArray } = CollectionUtils.TryGetProperty(
        filterRestrictionJsonObject,
        CapabilitiesConstants.Filter_NonFilterableProperties,
      )
      if (isGet) {
      }
      for (const prop of nonFilterablePropertiesJsonArray as any[]) {
        const columnName = DPath.Root.append(new DName(prop.toString()))
        if (!columnRestrictions.has(columnName)) {
          columnRestrictions.set(columnName, new DelegationCapability(DelegationCapability.Filter))
        }
      }
    }

    // Check for any FilterFunctions defined at table level.
    let filterFunctionsSupportedByAllColumns: DelegationCapability = new DelegationCapability(DelegationCapability.None)
    if (globalFilterFunctionsExists) {
      for (const op of globalFilterFunctionsJsonArray) {
        const operatorStr: string = op.toString()
        // Contracts.AssertNonEmpty(operatorStr);

        // If we don't support the operator then don't look at this capability.
        if (!DelegationCapability.OperatorToDelegationCapabilityMap.has(operatorStr)) {
          continue
        }

        // If filter functions are specified at table level then that means filter operation is supported.
        filterFunctionsSupportedByAllColumns = DelegationCapability.LogicOr(
          filterFunctionsSupportedByAllColumns,
          DelegationCapability.LogicOr(
            DelegationCapability.OperatorToDelegationCapabilityMap.get(operatorStr),
            new DelegationCapability(DelegationCapability.Filter),
          ),
        )
      }
    }

    // Check for any FilterSupportedFunctions defined at table level.
    let filterFunctionsSupportedByTable: DelegationCapability = null
    if (globalFilterSupportsExists) {
      filterFunctionsSupportedByTable = new DelegationCapability(DelegationCapability.None)
      for (const op of globalFilterSupportedFunctionsJsonArray) {
        const operatorStr = op.toString() as string
        // Contracts.AssertNonEmpty(operatorStr)

        // If we don't support the operator then don't look at this capability.
        if (!DelegationCapability.OperatorToDelegationCapabilityMap.has(operatorStr)) {
          continue
        }

        // If filter functions are specified at table level then that means filter operation is supported.
        // filterFunctionsSupportedByTable |=
        //   DelegationCapability.OperatorToDelegationCapabilityMap[operatorStr] | DelegationCapability.Filter

        filterFunctionsSupportedByTable = DelegationCapability.LogicOr(
          filterFunctionsSupportedByTable,
          DelegationCapability.LogicOr(
            DelegationCapability.OperatorToDelegationCapabilityMap.get(operatorStr),
            new DelegationCapability(DelegationCapability.Filter),
          ),
        )
      }
    }

    const columnCapabilities = new Dictionary<DPath, DelegationCapability>()
    if (!columnCapabilitiesExists) {
      return new FilterOpMetadata(
        schema,
        columnRestrictions,
        columnCapabilities,
        filterFunctionsSupportedByAllColumns,
        filterFunctionsSupportedByTable,
      )
    }

    // Sweep through all column filter capabilities.
    for (const column in columnCapabilitiesJsonObj) {
      const columnPath = DPath.Root.append(new DName(column))

      // Internal columns don't appear in schema and we don't gather any information about it as they don't appear in expressions.
      // Task 790576: Runtime should provide visibility information along with delegation metadata information per column
      if (!schema.contains(columnPath)) {
        continue
      }

      // Get capabilities object for column
      const capabilitiesDefinedByColumn = columnCapabilitiesJsonObj[column] as Record<string, any>

      // Get properties object for the column
      if (capabilitiesDefinedByColumn.hasOwnProperty(CapabilitiesConstants.Properties)) {
        const propertyCapabilities = capabilitiesDefinedByColumn[CapabilitiesConstants.Properties]
        for (const property in propertyCapabilities) {
          const propertyPath = columnPath.append(new DName(property))
          const capabilitiesDefinedByColumnProperty = propertyCapabilities[property] as Record<string, any>
          if (!capabilitiesDefinedByColumnProperty.hasOwnProperty(CapabilitiesConstants.Capabilities)) {
            continue
          }
          const propertyCapabilityJsonObject = capabilitiesDefinedByColumnProperty[CapabilitiesConstants.Capabilities]
          const propertyCapability = this.ParseColumnCapability(
            propertyCapabilityJsonObject,
            CapabilitiesConstants.Filter_Functions,
          )
          if (propertyCapability.capabilities != DelegationCapability.None) {
            // Contracts.Assert(schema.Contains(propertyPath));

            // If column is specified as non-filterable then this metadata shouldn't be present.
            // But if it is present then we should ignore it.
            if (!columnRestrictions.has(propertyPath)) {
              columnCapabilities.set(
                propertyPath,
                new DelegationCapability(propertyCapability.capabilities | DelegationCapability.Filter),
              )
            }
          }
        }
      }

      // Get capability object defined for column.
      // This is optional as for columns with complex types (nested table or record), it will have "properties" key instead.
      // We are not supporting that case for now. So we ignore it currently.
      const { isGet: capabilityJsonObjectExist, data: capabilityJsonObject } = CollectionUtils.TryGetProperty(
        capabilitiesDefinedByColumn,
        CapabilitiesConstants.Capabilities,
      )
      if (!capabilityJsonObjectExist) {
        continue
      }

      const { isGet: isChoiceElementExists, data: isChoiceElement } = CollectionUtils.TryGetProperty(
        capabilityJsonObject,
        CapabilitiesConstants.PropertyIsChoice,
      )
      const isChoice = isChoiceElementExists && (isChoiceElement as boolean)

      const capability = this.ParseColumnCapability(capabilityJsonObject, CapabilitiesConstants.Filter_Functions)
      if (capability.capabilities != DelegationCapability.None) {
        // Contracts.Assert(schema.Contains(columnPath))

        // If column is specified as non-filterable then this metadata shouldn't be present.
        // But if it is present then we should ignore it.
        if (!columnRestrictions.has(columnPath)) {
          columnCapabilities.set(
            columnPath,
            new DelegationCapability(capability.capabilities | DelegationCapability.Filter),
          )
        }

        if (isChoice == true) {
          const choicePropertyPath = columnPath.append(new DName(ODataMetaParser.ValueProperty))
          if (!columnRestrictions.has(choicePropertyPath)) {
            columnCapabilities.set(
              choicePropertyPath,
              new DelegationCapability(capability.capabilities | DelegationCapability.Filter),
            )
          }
        }
      }
    }

    return new FilterOpMetadata(
      schema,
      columnRestrictions,
      columnCapabilities,
      filterFunctionsSupportedByAllColumns,
      filterFunctionsSupportedByTable,
    )
  }
}
