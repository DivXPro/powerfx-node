/// <summary>
/// A complete list of the source for a given TexlNode, given by a
/// heterogeneous list of individual pieces of source.

import { TokenSource } from './TokenSource'
import { Token } from '../../lexer/tokens/Token'
import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'

/// </summary>
export class SourceList {
  /// <summary>
  /// All the pieces of source for the holding TexlNode.
  /// </summary>
  public sources: ITexlSource[]

  /// <summary>
  /// Every node that makes up the holding TexlNode.
  /// </summary>
  public get tokens() {
    const toks: Token[] = []
    this.sources.forEach((source) => {
      toks.push(...source.tokens)
    })
    return toks
  }

  constructor(itemsOrToken: ITexlSource[] | ITexlSource | Token) {
    if (itemsOrToken instanceof Token) {
      // Contracts.AssertValue(itemsOrToken);
      this.sources = [new TokenSource(itemsOrToken)]
    } else {
      // Contracts.AssertValue(itemsOrToken);
      // Contracts.AssertAllValues(itemsOrToken);
      const sources: ITexlSource[] = []
      const arr = Array.isArray(itemsOrToken) ? itemsOrToken : [itemsOrToken]
      arr.forEach((item) => {
        sources.push(...item.sources)
      })
      this.sources = sources
    }
  }

  public clone(span: Span, newNodes: Map<TexlNode, TexlNode>): SourceList {
    // Contracts.AssertValue(newNodes);
    // Contracts.AssertAllValues(newNodes.Values);
    // Contracts.AssertAllValues(newNodes.Keys);
    const newItems: ITexlSource[] = []
    this.sources.forEach((source, i) => {
      newItems[i] = source.clone(newNodes, span)
    })
    return new SourceList(newItems)
  }
}
