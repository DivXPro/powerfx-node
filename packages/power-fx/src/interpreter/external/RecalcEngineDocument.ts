import { IExternalDocument } from '../../app/IExternalDocument'
import { IExternalDocumentProperties } from '../../app/IExternalDocumentProperties'
import { IExternalControl } from '../../app/controls/IExternalControl'
import { EntityScope } from './EntityScope'
import { DName } from '../../utils'

export class RecalcEngineDocument implements IExternalDocument {
  globalScope: EntityScope
  properties: IExternalDocumentProperties

  constructor(entityScope: EntityScope, properties?: IExternalDocumentProperties) {
    this.globalScope = entityScope
    this.properties = properties
  }

  tryGetControlByUniqueId(name: string): [boolean, IExternalControl] {
    return this.globalScope.tryGetControl(new DName(name))
  }

  public tryGetEntity(name: DName | string) {
    if (typeof name === 'string') {
      return this.globalScope.tryGetEntity(new DName(name))
    }
    return this.globalScope.tryGetEntity(name)
  }

  public get controlValues() {
    return this.globalScope.controlsValue
  }

  public get controls() {
    return this.globalScope.controls
  }
}
