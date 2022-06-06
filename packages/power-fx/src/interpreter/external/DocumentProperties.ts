import { IExternalDocumentProperties } from '../../app/IExternalDocumentProperties'
import { IExternalEnabledFeatures } from '../../app/IExternalEnabledFeatures'

export class DocumentProperties implements IExternalDocumentProperties {
  disallowedFunctions: Record<string, number>
  enabledFeatures: IExternalEnabledFeatures
  supportsImplicitThisItem: boolean
}
