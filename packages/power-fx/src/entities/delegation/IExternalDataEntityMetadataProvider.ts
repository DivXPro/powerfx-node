import { IDataEntityMetadata } from '../../functions/delegation/IDataEntityMetadata'

export interface IExternalDataEntityMetadataProvider {
  tryGetEntityMetadata(expandInfoIdentity: string): [boolean, IDataEntityMetadata]
}
