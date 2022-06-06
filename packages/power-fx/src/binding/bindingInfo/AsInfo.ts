import { AsNode } from '../../syntax'
import { DName } from '../../utils/DName'

export class AsInfo {
  readonly node: AsNode
  readonly asIdentifier: DName

  constructor(node: AsNode, asIdentifier: DName) {
    this.node = node
    this.asIdentifier = asIdentifier
  }
}
