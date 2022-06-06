import { Token } from '../../lexer/tokens/Token'
import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'
import { ITexlSource } from './ITexlSource'
/// <summary>
/// An individual non-whitespace token that is part of the source for its
/// holding TexlNode.

/// </summary>
export class TokenSource implements ITexlSource {
  public token: Token

  get tokens() {
    return [this.token]
  }

  get sources(): TokenSource[] {
    return [this]
  }

  constructor(token: Token) {
    // Contracts.AssertValue(token);
    this.token = token
  }

  public clone(newNodes: Map<TexlNode, TexlNode>, newSpan: Span) {
    // Contracts.AssertValue(newNodes);
    // Contracts.AssertAllValues(newNodes.Values);
    // Contracts.AssertAllValues(newNodes.Keys);
    return new TokenSource(this.token.clone(newSpan))
  }

  public ToString() {
    // return Enum.GetName(typeof(TokKind), Token.Kind);
  }
}
