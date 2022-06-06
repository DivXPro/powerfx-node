import { IDataEntityMetadata } from '../../functions/delegation/IDataEntityMetadata'
import { IFlowMetadata } from '../../functions/delegation/IFlowMetadata'

export interface IExternalFlowMetadataProvider {
  tryGetFlowMetadata(identity: string): [boolean, IFlowMetadata]
}
