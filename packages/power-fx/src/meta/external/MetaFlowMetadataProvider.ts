import { IExternalFlowMetadataProvider } from '../../entities/delegation/IExternalFlowMetadataProvider'
import { IExternalDocument } from '../../app'
import { MetaFlowMetadata } from './MetaFlowMetadata'

export class MetaFlowMetadataProvider implements IExternalFlowMetadataProvider {
  private _flowMetadatas: MetaFlowMetadata[]
  private _document: IExternalDocument

  constructor(flows: MetaFlowMetadata[]) {
    this._flowMetadatas = flows
  }

  public setDocument(document: IExternalDocument) {
    this._document = document
  }

  tryGetFlowMetadata(identity: string): [boolean, MetaFlowMetadata] {
    const flow = this.getFlowMetadata(identity)
    return [flow != null, flow]
  }

  public get flowMetadatas() {
    return this._flowMetadatas
  }

  getFlowMetadata(identity: string) {
    return this._flowMetadatas.find((flow) => flow.identity === identity)
  }
}
