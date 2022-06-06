import { Token } from '../lexer/tokens'
import { TokKind } from '../lexer/TokKind'

export class TokenCursor {
  private readonly _tokens: Token[]
  private readonly _tokenCount: number = 0

  private _currentTokenIndex: number = 0
  private _currentToken: Token
  private _currentTokenId: TokKind

  constructor(rgtok: Token[]) {
    // Contracts.AssertValue(rgtok);
    // Contracts.Assert(rgtok.Length > 0 && rgtok[rgtok.Length - 1].Kind == TokKind.Eof);
    this._tokens = rgtok
    this._tokenCount = this._tokens.length

    this._currentToken = this._tokens[0]
    this._currentTokenId = this._currentToken.kind
  }

  public Split(): TokenCursor {
    const split = new TokenCursor(this._tokens)
    split._currentTokenIndex = this._currentTokenIndex
    split._currentToken = this._currentToken
    split._currentTokenId = this._currentTokenId
    return split
  }

  // [Conditional("DEBUG")]
  private assertValid() {
    // Contracts.AssertValue(_tokens);
    // Contracts.Assert(_tokenCount > 0 && _tokenCount <= _tokens.Length);
    // Contracts.Assert(_tokens[_tokenCount - 1].Kind == TokKind.Eof);
    // Contracts.AssertIndex(_currentTokenIndex, _tokenCount);
    // Contracts.Assert(_currentToken == _tokens[_currentTokenIndex]);
    // Contracts.Assert(_currentTokenId == _currentToken.Kind);
  }

  public get itokLim(): number {
    // this.assertValid()
    return this._tokenCount
  }

  public get itokCur() {
    // this.assertValid()
    return this._currentTokenIndex
  }

  public get tokCur(): Token {
    // this.assertValid()
    return this._currentToken
  }

  public get tidCur(): TokKind {
    // this.assertValid()
    return this._currentTokenId
  }

  public moveTo(tokenIndex: number) {
    this.assertValid()
    // Contracts.AssertIndex(_currentTokenIndex, _tokenCount);
    this._currentTokenIndex = tokenIndex
    this._currentToken = this._tokens[this._currentTokenIndex]
    this._currentTokenId = this._currentToken.kind
    this.assertValid()
  }

  public tokMove(): Token {
    this.assertValid()
    const tok = this._currentToken
    if (this._currentTokenId != TokKind.Eof) {
      this.moveTo(this._currentTokenIndex + 1)
    }
    return tok
  }

  public tidPeek(ditok?: number): TokKind {
    this.assertValid()
    let itok: number
    if (ditok != null) {
      itok = this.itokPeek(ditok)
      // Contracts.AssertIndex(_currentTokenIndex, _tokenCount)
      return this._tokens[itok].kind
    } else {
      if ((itok = this._currentTokenIndex + 1) < this._tokenCount) {
        return this._tokens[itok].kind
      }
      return this._currentTokenId
    }
  }

  public skipWhitespace(initial?: Array<Token>): Array<Token> {
    const tokens: Array<Token> = []
    while (this._currentTokenId == TokKind.Whitespace) {
      tokens.push(this.tokMove())
    }

    return initial ? initial.concat(...tokens) : tokens
  }

  private itokPeek(ditok: number): number {
    this.assertValid()

    let itokPeek = this._currentTokenIndex + ditok
    if (itokPeek >= this._tokenCount) {
      return this._tokenCount - 1
    }

    if (itokPeek < 0) {
      return ditok <= 0 ? 0 : this._tokenCount - 1
    }

    return itokPeek
  }
}
