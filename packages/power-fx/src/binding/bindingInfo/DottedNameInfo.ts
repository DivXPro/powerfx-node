import { DottedNameNode } from '../../syntax'

export class DottedNameInfo {
  public readonly node: DottedNameNode

  // Optional data associated with a DottedNameNode. May be null.
  public readonly data: any

  constructor(node: DottedNameNode, data?: any) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValueOrNull(data);

    this.node = node
    this.data = data
  }
}
