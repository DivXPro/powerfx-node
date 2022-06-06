import { DType } from '../../../types/DType'
import { CollectionUtils } from '../../../utils/CollectionUtils'
import { Dictionary } from '../../../utils/Dictionary'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { CapabilitiesConstants } from './CapabilitiesConstants'
import { MetaParser } from './MetaParser'
import { ODataOpMetadata } from './ODataOpMetadata'

export class ODataMetaParser extends MetaParser {
  static ValueProperty = 'Value'

  public parse(dataServiceCapabilitiesJsonObject: Record<string, any>, schema: DType): OperationCapabilityMetadata {
    // Contracts.AssertValid(schema);

    const oDataReplacement = new Dictionary<DPath, DPath>()
    const { isGet: columnCapabilitiesJsonObjExist, data: columnCapabilitiesJsonObj } = CollectionUtils.TryGetProperty(
      dataServiceCapabilitiesJsonObject,
      CapabilitiesConstants.ColumnsCapabilities,
    )
    if (columnCapabilitiesJsonObjExist) {
      for (const column in columnCapabilitiesJsonObj) {
        const columnPath = DPath.Root.append(new DName(column))

        const capabilitiesDefinedByColumn = columnCapabilitiesJsonObj[column]
        const { isGet: columnCapabilitiesExist, data: columnCapabilities } = CollectionUtils.TryGetProperty(
          capabilitiesDefinedByColumn,
          CapabilitiesConstants.Capabilities,
        )
        if (columnCapabilitiesExist) {
          const { isGet: choiceExist, data: choice } = CollectionUtils.TryGetProperty(
            columnCapabilities as Record<string, any>,
            CapabilitiesConstants.PropertyIsChoice,
          )
          if (choiceExist && choice) {
            oDataReplacement.set(columnPath.append(new DName(ODataMetaParser.ValueProperty)), columnPath)
          }
        }

        const { isGet: propertyCapabilitiesExist, data: propertyCapabilities } = CollectionUtils.TryGetProperty(
          capabilitiesDefinedByColumn,
          CapabilitiesConstants.Properties,
        )

        if (!propertyCapabilitiesExist) {
          continue
        }

        for (const property in propertyCapabilities as Record<string, any>) {
          const propertyPath = columnPath.append(new DName(property))
          const capabilitiesDefinedByColumnProperty = (propertyCapabilities as Record<string, any>)[property]

          const { isGet: propertyCapabilityJsonObjectExist, data: propertyCapabilityJsonObject } =
            CollectionUtils.TryGetProperty(capabilitiesDefinedByColumnProperty, CapabilitiesConstants.Capabilities)
          if (!propertyCapabilityJsonObjectExist) {
            continue
          }

          const { isGet: aliasExist, data: alias } = CollectionUtils.TryGetProperty(
            propertyCapabilityJsonObject as Record<string, any>,
            CapabilitiesConstants.PropertyQueryAlias,
          )
          if (aliasExist) {
            oDataReplacement.set(propertyPath, this.getReplacementPath(alias.GetString(), columnPath))
          }
        }
      }
    }

    return new ODataOpMetadata(schema, oDataReplacement)
  }

  private getReplacementPath(alias: string, currentColumnPath: DPath): DPath {
    if (alias.includes('/')) {
      let fullPath = DPath.Root

      for (const name of alias.split('/')) {
        fullPath = fullPath.append(new DName(name))
      }

      return fullPath
    } else {
      // Task 5593666: This is temporary to not cause regressions while sharepoint switches to using full query param
      return currentColumnPath.append(new DName(alias))
    }
  }
}
