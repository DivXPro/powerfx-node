import { DType } from '../../../types/DType'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { CompositeCapabilityMetadata } from './CompositeCapabilityMetadata'
import { MetaParser } from './MetaParser'

export class CompositeMetaParser extends MetaParser {
  private readonly _metaParsers: Array<MetaParser>

  constructor() {
    super()
    this._metaParsers = []
  }

  public parse(
    dataServiceCapabilitiesJsonObject: Record<string, any>,
    schema: DType
  ): OperationCapabilityMetadata {
    // Contracts.AssertValid(schema);

    const capabilities: Array<OperationCapabilityMetadata> = []
    for (const parser of this._metaParsers) {
      let capabilityMetadata = parser.parse(
        dataServiceCapabilitiesJsonObject,
        schema
      )
      if (capabilityMetadata != null) {
        capabilities.push(capabilityMetadata)
      }
    }

    return new CompositeCapabilityMetadata(schema, capabilities)
  }

  public addMetaParser(metaParser: MetaParser) {
    // Contracts.AssertValue(metaParser)

    this._metaParsers.push(metaParser)
  }
}
