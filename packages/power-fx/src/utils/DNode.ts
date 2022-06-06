import { DName } from './DName'
import { ICheckable } from './types'

export class DNode implements ICheckable {
  readonly parent?: DNode
  readonly name: DName
  readonly length: number

  get isValid() {
    return this.name.isValid && (this.parent == null ? this.length === 1 : this.length === this.parent.length + 1)
  }

  constructor(parent: DNode | undefined, name: DName) {
    this.parent = parent
    this.name = name
    this.length = parent == null ? 1 : 1 + parent.length
  }

  public append(node?: DNode): DNode {
    if (node == null) {
      return this
    }
    return new DNode(this.append(node.parent), node.name)
  }
}
