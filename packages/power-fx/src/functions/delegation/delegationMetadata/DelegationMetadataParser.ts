import { DType } from '../../../types/DType'
import { CompositeCapabilityMetadata } from './CompositeCapabilityMetadata'
import { CompositeMetaParser } from './CompositeMetaParser'
import { FilterMetaParser } from './FilterMetaParser'
import { GroupMetaParser } from './GroupMetaParser'
import { ODataMetaParser } from './ODataMetaParser'
import { SortMetaParser } from './SortMetaParser'

export class DelegationMetadataParser {
  public parse(
    delegationMetadataJson: string,
    tableSchema: DType
  ): CompositeCapabilityMetadata {
    // Contracts.AssertValid(tableSchema);

    const result = JSON.parse(delegationMetadataJson)

    const compositeParser = new CompositeMetaParser()
    compositeParser.addMetaParser(new SortMetaParser())
    compositeParser.addMetaParser(new FilterMetaParser())
    compositeParser.addMetaParser(new GroupMetaParser())
    compositeParser.addMetaParser(new ODataMetaParser())

    let dataServiceCapabilitiesJsonObject = result.RootElement

    return compositeParser.parse(
      dataServiceCapabilitiesJsonObject,
      tableSchema
    ) as CompositeCapabilityMetadata
  }
}
