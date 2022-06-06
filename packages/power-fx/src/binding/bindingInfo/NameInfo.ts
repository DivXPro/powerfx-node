import { NameNode } from '../../syntax/nodes'
import { DName } from '../../utils/DName'
import { BindKind } from '../BindKind'

export abstract class NameInfo {
  public readonly kind: BindKind
  public readonly node: NameNode

  private readonly _name: DName
  public get name(): DName {
    return this._name
  }

  constructor(kind: BindKind, node: NameNode) {
    // Contracts.Assert(BindKind._Min <= kind && kind < BindKind._Lim);
    // Contracts.AssertValue(node);

    this.kind = kind
    this.node = node
  }
}
