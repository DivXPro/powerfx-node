import { Flow, IFlowProps } from '../../interpreter/external/Flow'
import { MetaEngineDocument } from '../MetaEngineDocument'

export interface IMetaAutoFlowProps extends IFlowProps {
  document: MetaEngineDocument
}

export class MetaFlow extends Flow {
  public declare readonly document: MetaEngineDocument
  constructor(props: IMetaAutoFlowProps) {
    super(props)
  }
}
