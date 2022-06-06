import { DocumentErrorSeverity, TexlError } from '../errors'
import { FeatureFlags } from '../FeatureFlags'
import { BinaryOp } from '../lexer/BinaryOp'
import TexlLexer, { TexlLexerFlags } from '../lexer/TexlLexer'
import { CommentToken, ErrorToken, IdentToken, Token } from '../lexer/tokens'
import { NumLitToken } from '../lexer/tokens/NumLitToken'
import { ReplaceableToken } from '../lexer/tokens/ReplaceableToken'
import { StrLitToken } from '../lexer/tokens/StrLitToken'
import { TokKind } from '../lexer/TokKind'
import { UnaryOp } from '../lexer/UnaryOp'
import { VariadicOp } from '../lexer/VariadicOp'
import { ErrorResourceKey, ILanguageSettings, Span, TexlStrings } from '../localization'
import {
  AsNode,
  BinaryOpNode,
  BlankNode,
  BoolLitNode,
  CallNode,
  DottedNameNode,
  ErrorNode,
  FirstNameNode,
  Identifier,
  IdentifierSource,
  ITexlSource,
  ListNode,
  NodeSource,
  NumLitNode,
  ParentNode,
  Precedence,
  RecordNode,
  ReplaceableNode,
  SelfNode,
  SourceList,
  SpreadSource,
  StrInterpNode,
  StrLitNode,
  TableNode,
  TexlNode,
  TokenSource,
  UnaryOpNode,
  VariadicOpNode,
  WhitespaceSource,
} from '../syntax'
import { hasFlag } from '../utils/CharacterUtils'
import { CollectionUtils } from '../utils/CollectionUtils'
import { Dictionary } from '../utils/Dictionary'
import { DPath } from '../utils/DPath'
import { ParseFormulasResult } from './ParseFormulasResult'
import { ParseResult } from './ParseResult'
import { TokenCursor } from './TokenCursor'

export enum TexlParserFlags {
  None = 0,

  // When specified, expression chaining is allowed (e.g. in the context of behavior rules).
  EnableExpressionChaining = 1 << 0,

  // When specified, replaceable expressions are allowed (e.g. wrapped with '##' or '%').
  AllowReplaceableExpressions = 1 << 1,

  // All parsing capabilities enabled.
  All = EnableExpressionChaining | AllowReplaceableExpressions,

  // When specified, this is a named formula to be parsed. Mutually exclusive to EnableExpressionChaining.
  NamedFormulas = 1 << 2,
}

export class TexlParser {
  private readonly _curs: TokenCursor
  private readonly _flags: TexlParserFlags
  private _errors: Array<TexlError>

  // Nodes are assigned an integer id that is used to index into arrays later.
  private _idNext: number

  // Track the parsing depth and enforce a maximum, to avoid excessive recursion.
  private _depth: number
  private static readonly MaxAllowedExpressionDepth = 50

  private readonly _comments: Array<CommentToken> = []
  private _before: SourceList
  private _after: SourceList

  // Represents temporary extra trivia, for when a parsing method
  // had to parse tailing trivia to do 1-lookahead. Will be
  // collected by the next call to ParseTrivia.
  private _extraTrivia: ITexlSource

  constructor(tokens: Token[], flags: TexlParserFlags) {
    // Contracts.AssertValue(tokens);

    this._depth = 0
    this._idNext = 0
    this._curs = new TokenCursor(tokens)
    this._flags = flags
  }

  // Parse the script
  // Parsing strips out parens used to establish precedence, but these may be helpful to the
  // caller, so precedenceTokens provide a list of stripped tokens.
  static ParseScript(script: string, loc: ILanguageSettings = null, flags = TexlParserFlags.None): ParseResult {
    // Contracts.AssertValue(script);
    // Contracts.AssertValueOrNull(loc);
    const tokens = TexlParser.TokenizeScript(script, loc, flags)
    const parser = new TexlParser(tokens, flags)

    const parseTreeResult = parser.parse()
    const parseTree = parseTreeResult[0]
    const errors = parseTreeResult[1]
    return new ParseResult(parseTree, errors, errors.length > 0, parser._comments, parser._before, parser._after)
  }

  public static ParseFormulasScript(script: string, loc: ILanguageSettings = null): ParseFormulasResult {
    // Contracts.AssertValue(script);
    // Contracts.AssertValueOrNull(loc);

    const formulaTokens = TexlParser.TokenizeScript(script, loc, TexlParserFlags.NamedFormulas)
    const parser = new TexlParser(formulaTokens, TexlParserFlags.NamedFormulas)

    return parser.parseFormulas(script)
  }

  private parseFormulas(script: string): ParseFormulasResult {
    const namedFormulas = new Dictionary<IdentToken, TexlNode>()
    this.parseTrivia()
    while (this._curs.tokCur.kind != TokKind.Eof) {
      // Verify identifier
      const thisIdentifier = this.tokEat(TokKind.Ident)
      if (thisIdentifier != null) {
        this.parseTrivia()
        // Verify "="
        const thisEq = this.tokEat(TokKind.Equ)
        if (thisEq != null) {
          this.parseTrivia()
          // Extract expression
          while (this._curs.tidCur != TokKind.Semicolon) {
            // Check if we're at EOF before a semicolon is found
            if (this._curs.tidCur == TokKind.Eof) {
              this.createError(this._curs.tokCur, TexlStrings.ErrNamedFormula_MissingSemicolon)
              return new ParseFormulasResult(namedFormulas, this._errors)
            }

            // Parse expression
            const result = this.parseExpr(Precedence.None)
            namedFormulas.set(thisIdentifier as IdentToken, result)
          }
          this._curs.tokMove()
        } else {
          break
        }
      } else {
        break
      }
      this.parseTrivia()
    }

    return new ParseFormulasResult(namedFormulas, this._errors)
  }

  private static TokenizeScript(script: string, loc: ILanguageSettings = null, flags = TexlParserFlags.None): Token[] {
    // Contracts.AssertValue(script);
    // Contracts.AssertValueOrNull(loc);

    const lexerFlags = hasFlag(flags, TexlParserFlags.AllowReplaceableExpressions)
      ? TexlLexerFlags.AllowReplaceableTokens
      : TexlLexerFlags.None
    if (loc == null) {
      return TexlLexer.LocalizedInstance.lexSource(script, lexerFlags)
    }

    return TexlLexer.NewInstance(loc).lexSource(script, lexerFlags)
  }

  private parse(errors: Array<TexlError> = []): [TexlNode, Array<TexlError>] {
    // Contracts.AssertValueOrNull(errors);
    this._errors = errors || []
    let node: TexlNode
    let firstToken = this._curs.tokCur
    this._before = new SourceList(this.parseTrivia())
    if (this._curs.tidCur == TokKind.Eof) {
      if (firstToken.Kind == TokKind.Comment && (firstToken as CommentToken).isOpenBlock) {
        // This provides an error message for when a block comment missing a closing '*/' is the only token in the formula bar
        this.postBlockCommentMissingClosingError()
        errors = this._errors
      }

      node = new BlankNode(this._idNext++, this._curs.tokCur)
    } else {
      node = this.parseExpr(Precedence.None)
      if ((this._curs.tidCur as TokKind) != TokKind.Eof) {
        this.postError(this._curs.tokCur, TexlStrings.ErrBadToken)
      }
      this._after =
        this._after == null
          ? new SourceList([this.parseTrivia()])
          : new SourceList([new SpreadSource(...this._after.sources), new SpreadSource(this.parseTrivia())])

      // This checks for and provides an error message for any block comments missing a closing '*/'
      this.postBlockCommentMissingClosingError()

      errors = this._errors
    }

    // The top node (of the parse tree) should end up with the biggest id. We use this fact when binding.
    // Contracts.Assert(node.Id == _idNext - 1);
    return [node, errors]
  }

  private postBlockCommentMissingClosingError() {
    const ops = this._comments.filter((cm) => cm.isOpenBlock == true)
    const openBlockComment = ops[ops.length - 1]
    if (openBlockComment != null) {
      this.postError(openBlockComment, TexlStrings.ErrMissingEndOfBlockComment)
    }
  }

  private parseTrivia(cursor: TokenCursor = null): ITexlSource {
    cursor = cursor ?? this._curs
    const sources: Array<ITexlSource> = []

    if (this._extraTrivia != null) {
      sources.push(this._extraTrivia)
      this._extraTrivia = null
    }

    let triviaFound: boolean
    do {
      triviaFound = false
      const tokens = cursor.skipWhitespace()
      if (tokens?.length > 0) {
        sources.push(new WhitespaceSource(tokens))
        triviaFound = true
      }

      if (cursor.tidCur == TokKind.Comment) {
        // var comment = cursor.tokMove().As<CommentToken>();
        const comment = cursor.tokMove() as CommentToken
        sources.push(new TokenSource(comment))

        if (comment.isOpenBlock) {
          this.postError(comment, TexlStrings.ErrMissingEndOfBlockComment)
        }
        this._comments.push(comment)
        triviaFound = true
      }
    } while (triviaFound)

    if (sources.length == 1) {
      return sources[0]
    } else {
      return new SpreadSource(...sources)
    }
  }

  private addExtraTrivia(trivia: ITexlSource) {
    if (this._extraTrivia == null) {
      this._extraTrivia = trivia
    } else {
      this._extraTrivia = new SpreadSource(this._extraTrivia, trivia)
    }
  }

  // Parses the next (maximal) expression with precedence >= precMin.
  private parseExpr(precMin: Precedence, node?: TexlNode): TexlNode {
    // ParseOperand may accept PrefixUnary and higher, so ParseExpr should never be called
    // with precMin > Precedence.PrefixUnary - it will not correctly handle those cases.
    // Contracts.Assert(precMin >= Precedence.None && precMin <= Precedence.PrefixUnary);

    try {
      // The parser is recursive. Deeply nested invocations (over 200 deep) and other
      // intentionally miscrafted rules can throw it off, causing stack overflows.
      // Ensure the product doesn't crash in such situations, but instead post
      // corresponding parse errors.
      if (node == null) {
        if (++this._depth > TexlParser.MaxAllowedExpressionDepth) {
          return this.createError(this._curs.tokMove(), TexlStrings.ErrRuleNestedTooDeeply)
        }
        // Get the left operand.
        node = this.parseOperand()
      }
      // Process operators and right operands as long as the precedence bound is satisfied.
      for (;;) {
        let leftTrivia = this.parseTrivia()
        // Contracts.AssertValue(node);
        let tok: Token
        let right: TexlNode
        let identifier: Identifier
        let rightTrivia: ITexlSource
        switch (this._curs.tidCur) {
          case TokKind.PercentSign:
            // Contracts.Assert(precMin <= Precedence.PostfixUnary);
            tok = this._curs.tokMove()
            node = new UnaryOpNode(
              this._idNext++,
              tok,
              new SourceList([new NodeSource(node), new TokenSource(tok)]),
              UnaryOp.Percent,
              node,
            )
            break
          case TokKind.Dot:
          case TokKind.Bang:
            // Contracts.Assert(precMin <= Precedence.Primary);
            if (
              node instanceof DottedNameNode &&
              node.token.kind != this._curs.tidCur &&
              node.token.kind != TokKind.BracketOpen
            ) {
              // Can't mix and match separators. E.g. A.B!C is invalid.
              // goto case TokKind.False;
              this.postError(this._curs.tokCur, TexlStrings.ErrOperatorExpected)
              tok = this._curs.tokMove()
              rightTrivia = this.parseTrivia()
              right = this.parseExpr(Precedence.Error)
              node = this.makeBinary(BinaryOp.Error, node, leftTrivia, tok, rightTrivia, right)
              break
            } else {
              tok = this._curs.tokMove()
              rightTrivia = this.parseTrivia()
              identifier = this.parseIdentifier()
              node = new DottedNameNode(
                // ref _idNext,
                this._idNext++,
                tok,
                new SourceList([
                  new NodeSource(node),
                  new TokenSource(tok),
                  new SpreadSource(rightTrivia),
                  new IdentifierSource(identifier),
                ]),
                node,
                identifier,
                null,
              )
              if (node.Depth > TexlParser.MaxAllowedExpressionDepth) {
                return this.createError(node.token, TexlStrings.ErrRuleNestedTooDeeply)
              }
              break
            }
          case TokKind.Caret:
            // Contracts.Assert(precMin <= Precedence.Power);
            node = this.parseBinary(node, leftTrivia, BinaryOp.Power, Precedence.PrefixUnary)
            break

          case TokKind.Mul:
            if (precMin > Precedence.Mul) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Mul, Precedence.Mul + 1)
              break
            }
          case TokKind.Div:
            if (precMin > Precedence.Mul) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              tok = this._curs.tokMove()
              rightTrivia = this.parseTrivia()
              right = this.parseExpr(Precedence.Mul + 1)
              node = this.makeBinary(BinaryOp.Div, node, leftTrivia, tok, rightTrivia, right)
              break
            }
          case TokKind.Sub:
            if (precMin > Precedence.Add) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              tok = this._curs.tokMove()
              rightTrivia = this.parseTrivia()
              right = this.parseExpr(Precedence.Add + 1)
              right = new UnaryOpNode(this._idNext++, tok, right.sourceList, UnaryOp.Minus, right)
              node = this.makeBinary(BinaryOp.Add, node, leftTrivia, tok, rightTrivia, right)
              break
            }
          case TokKind.Add:
            if (precMin > Precedence.Add) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Add, Precedence.Add + 1)
              break
            }
          case TokKind.Ampersand:
            if (precMin > Precedence.Concat) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Concat, Precedence.Concat + 1)
              break
            }
          case TokKind.KeyAnd:
          case TokKind.And:
            if (precMin > Precedence.And) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.And, Precedence.And + 1)
              break
            }
          case TokKind.KeyOr:
          case TokKind.Or:
            if (precMin > Precedence.Or) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Or, Precedence.Or + 1)
              break
            }
          // Comparison operators
          // expr = expr
          // expr <> expr
          case TokKind.Equ:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Equal, Precedence.Compare + 1)
              break
            }
          case TokKind.LssGrt:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.NotEqual, Precedence.Compare + 1)
              break
            }
          // expr < expr
          case TokKind.Lss:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Less, Precedence.Compare + 1)
              break
            }
          // expr <= expr
          case TokKind.LssEqu:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.LessEqual, Precedence.Compare + 1)
              break
            }

          // expr > expr
          case TokKind.Grt:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Greater, Precedence.Compare + 1)
              break
            }

          // expr >= expr
          case TokKind.GrtEqu:
            if (precMin > Precedence.Compare) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.GreaterEqual, Precedence.Compare + 1)
              break
            }

          case TokKind.Ident:
          case TokKind.NumLit:
          case TokKind.StrLit:
          case TokKind.True:
          case TokKind.False:
            this.postError(this._curs.tokCur, TexlStrings.ErrOperatorExpected)
            tok = this._curs.tokMove()
            rightTrivia = this.parseTrivia()
            right = this.parseExpr(Precedence.Error)
            node = this.makeBinary(BinaryOp.Error, node, leftTrivia, tok, rightTrivia, right)
            break
          case TokKind.ParenOpen:
            if (!(node instanceof DottedNameNode) || !node.hasPossibleNamespaceQualifier) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseInvocationWithNamespace(node)
              break
            }
          case TokKind.In:
            if (precMin > Precedence.In) {
              // goto default;
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.In, Precedence.In + 1)
              break
            }
          case TokKind.Exactin:
            if (precMin > Precedence.In) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseBinary(node, leftTrivia, BinaryOp.Exactin, Precedence.In + 1)
              break
            }

          case TokKind.As:
            if (precMin > Precedence.As) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseAs(node, leftTrivia)
              break
            }
          case TokKind.Semicolon:
            if (hasFlag(this._flags, TexlParserFlags.NamedFormulas)) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else if ((this._flags & TexlParserFlags.EnableExpressionChaining) == 0) {
              // goto case TokKind.False;
              this.postError(this._curs.tokCur, TexlStrings.ErrOperatorExpected)
              tok = this._curs.tokMove()
              rightTrivia = this.parseTrivia()
              right = this.parseExpr(Precedence.Error)
              node = this.makeBinary(BinaryOp.Error, node, leftTrivia, tok, rightTrivia, right)
              break
            } else if (precMin > Precedence.None) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseExprChain(node, leftTrivia)
              break
            }
          case TokKind.BracketOpen:
            // Note we explicitly forbid [@foo][@bar], and also A!B!C[@foo], since these are syntactically nonsensical at the moment.
            if (!(node instanceof FirstNameNode) || node.ident.atToken != null || this._curs.tidPeek() != TokKind.At) {
              // goto default;
              this.addExtraTrivia(leftTrivia)
              return node
            } else {
              node = this.parseScopeField(node)
              break
            }

          case TokKind.Comment:
            // Contracts.Assert(false, "A stray comment was found");
            this._curs.tokMove()
            return node

          case TokKind.Eof:
            if (this._after == null) {
              this._after = new SourceList(leftTrivia)
            } else {
              this._after = new SourceList([new SpreadSource(...this._after.sources), new SpreadSource(leftTrivia)])
            }
            return node
          default:
            this.addExtraTrivia(leftTrivia)
            return node
        }
      }
    } finally {
      --this._depth
    }
  }

  private parseBinary(left: TexlNode, leftTrivia: ITexlSource, op: BinaryOp, precedence: Precedence): TexlNode {
    const opToken = this._curs.tokMove()
    const rightTrivia = this.parseTrivia()
    const right = this.parseExpr(precedence)
    return this.makeBinary(op, left, leftTrivia, opToken, rightTrivia, right)
  }

  private makeBinary(
    op: BinaryOp,
    left: TexlNode,
    leftTrivia: ITexlSource,
    opToken: Token,
    rightTrivia: ITexlSource,
    right: TexlNode,
  ): TexlNode {
    return new BinaryOpNode(
      // ref _idNext,
      this._idNext++,
      opToken,
      new SourceList([
        new NodeSource(left),
        new SpreadSource(leftTrivia),
        new TokenSource(opToken),
        new SpreadSource(rightTrivia),
        new NodeSource(right),
      ]),
      op,
      left,
      right,
    )
  }

  private parseAs(left: TexlNode, leftTrivia: ITexlSource): TexlNode {
    const opToken = this._curs.tokMove()
    const rightTrivia = this.parseTrivia()
    const rhsIdentifier = this.parseIdentifier()

    return new AsNode(
      // ref _idNext,
      this._idNext++,
      opToken,
      new SourceList([
        new NodeSource(left),
        new SpreadSource(leftTrivia),
        new TokenSource(opToken),
        new SpreadSource(rightTrivia),
        new IdentifierSource(rhsIdentifier),
      ]),
      left,
      rhsIdentifier,
    )
  }

  private parseOperand(): TexlNode {
    let trivia: ITexlSource
    switch (this._curs.tidCur) {
      // (Expr)
      case TokKind.ParenOpen:
        return this.parseParenExpr()

      // {id:Expr*}
      case TokKind.CurlyOpen:
        return this.parseRecordExpr(new SpreadSource())

      // [Expr*]
      // [@name]
      case TokKind.BracketOpen:
        if (this._curs.tidPeek() == TokKind.At) {
          return this.parseBracketIdentifierAsFirstName(true)
        }

        return this.parseTableExpr()

      // -Expr
      case TokKind.Sub:
        return this.parseUnary(UnaryOp.Minus)

      // not Expr
      case TokKind.KeyNot:
      case TokKind.Bang:
        return this.parseUnary(UnaryOp.Not)

      // Literals
      case TokKind.NumLit:
        return new NumLitNode(this._idNext++, this._curs.tokMove() as NumLitToken)
      case TokKind.True:
      case TokKind.False:
        return new BoolLitNode(this._idNext++, this._curs.tokMove())
      case TokKind.StrInterpStart:
        let res = this.parseStringInterpolation()
        let tokCur = this._curs.tokCur
        if (FeatureFlags.StringInterpolation) {
          return res
        }
        return this.createError(tokCur, TexlStrings.ErrBadToken)
      case TokKind.StrLit:
        return new StrLitNode(this._idNext++, this._curs.tokMove() as StrLitToken)
      // Names
      case TokKind.Ident:
        const ident = this.parseIdentifier()
        if (this.afterSpaceTokenId() == TokKind.ParenOpen) {
          trivia = this.parseTrivia()
          return this.parseInvocation(ident, trivia, null)
        }

        if (this.afterSpaceTokenId() == TokKind.At) {
          trivia = this.parseTrivia()
          return this.parseRecordExpr(trivia, ident)
        }
        return new FirstNameNode(this._idNext++, ident.token, new SourceList(ident.token), ident)

      // Parent
      case TokKind.Parent:
        return new ParentNode(this._idNext++, this._curs.tokMove())

      // Self
      case TokKind.Self:
        return new SelfNode(this._idNext++, this._curs.tokMove())

      // Replaceable expression.
      case TokKind.ReplaceableLit:
        return this.parseReplaceableExpr()

      case TokKind.Eof:
        return this.createError(this._curs.tokCur, TexlStrings.ErrOperandExpected)

      case TokKind.Error:
        const errorToken = this._curs.tokMove() as ErrorToken
        const args = errorToken.resourceKeyFormatStringArgs
        if (args == null || args.length == 0) {
          return this.createError(errorToken, errorToken.detailErrorKey ?? TexlStrings.ErrBadToken)
        }

        return this.createError(errorToken, errorToken.detailErrorKey ?? TexlStrings.ErrBadToken, args)

      case TokKind.Comment:
        // Contracts.Assert(false, "A stray comment was found");
        this._curs.tokMove()
        return this.parseOperand()

      // Any other input should cause parsing errors.
      default:
        return this.createError(this._curs.tokMove(), TexlStrings.ErrBadToken)
    }
  }

  private afterSpaceTokenId(): TokKind {
    const split = this._curs.Split()
    this.parseTrivia(split)
    return split.tidCur
  }

  private parseUnary(op: UnaryOp): TexlNode {
    var tok = this._curs.tokMove()
    var rightTrivia = this.parseTrivia()
    var right = this.parseExpr(Precedence.PrefixUnary)

    return new UnaryOpNode(
      // ref _idNext,
      this._idNext++,
      tok,
      new SourceList([new TokenSource(tok), rightTrivia, new NodeSource(right)]),
      op,
      right,
    )
  }

  // Parses an identifier delimited by brackets, e.g. [@foo]
  private parseBracketIdentifierAsFirstName(accountForAllPrecedenceTokens = false): FirstNameNode {
    // Contracts.Assert(_curs.TidCur == TokKind.BracketOpen);
    // Contracts.Assert(_curs.TidPeek() == TokKind.At);

    const bracketOpen = this._curs.tokMove()
    const at = this._curs.tokMove()

    const ident = this.parseIdentifier(at)
    var bracketClose = this._curs.tokMove()

    if (bracketClose.Kind != TokKind.BracketClose) {
      this.errorTid(bracketClose, TokKind.BracketClose)
    }

    return new FirstNameNode(
      // ref _idNext,
      this._idNext++,
      ident.token,
      new SourceList([
        new TokenSource(bracketOpen),
        new TokenSource(at),
        new IdentifierSource(ident),
        new TokenSource(bracketClose),
      ]),
      ident,
    )
  }

  // Parses the RHS of a scope field. E.g., [@bar] in "foo[@bar]"
  private parseScopeField(lhs: FirstNameNode): DottedNameNode {
    // Contracts.AssertValue(lhs);
    // Contracts.Assert(_curs.TidCur == TokKind.BracketOpen);
    // Contracts.Assert(_curs.TidPeek() == TokKind.At);

    const bracketOpen = this._curs.tokCur

    // Parse the rhs of the dotted name
    const rhs = this.parseBracketIdentifierAsFirstName()

    // Form the dotted name
    return new DottedNameNode(
      // ref _idNext,
      this._idNext++,
      bracketOpen,
      new SourceList([new NodeSource(lhs), new NodeSource(rhs)]),
      lhs,
      rhs.ident,
      rhs,
    )
  }

  private parseIdentifier(at: Token = null): Identifier {
    // Contracts.AssertValueOrNull(at);

    let tok: IdentToken

    if (this._curs.tidCur == TokKind.Ident) {
      tok = this._curs.tokMove() as IdentToken
      if (tok.hasDelimiterStart && !tok.hasDelimiterEnd) {
        this.postError(tok, TexlStrings.ErrClosingBracketExpected)
      } else if (tok.isModified) {
        this.postError(tok, TexlStrings.ErrEmptyInvalidIdentifier)
      }
    } else if (this._curs.tidCur == TokKind.ReplaceableLit) {
      tok = IdentToken.MakeFromReplaceable(this._curs.tokMove() as ReplaceableToken)
    } else {
      this.errorTid(this._curs.tokCur, TokKind.Ident)
      const ich = this._curs.tokCur.span.min
      tok = new IdentToken('', new Span(ich, ich))
    }

    return new Identifier(DPath.Root, at, tok)
  }

  private parseStringInterpolation(): TexlNode {
    // Contracts.Assert(_curs.TidCur == TokKind.StrInterpStart);
    const startToken = this._curs.tokMove()

    // const headToken = new IdentToken(IdentToken.StrInterpIdent, startToken.Span)
    // const head = new Identifier(DPath.Root, null, headToken)
    // const headTrivia = this.parseTrivia()
    // let headNode: TexlNode = null

    const strInterpStart = startToken
    const strInterpTrvia = this.parseTrivia()

    // Contracts.AssertValue(head);
    // Contracts.AssertValueOrNull(headNode);

    // const leftParen = startToken
    // const leftTrivia = headTrivia

    const theArguments: TexlNode[] = []
    const sourceList: ITexlSource[] = [new TokenSource(strInterpStart), strInterpTrvia]

    if (this._curs.tidCur == TokKind.StrInterpEnd) {
      // const strLitToken = new StrLitToken('', headToken.Span)
      // this._curs.tokMove()
      // return new StrLitNode(this._idNext++, strLitToken)
      const tokenEnd = this._curs.tokMove()
      sourceList.push(new TokenSource(tokenEnd))
      return new StrInterpNode(this._idNext++, strInterpStart, new SourceList(sourceList), [], tokenEnd)
    }

    // const rgtokCommas: Array<Token> = []
    // const args: Array<TexlNode> = []
    // const sourceList: Array<ITexlSource> = [new TokenSource(leftParen), leftTrivia]
    for (let i = 0; ; i++) {
      if (this._curs.tidCur == TokKind.IslandStart) {
        if (i != 0) {
          // const comma = this._curs.tokMove()
          // rgtokCommas.push(comma)
          // sourceList.push(new TokenSource(comma))
          const islandStart = this._curs.tokMove()
          sourceList.push(new TokenSource(islandStart))
          sourceList.push(this.parseTrivia())
        } else {
          this._curs.tokMove()
        }
      } else if (this._curs.tidCur == TokKind.IslandEnd) {
        // const peek1 = this._curs.tidPeek(1)
        // if (peek1 != TokKind.StrInterpEnd && peek1 != TokKind.IslandStart) {
        //   const comma = this._curs.tokMove()
        //   rgtokCommas.push(comma)
        //   sourceList.push(new TokenSource(comma))
        //   sourceList.push(this.parseTrivia())
        // } else {
        //   this._curs.tokMove()
        // }
        const islandEnd = this._curs.tokMove()
        sourceList.push(new TokenSource(islandEnd))
        sourceList.push(this.parseTrivia())
      } else if (this._curs.tidCur === TokKind.Eof) {
        const error = this.createError(this._curs.tokCur, TexlStrings.ErrBadToken)
        theArguments.push(error)
        sourceList.push(new NodeSource(error))
        sourceList.push(this.parseTrivia())
        return new StrInterpNode(
          this._idNext++,
          strInterpStart,
          new SourceList(sourceList),
          theArguments,
          this._curs.tokCur,
        )
      } else if ((this._curs.tidCur as TokKind) === TokKind.StrInterpEnd) {
        break
      } else {
        const argument = this.parseExpr(Precedence.None)
        theArguments.push(argument)
        sourceList.push(new NodeSource(argument))
        sourceList.push(this.parseTrivia())
      }
    }

    // Contracts.Assert(_curs.TidCur == TokKind.StrInterpEnd || _curs.TidCur == TokKind.Eof);

    let strInterpEnd: Token = null
    if ((this._curs.tidCur as TokKind) == TokKind.StrInterpEnd) {
      strInterpEnd = this.tokEat(TokKind.StrInterpEnd)
    }

    if (strInterpEnd != null) {
      sourceList.push(new TokenSource(strInterpEnd))
    }

    return new StrInterpNode(
      // ref _idNext,
      this._idNext++,
      strInterpStart,
      new SourceList(sourceList),
      theArguments,
      strInterpEnd,
    )
  }

  // Parse a namespace-qualified invocation, e.g. Facebook.GetFriends()
  private parseInvocationWithNamespace(dotted: DottedNameNode): CallNode {
    // Contracts.Assert(dotted.HasPossibleNamespaceQualifier);

    const path = dotted.toDPath()
    // Contracts.Assert(path.IsValid);
    // Contracts.Assert(!path.IsRoot);
    // Contracts.Assert(!path.Parent.IsRoot);

    const head = new Identifier(path.parent, null, dotted.right.token)
    // Contracts.Assert(_curs.TidCur == TokKind.ParenOpen);

    return this.parseInvocation(head, this.parseTrivia(), dotted)
  }

  private parseInvocation(head: Identifier, headTrivia: ITexlSource, headNode: TexlNode): CallNode {
    // Contracts.AssertValue(head);
    // Contracts.AssertValueOrNull(headNode);
    // Contracts.Assert(_curs.TidCur == TokKind.ParenOpen);

    const leftParen = this._curs.tokMove()
    const leftTrivia = this.parseTrivia()
    if (this._curs.tidCur == TokKind.ParenClose) {
      const rightParen = this._curs.tokMove()
      const right = new ListNode(
        // ref _idNext,
        this._idNext++,
        this._curs.tokCur,
        [],
        null,
        new SourceList([new TokenSource(leftParen), leftTrivia, new TokenSource(rightParen)]),
      )

      const sources: Array<ITexlSource> = []
      if (headNode != null) {
        sources.push(new NodeSource(headNode))
      } else {
        sources.push(new IdentifierSource(head))
      }

      sources.push(headTrivia)
      sources.push(new NodeSource(right))

      return new CallNode(
        // ref _idNext,
        this._idNext++,
        leftParen,
        new SourceList(sources),
        head,
        headNode,
        right,
        rightParen,
      )
    }

    const rgtokCommas: Array<Token> = []
    const args: Array<TexlNode> = []
    const sourceList: Array<ITexlSource> = [new TokenSource(leftParen), leftTrivia]
    for (;;) {
      while (this._curs.tidCur == TokKind.Comma) {
        const commaToken = this._curs.tokMove()
        args.push(this.createError(commaToken, TexlStrings.ErrBadToken))
        sourceList.push(new TokenSource(commaToken))
        sourceList.push(this.parseTrivia())
        rgtokCommas.push(commaToken)
      }

      const argument = this.parseExpr(Precedence.None)
      args.push(argument)
      sourceList.push(new NodeSource(argument))
      sourceList.push(this.parseTrivia())

      if ((this._curs.tidCur as TokKind) != TokKind.Comma) {
        break
      }

      const comma = this._curs.tokMove()
      rgtokCommas.push(comma)
      sourceList.push(new TokenSource(comma))
      sourceList.push(this.parseTrivia())
    }

    const parenClose = this.tokEat(TokKind.ParenClose)
    if (parenClose != null) {
      sourceList.push(new TokenSource(parenClose))
    }

    const list = new ListNode(
      // ref _idNext,
      this._idNext++,
      leftParen,
      args,
      rgtokCommas,
      new SourceList(sourceList),
    )

    let headNodeSource: ITexlSource = new IdentifierSource(head)
    if (headNode != null) {
      headNodeSource = new NodeSource(headNode)
    }

    return new CallNode(
      // ref _idNext,
      this._idNext++,
      leftParen,
      new SourceList([headNodeSource, headTrivia, new NodeSource(list)]),
      head,
      headNode,
      list,
      parenClose,
    )
  }

  private parseExprChain(node: TexlNode, leftTrivia: ITexlSource): TexlNode {
    // Contracts.AssertValue(node);
    // Contracts.Assert(_curs.TidCur == TokKind.Semicolon);

    const delimiters: Array<Token> = []
    const expressions: Array<TexlNode> = [node]

    const sourceList: Array<ITexlSource> = [new NodeSource(node), leftTrivia]

    while (this._curs.tidCur == TokKind.Semicolon) {
      const delimiter = this._curs.tokMove()
      delimiters.push(delimiter)
      sourceList.push(new TokenSource(delimiter))
      sourceList.push(this.parseTrivia())

      if (
        (this._curs.tidCur as TokKind) == TokKind.Eof ||
        (this._curs.tidCur as TokKind) == TokKind.Comma ||
        (this._curs.tidCur as TokKind) == TokKind.ParenClose
      ) {
        break
      }

      // SingleExpr here means we don't want chains on the RHS, but individual expressions.
      var expression = this.parseExpr(Precedence.SingleExpr)
      expressions.push(expression)
      sourceList.push(new NodeSource(expression))
      sourceList.push(this.parseTrivia())
    }

    return new VariadicOpNode(
      // ref _idNext,
      this._idNext++,
      VariadicOp.Chain,
      expressions,
      delimiters,
      new SourceList(sourceList),
    )
  }

  // Parse a record expression of the form: {id:expr, id:expr, ...}
  // or of the form ident@{id:expr, id:expr}
  private parseRecordExpr(sourceRestrictionTrivia: ITexlSource, sourceRestriction: Identifier = null): RecordNode {
    // Contracts.Assert(_curs.TidCur == TokKind.CurlyOpen || _curs.TidCur == TokKind.At);
    // Contracts.AssertValueOrNull(sourceRestriction);

    let curlyClose: Token

    const commas: Array<Token> = []
    const colons: Array<Token> = []
    const ids: Array<Identifier> = []
    const exprs: Array<TexlNode> = []
    const sourceList: Array<ITexlSource> = []
    let sourceRestrictionNode: TexlNode = null

    let primaryToken = this._curs.tokMove()

    if (primaryToken.Kind == TokKind.At) {
      // Contracts.AssertValue(sourceRestriction);
      sourceList.push(sourceRestrictionTrivia)
      sourceList.push(new TokenSource(primaryToken))
      sourceList.push(this.parseTrivia())

      primaryToken = sourceRestriction.token
      sourceRestrictionNode = new FirstNameNode(this._idNext++, sourceRestriction.token, undefined, sourceRestriction)

      if (this._curs.tidCur != TokKind.CurlyOpen) {
        this.errorTid(this._curs.tokCur, TokKind.CurlyOpen)
        curlyClose = this.tokEat(TokKind.CurlyClose)
        return new RecordNode(
          // ref _idNext,
          this._idNext++,
          sourceRestriction.token,
          new SourceList([
            new SpreadSource(...sourceList),
            curlyClose != null ? new TokenSource(curlyClose) : new SpreadSource(),
          ]),
          ids,
          exprs,
          null,
          null,
          curlyClose,
          sourceRestrictionNode,
        )
      }

      sourceList.push(new TokenSource(this._curs.tokMove()))
      sourceList.push(this.parseTrivia())
    } else {
      sourceList.push(new TokenSource(primaryToken))
      sourceList.push(this.parseTrivia())
    }

    while (this._curs.tidCur != TokKind.CurlyClose) {
      // id
      const ident = this.parseIdentifier()
      sourceList.push(new IdentifierSource(ident))
      sourceList.push(this.parseTrivia())

      // :
      if (this._curs.tidCur != TokKind.Colon) {
        this.errorTid(this._curs.tokCur, TokKind.Colon)
        const errorToken = this._curs.tokMove()
        let errorExp: TexlNode = this.createError(errorToken, TexlStrings.ErrColonExpected)
        sourceList.push(new TokenSource(errorToken))
        sourceList.push(this.parseTrivia())
        ids.push(ident)
        exprs.push(errorExp)
        break
      }

      const colon = this._curs.tokMove()
      colons.push(colon)
      sourceList.push(new TokenSource(colon))
      sourceList.push(this.parseTrivia())

      // expr
      // SingleExpr here means we don't want chains, but individual expressions.
      const expr = this.parseExpr(Precedence.SingleExpr)

      ids.push(ident)
      exprs.push(expr)
      sourceList.push(new NodeSource(expr))
      sourceList.push(this.parseTrivia())

      // ,
      if ((this._curs.tidCur as TokKind) != TokKind.Comma) {
        break
      }

      const comma = this._curs.tokMove()
      commas.push(comma)
      sourceList.push(new TokenSource(comma))
      sourceList.push(this.parseTrivia())

      if ((this._curs.tidCur as TokKind) == TokKind.CurlyClose) {
        let errorExp: TexlNode = this.createError(comma, TexlStrings.ErrColonExpected)
        exprs.push(errorExp)
        ids.push(this.parseIdentifier())
      }
    }

    // Contracts.Assert(ids.Count == exprs.Count);

    // TODO: var commaArray = commas?.ToArray();
    const commaArray = commas
    const colonArray = colons

    curlyClose = this.tokEat(TokKind.CurlyClose)
    if (curlyClose != null) {
      sourceList.push(new TokenSource(curlyClose))
    }

    return new RecordNode(
      // ref _idNext,
      this._idNext++,
      primaryToken,
      new SourceList(sourceList),
      ids,
      exprs,
      commaArray,
      colonArray,
      curlyClose,
      sourceRestrictionNode,
    )
  }

  // Parse a table expression. The only currently supported form is: [expr, expr, ...]
  private parseTableExpr(): TableNode {
    // Contracts.Assert(_curs.TidCur == TokKind.BracketOpen);
    const sourceList: Array<ITexlSource> = []

    let tok = this._curs.tokMove()
    sourceList.push(new TokenSource(tok))
    sourceList.push(this.parseTrivia())

    const commas: Array<Token> = []
    const expressions: Array<TexlNode> = []

    while (this._curs.tidCur != TokKind.BracketClose) {
      // expr
      // SingleExpr here means we don't want chains, but individual expressions.
      const expression = this.parseExpr(Precedence.SingleExpr)
      expressions.push(expression)
      sourceList.push(new NodeSource(expression))
      sourceList.push(this.parseTrivia())

      // ,
      if (this._curs.tidCur != TokKind.Comma) {
        break
      }

      const comma = this._curs.tokMove()
      commas.push(comma)
      sourceList.push(new TokenSource(comma))
      sourceList.push(this.parseTrivia())
    }

    // var commaArray = commas?.ToArray();
    const commaArray = commas

    var bracketClose = this.tokEat(TokKind.BracketClose)
    if (bracketClose != null) {
      sourceList.push(new TokenSource(bracketClose))
    }

    return new TableNode(
      // ref _idNext,
      this._idNext++,
      tok,
      new SourceList(sourceList),
      expressions,
      commaArray,
      bracketClose,
    )
  }

  private parseParenExpr(): TexlNode {
    // Contracts.Assert(_curs.TidCur == TokKind.ParenOpen);

    const open = this._curs.tokMove()
    const before = this.parseTrivia()

    // SingleExpr here means we don't want chains, but individual expressions.
    const node = this.parseExpr(Precedence.SingleExpr)
    const after = this.parseTrivia()
    const close = this.tokEat(TokKind.ParenClose)

    const sources: Array<ITexlSource> = [
      new TokenSource(open),
      before,
      new SpreadSource(...node.sourceList.sources),
      after,
    ]

    if (close != null) {
      sources.push(new TokenSource(close))
    }

    node.parser_setSourceList(new SourceList(new SpreadSource(...sources)))
    return node
  }

  private parseReplaceableExpr(): TexlNode {
    // Contracts.Assert(_curs.TidCur == TokKind.ReplaceableLit);

    const tok = this._curs.tokMove() as ReplaceableToken
    // Contracts.AssertValue(tok);

    if (
      tok.value.startsWith(TexlLexer.LocalizedTokenDelimiterStr) ||
      tok.value.startsWith(TexlLexer.ContextDependentTokenDelimiterStr)
    ) {
      return new ReplaceableNode(this._idNext++, tok)
    }

    return this.createError(tok, TexlStrings.ErrBadToken)
  }

  private createError(tok: Token, errKey: ErrorResourceKey, ...args: any[]): ErrorNode {
    // Contracts.AssertValue(tok);
    // Contracts.AssertValue(args);
    const err = this.postError(tok, errKey, ...args)
    return new ErrorNode(this._idNext++, tok, err.shortMessage, ...args)
  }

  // private CreateError(tok: Token, errKey: ErrorResourceKey): ErrorNode
  // {
  //     Contracts.AssertValue(tok);

  //     var err = PostError(tok, errKey);
  //     return new ErrorNode(ref _idNext, tok, err.ShortMessage);
  // }

  // private postError(tok: Token, errKey: ErrorResourceKey): TexlError
  // {
  //     // Contracts.AssertValue(tok);
  //     // Contracts.AssertValue(errKey.Key);

  //     const err = new TexlError(tok, DocumentErrorSeverity.Critical, errKey);
  //     CollectionUtils.Add(ref _errors, err);
  //     return err;
  // }

  private postError(tok: Token, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    // Contracts.AssertValue(tok);
    // Contracts.AssertValue(errKey.Key);
    // Contracts.AssertValueOrNull(args);
    const err = new TexlError(null, tok, DocumentErrorSeverity.Critical, errKey, args)
    if (this._errors == null) {
      this._errors = []
    }
    CollectionUtils.Add(this._errors, err)
    return err
  }

  // Eats a token of the given kind.
  // If the token is not the right kind, reports an error and leaves it.
  private eatTid(tid: TokKind): boolean {
    if (this._curs.tidCur == tid) {
      this._curs.tokMove()
      return true
    }

    this.errorTid(this._curs.tokCur, tid)
    return false
  }

  // Returns the current token if it's of the given kind and moves to the next token.
  // If the token is not the right kind, reports an error, leaves the token, and returns null.
  private tokEat(tid: TokKind): Token {
    if (this._curs.tidCur == tid) {
      return this._curs.tokMove()
    }

    this.errorTid(this._curs.tokCur, tid)
    return null
  }

  private errorTid(tok: Token, tidWanted: TokKind) {
    // Contracts.Assert(tidWanted != tok.Kind);

    this.postError(tok, TexlStrings.ErrExpectedFound_Ex_Fnd, tidWanted, tok)
  }

  // Gets the string corresponding to token kinds used in binary or unary nodes.
  static GetTokString(kind: TokKind): string {
    switch (kind) {
      case TokKind.And:
        return TexlLexer.PunctuatorAnd
      case TokKind.Or:
        return TexlLexer.PunctuatorOr
      case TokKind.Bang:
        return TexlLexer.PunctuatorBang
      case TokKind.Add:
        return TexlLexer.PunctuatorAdd
      case TokKind.Sub:
        return TexlLexer.PunctuatorSub
      case TokKind.Mul:
        return TexlLexer.PunctuatorMul
      case TokKind.Div:
        return TexlLexer.PunctuatorDiv
      case TokKind.Caret:
        return TexlLexer.PunctuatorCaret
      case TokKind.Ampersand:
        return TexlLexer.PunctuatorAmpersand
      case TokKind.PercentSign:
        return TexlLexer.PunctuatorPercent
      case TokKind.Equ:
        return TexlLexer.PunctuatorEqual
      case TokKind.Lss:
        return TexlLexer.PunctuatorLess
      case TokKind.LssEqu:
        return TexlLexer.PunctuatorLessOrEqual
      case TokKind.Grt:
        return TexlLexer.PunctuatorGreater
      case TokKind.GrtEqu:
        return TexlLexer.PunctuatorGreaterOrEqual
      case TokKind.LssGrt:
        return TexlLexer.PunctuatorNotEqual
      case TokKind.Dot:
        return TexlLexer.PunctuatorDot
      case TokKind.In:
        return TexlLexer.KeywordIn
      case TokKind.Exactin:
        return TexlLexer.KeywordExactin
      case TokKind.BracketOpen:
        return TexlLexer.PunctuatorBracketOpen
      case TokKind.KeyOr:
        return TexlLexer.KeywordOr
      case TokKind.KeyAnd:
        return TexlLexer.KeywordAnd
      case TokKind.KeyNot:
        return TexlLexer.KeywordNot
      case TokKind.As:
        return TexlLexer.KeywordAs
      default:
        return ''
    }
  }

  public static Format(text: string): string {
    const result = TexlParser.ParseScript(text, undefined, TexlParserFlags.EnableExpressionChaining)

    // Can't pretty print a script with errors.
    if (result.hasError) {
      return text
    }
    return ''
    // return PrettyPrintVisitor.Format(result.Root, result.Before, result.After, text)
  }
}
