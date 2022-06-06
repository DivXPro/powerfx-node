import { Token } from '../../lexer/tokens/Token'
import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'

export class WhitespaceSource implements ITexlSource {
  tokens: Token[]
  get sources() {
    return [this]
  }
  constructor(tokens: Token[]) {
    // Contracts.AssertValue(tokens)
    // Contracts.AssertAllValues(tokens)
    this.tokens = tokens
  }

  clone(newNodes: Map<TexlNode, TexlNode>, newSpan: Span) {
    // Contracts.AssertValue(newNodes)
    // Contracts.AssertAllValues(newNodes.Values)
    // Contracts.AssertAllValues(newNodes.Keys)
    return new WhitespaceSource(this.tokens.map((token) => token.clone(newSpan)))
  }

  toSthing() {
    return ' '
  }
}
