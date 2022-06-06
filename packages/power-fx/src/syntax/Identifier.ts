import { IdentToken } from '../lexer/tokens'
import { Token } from '../lexer/tokens/Token'
import { Span } from '../localization'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'

export class Identifier {
  readonly atToken?: Token
  readonly token: IdentToken
  readonly name: DName
  readonly namespace: DPath
  constructor(theNamespace: DPath | undefined, atToken: Token | undefined, tok: IdentToken) {
    // Contracts.Assert(theNamespace.IsValid)
    // Contracts.AssertValueOrNull(atToken)
    // Contracts.AssertValue(tok)
    // Contracts.Assert(tok.Name.IsValid)
    this.token = tok
    this.namespace = theNamespace || DPath.Root
    this.atToken = atToken
    this.name = tok.name
  }

  clone(ts: Span) {
    return new Identifier(
      this.namespace,
      this.atToken != null ? this.atToken.clone(ts) : undefined,
      this.token.clone(ts),
    )
  }
}
