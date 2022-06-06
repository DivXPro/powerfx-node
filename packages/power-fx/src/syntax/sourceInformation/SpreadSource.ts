import { Token } from '../../lexer/tokens/Token'
import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'

export class SpreadSource {
  sources: ITexlSource[]

  get tokens() {
    const tks: Token[] = []
    this.sources.forEach((source) => tks.push(...source.tokens))
    return tks
  }

  constructor(...sources: ITexlSource[]) {
    //  Contracts.AssertValue(sources)
    //  Contracts.AssertAllValues(sources)
    this.sources = sources
  }

  public clone(newNodes: Map<TexlNode, TexlNode>, newSpan: Span) {
    // Contracts.AssertValue(newNodes)
    // Contracts.AssertAllValues(newNodes.Values)
    // Contracts.AssertAllValues(newNodes.Keys)
    const newItems: ITexlSource[] = []
    this.sources.forEach((source, i) => {
      newItems[i] = source.clone(newNodes, newSpan)
    })
    return new SpreadSource(...newItems)
  }

  public toString() {
    return this.sources.map((s) => s.toString()).join('')
  }
}
