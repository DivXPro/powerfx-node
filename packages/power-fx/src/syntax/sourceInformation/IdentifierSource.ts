import { Span } from '../../localization/Span'
import { Identifier } from '../Identifier'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'

export class IdentifierSource implements ITexlSource {
  public identifier: Identifier

  get tokens() {
    return [this.identifier.token]
  }

  get sources() {
    return [this]
  }

  constructor(identifier: Identifier) {
    // Contracts.AssertValue(identifier);
    this.identifier = identifier
  }

  public clone(newNodes: Map<TexlNode, TexlNode>, span: Span) {
    // Contracts.AssertValue(newNodes)
    // Contracts.AssertAllValues(newNodes.Values)
    // Contracts.AssertAllValues(newNodes.Keys)
    return new IdentifierSource(this.identifier.clone(span))
  }
}
