import { IExternalDataEntityMetadataProvider } from '../../entities/delegation/IExternalDataEntityMetadataProvider'
import { IDataEntityMetadata } from '../../functions/delegation'

export class DataEntityMetadataProvider implements IExternalDataEntityMetadataProvider {
  private _entityMetadatas: IDataEntityMetadata[]

  public get entityMetadatas() {
    return this._entityMetadatas
  }

  tryGetEntityMetadata(expandInfoIdentity: string): [boolean, IDataEntityMetadata] {
    const entityMetadata = this._entityMetadatas.find((metadata) => metadata.entityName === expandInfoIdentity)
    return [entityMetadata != null, entityMetadata]
  }
}
