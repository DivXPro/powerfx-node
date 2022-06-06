import { IExternalEntityScope } from '../entities/external/IExternalEntityScope'
import { IExternalControl } from './controls/IExternalControl'
import { IExternalDocumentProperties } from './IExternalDocumentProperties'

export interface IExternalDocument {
  properties: IExternalDocumentProperties
  globalScope: IExternalEntityScope
  tryGetControlByUniqueId(name: string): [boolean, IExternalControl]
}
