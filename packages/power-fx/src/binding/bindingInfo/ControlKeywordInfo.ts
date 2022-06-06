import { IExternalControl } from '../../app/controls/IExternalControl'
import { NameNode } from '../../syntax'
import { DPath } from '../../utils/DPath'
import { BindKind } from '../BindKind'
import { NameInfo } from './NameInfo'

export abstract class ControlKeywordInfo extends NameInfo {
  // Qualifying path. May be DPath.Root (unqualified).
  public readonly path: DPath

  // Data associated with a control keyword node. May be null.
  public readonly data: IExternalControl

  constructor(node: NameNode, path: DPath, data: IExternalControl) {
    // Contracts.AssertValid(path);
    // Contracts.AssertValueOrNull(data);
    super(BindKind.Control, node)
    this.path = path
    this.data = data
  }
}
