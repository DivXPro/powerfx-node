import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'

export class NodeSource implements ITexlSource {
  node: TexlNode
  get tokens() {
    return this.node.sourceList.tokens
  }
  sources: ITexlSource[] = [this]

  constructor(node: TexlNode) {
    // Contracts.AssertValue(node)
    this.node = node
  }

  clone(newNodes: Map<TexlNode, TexlNode>, span: Span) {
    // Contracts.AssertAllValues(newNodes.Keys)
    // Contracts.AssertAllValues(newNodes.Values)
    // Contracts.AssertValue(newNodes)

    return new NodeSource(newNodes.get(this.node) as TexlNode)
  }

  toString() {
    return this.node.toString()
  }
}
