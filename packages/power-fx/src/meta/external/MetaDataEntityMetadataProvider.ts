import { IExternalDataEntityMetadataProvider } from '../../entities/delegation/IExternalDataEntityMetadataProvider'
import { MetaCdsDataSource } from './MetaCdsDataSource'
import { IExternalDocument } from '../../app'
import { DataSourceKind } from '../../entities'
import { DName } from '../../utils'
import { MetaDataEntityMetadata } from './MetaDataEntityMetadata'
import { MetaTableMetadata } from './MetaTableMetadata'

export class MetaDataEntityMetadataProvider implements IExternalDataEntityMetadataProvider {
  private _entityMetadatas: MetaDataEntityMetadata[]
  private _document: IExternalDocument

  public get entityMetadatas() {
    return this._entityMetadatas
  }

  public get document() {
    return this._document
  }

  public setDocument(document: IExternalDocument) {
    this._document = document
  }

  constructor(entityMetadatas: MetaDataEntityMetadata[]) {
    this._entityMetadatas = entityMetadatas
  }

  tryGetEntityMetadata(expandInfoIdentity: string): [boolean, MetaDataEntityMetadata] {
    const entityMetadata = this.getEntityMetadata(expandInfoIdentity)
    return [entityMetadata != null, entityMetadata]
  }

  getEntityMetadata(expandInfoIdentity: string) {
    return this._entityMetadatas.find((metadata) => metadata.entityName === expandInfoIdentity)
  }

  getDataSource(expandInfoIdentity: string) {
    const entityMetaData = this.getEntityMetadata(expandInfoIdentity)
    if (entityMetaData) {
      return new MetaCdsDataSource({
        dataEntityMetadataProvider: this,
        queryOptions: undefined,
        entityName: new DName(entityMetaData.entityName),
        tableDefinition: entityMetaData.entityDefinition,
        displayNameMapping: Object.fromEntries(entityMetaData.displayNameMapping.getEnumerator()),
        previousDisplayNameMapping: Object.fromEntries(entityMetaData.displayNameMapping.getEnumerator()),
        datasetName: entityMetaData.datasetName,
        document: this.document,
        name: entityMetaData.entityName,
        isSelectable: true,
        isDelegatable: true,
        isPageable: true,
        kind: DataSourceKind.CdsNative,
        tableMetadata: MetaTableMetadata.MakeTableMetadata(entityMetaData.entityDefinition),
        scopeId: undefined,
      })
    }
  }
}
