import { Precedence } from './Precedence'
import {
  ReplaceableNode,
  TexlNode,
  ErrorNode,
  BlankNode,
  BoolLitNode,
  StrLitNode,
  NumLitNode,
  FirstNameNode,
  NameNode,
  CallNode,
  AsNode,
  ParentNode,
  SelfNode,
  DottedNameNode,
  BinaryOpNode,
  UnaryOpNode,
  VariadicOpNode,
  ListNode,
  RecordNode,
  TableNode,
  StrInterpNode,
} from './nodes'
import { TexlFunctionalVisitor } from './visitors'
import TexlLexer from '../lexer/TexlLexer'
import { CharacterUtils } from '../utils/CharacterUtils'
import { TexlParser } from '../parser/TexlParser'
import { UnaryOp } from '../lexer/UnaryOp'
import { TokKind } from '../lexer/TokKind'
import { CollectionUtils } from '../utils/CollectionUtils'
import { BinaryOp } from '../lexer/BinaryOp'
import { VariadicOp } from '../lexer/VariadicOp'
import { StringBuilder } from '../utils/StringBuilder'
import { Identifier } from './Identifier'
import {
  IdentifierSource,
  NodeSource,
  SourceList,
  TokenSource,
  WhitespaceSource,
} from './sourceInformation'
import { NodeKind } from './NodeKind'
import { Dictionary } from '../utils/Dictionary'
import { CommentToken, Token } from '../lexer/tokens'
import { LazyList } from '../utilityDataStructures/LazyList'

// Simple pretty-printing visitor (Task #2489649
// Todo: currently being used by node.ToString().  Need to figure
// out if it is being used with anything else.  If not, we can delete
// this entirely
export class TexlPretty extends TexlFunctionalVisitor<
  Array<string>,
  Precedence
> {
  constructor() {
    super()
  }

  // Public entry point for prettyprinting TEXL parse trees
  public static PrettyPrint(node: TexlNode): string {
    // Contracts.AssertValue(node);

    const pretty = new TexlPretty()
    return node.acceptResult(pretty, Precedence.None).join('')
  }

  public visit(node: TexlNode, parentPrecedence: Precedence): Array<string> {
    switch (node.kind) {
      case NodeKind.Replaceable:
        return this.visitReplaceableNode(
          node as ReplaceableNode,
          parentPrecedence
        )
      case NodeKind.Error:
        return this.visitErrorNode(node as ErrorNode, parentPrecedence)
      case NodeKind.Blank:
        return this.visitBlankNode(node as BlankNode, parentPrecedence)
      case NodeKind.BoolLit:
        return this.visitBoolLitNode(node as BoolLitNode, parentPrecedence)
      case NodeKind.StrLit:
        return this.visitStrLitNode(node as StrLitNode, parentPrecedence)
      case NodeKind.NumLit:
        return this.visitNumLitNode(node as NumLitNode, parentPrecedence)
      case NodeKind.FirstName:
        return this.visitFirstNameNode(node as FirstNameNode, parentPrecedence)
      case NodeKind.Parent:
        return this.visitParentNode(node as ParentNode, parentPrecedence)
      case NodeKind.Self:
        return this.visitSelfNode(node as SelfNode, parentPrecedence)
      case NodeKind.DottedName:
        return this.visitDottedNameNode(
          node as DottedNameNode,
          parentPrecedence
        )
      case NodeKind.UnaryOp:
        return this.visitUnaryOpNode(node as UnaryOpNode, parentPrecedence)
      case NodeKind.BinaryOp:
        return this.visitBinaryOpNode(node as BinaryOpNode, parentPrecedence)
      case NodeKind.As:
        return this.visitAsNode(node as AsNode, parentPrecedence)
      case NodeKind.VariadicOp:
        return this.visitVariadicOpNode(
          node as VariadicOpNode,
          parentPrecedence
        )
      case NodeKind.Call:
        return this.visitCallNode(node as CallNode, parentPrecedence)
      case NodeKind.List:
        return this.visitListNode(node as ListNode, parentPrecedence)
      case NodeKind.Record:
        return this.visitRecordNode(node as RecordNode, parentPrecedence)
      case NodeKind.Table:
        return this.visitTableNode(node as TableNode, parentPrecedence)
      case NodeKind.StrInterp:
        return this.visitStrInterpNode(node as StrInterpNode, parentPrecedence)
      default:
        throw new Error('unknown nodes are not supported')
    }
  }

  public visitReplaceableNode(
    node: ReplaceableNode,
    parentPrecedence: Precedence
  ): Array<string> {
    throw new Error('Replaceable nodes are not supported')
  }

  public visitErrorNode(
    node: ErrorNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    return ['<error>']
  }

  public visitBlankNode(
    node: BlankNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node)
    return []
  }

  public visitBoolLitNode(
    node: BoolLitNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    return [node.value ? TexlLexer.KeywordTrue : TexlLexer.KeywordFalse]
    // return Array<string>.Of(
    //     node.Value ? TexlLexer.KeywordTrue : TexlLexer.KeywordFalse);
  }

  public visitStrLitNode(
    node: StrLitNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    // return Array<string>.Of(
    //     "\"",
    //     CharacterUtils.ExcelEscapeString(node.Value),
    //     "\"");
    return ['"', CharacterUtils.ExcelEscapeString(node.value), '"']
  }

  public visitNumLitNode(
    node: NumLitNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    const nlt = node.value
    // return Array<string>.Of(nlt != null ? nlt.ToString() : node.NumValue.ToString("R", TexlLexer.LocalizedInstance.Culture));
    return [nlt != null ? nlt.toString() : node.numValue.toString()]
  }

  public visitFirstNameNode(
    node: FirstNameNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    if (node.ident.atToken == null) {
      return [node.ident.token.toString()]
    } else {
      return [
        TexlLexer.PunctuatorBracketOpen,
        TexlLexer.PunctuatorAt,
        node.ident.token.toString(),
        TexlLexer.PunctuatorBracketClose,
      ]
    }
  }

  public visitParentNode(
    node: ParentNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    return [TexlLexer.KeywordParent]
  }

  public visitSelfNode(
    node: SelfNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    return [TexlLexer.KeywordSelf]
  }

  public visitDottedNameNode(
    node: DottedNameNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    const separator = TexlParser.GetTokString(node.token.kind)

    let values = node.left.acceptResult(this, Precedence.Primary)
    values = separator == null ? values : values.concat(separator)
    if (node.right.atToken != null) {
      values = values.concat(TexlLexer.PunctuatorAt)
    }

    values = CollectionUtils.With(
      values,
      this.getRightToken(node.left, node.right)
    )
    if (node.usesBracket) {
      values = values.concat(TexlLexer.PunctuatorBracketClose)
    }

    return this.applyPrecedence(parentPrecedence, Precedence.Primary, values)
  }

  public visitUnaryOpNode(
    node: UnaryOpNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    const child = node.child.acceptResult(this, Precedence.PrefixUnary)

    let result: Array<string>
    switch (node.op) {
      case UnaryOp.Not:
        if (node.token.kind == TokKind.KeyNot) {
          result = CollectionUtils.With([TexlLexer.KeywordNot, ' '], ...child)
        } else {
          result = CollectionUtils.With([TexlLexer.PunctuatorBang], ...child)
        }

        break
      case UnaryOp.Minus:
        result = CollectionUtils.With([TexlLexer.PunctuatorSub], ...child)
        break
      case UnaryOp.Percent:
        result = CollectionUtils.With(child, TexlLexer.PunctuatorPercent)
        break
      default:
        // Contracts.Assert(false)
        result = CollectionUtils.With(['<error>'], ...child)
        break
    }

    return this.applyPrecedence(
      parentPrecedence,
      Precedence.PrefixUnary,
      result
    )
  }

  public visitBinaryOpNode(
    node: BinaryOpNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    switch (node.op) {
      case BinaryOp.Or:
        if (node.token.kind == TokKind.KeyOr) {
          return this.prettyBinary(
            this.spacedOper(TexlLexer.KeywordOr),
            parentPrecedence,
            Precedence.Or,
            Precedence.Or + 1,
            node.left,
            node.right
          )
        } else {
          return this.prettyBinary(
            this.spacedOper(TexlLexer.PunctuatorOr),
            parentPrecedence,
            Precedence.Or,
            Precedence.Or + 1,
            node.left,
            node.right
          )
        }

      case BinaryOp.And:
        if (node.token.Kind == TokKind.KeyAnd) {
          return this.prettyBinary(
            this.spacedOper(TexlLexer.KeywordAnd),
            parentPrecedence,
            Precedence.And,
            Precedence.And + 1,
            node.left,
            node.right
          )
        } else {
          return this.prettyBinary(
            this.spacedOper(TexlLexer.PunctuatorAnd),
            parentPrecedence,
            Precedence.And,
            Precedence.And + 1,
            node.left,
            node.right
          )
        }

      case BinaryOp.Concat:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorAmpersand),
          parentPrecedence,
          Precedence.Concat,
          Precedence.Concat + 1,
          node.left,
          node.right
        )
      case BinaryOp.Add:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorAdd),
          parentPrecedence,
          Precedence.Add,
          Precedence.And + 1,
          node.left,
          node.right
        )
      case BinaryOp.Mul:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorMul),
          parentPrecedence,
          Precedence.Mul,
          Precedence.Mul + 1,
          node.left,
          node.right
        )
      case BinaryOp.Div:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorDiv),
          parentPrecedence,
          Precedence.Mul,
          Precedence.Mul + 1,
          node.left,
          node.right
        )
      case BinaryOp.In:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.KeywordIn),
          parentPrecedence,
          Precedence.In,
          Precedence.In + 1,
          node.left,
          node.right
        )
      case BinaryOp.Exactin:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.KeywordExactin),
          parentPrecedence,
          Precedence.In,
          Precedence.In + 1,
          node.left,
          node.right
        )

      case BinaryOp.Power:
        return this.prettyBinary(
          TexlLexer.PunctuatorCaret,
          parentPrecedence,
          Precedence.Power,
          Precedence.PrefixUnary,
          node.left,
          node.right
        )
      case BinaryOp.Error:
        return this.prettyBinary(
          ' <error> ',
          parentPrecedence,
          Precedence.Error,
          Precedence.Error + 1,
          node.left,
          node.right
        )

      case BinaryOp.Equal:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorEqual),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )
      case BinaryOp.NotEqual:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorNotEqual),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )
      case BinaryOp.Less:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorLess),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )
      case BinaryOp.LessEqual:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorLessOrEqual),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )
      case BinaryOp.Greater:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorGreater),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )
      case BinaryOp.GreaterEqual:
        return this.prettyBinary(
          this.spacedOper(TexlLexer.PunctuatorGreaterOrEqual),
          parentPrecedence,
          Precedence.Compare,
          Precedence.Compare + 1,
          node.left,
          node.right
        )

      default:
        // Contracts.Assert(false)
        return this.prettyBinary(
          ' <error> ',
          parentPrecedence,
          Precedence.Atomic + 1,
          Precedence.Atomic + 2,
          node.left,
          node.right
        )
    }
  }

  public visitAsNode(
    node: AsNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    return this.applyPrecedence(
      parentPrecedence,
      Precedence.As,
      CollectionUtils.With(
        CollectionUtils.With(
          node.left.acceptResult(this, Precedence.As),
          this.spacedOper(TexlLexer.KeywordAs)
        ),
        node.right.token.toString()
      )
    )
  }

  public visitVariadicOpNode(
    node: VariadicOpNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);
    // Contracts.AssertNonEmpty(node.Children);

    switch (node.op) {
      case VariadicOp.Chain:
        const op = this.spacedOper(
          TexlLexer.LocalizedInstance.localizedPunctuatorChainingSeparator
        )
        const count = node.count
        let result: Array<string> = []

        for (let i = 0; i < count; i++) {
          result = CollectionUtils.With(
            result,
            ...node.children[i].acceptResult(this, Precedence.None)
          )
          if (i != count - 1) {
            result = CollectionUtils.With(
              result,
              this.spacedOper(
                TexlLexer.LocalizedInstance.localizedPunctuatorChainingSeparator
              )
            )
          }
        }

        return result
      default:
        // Contracts.Assert(false)
        return ['<error>']
    }
  }

  public visitCallNode(
    node: CallNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    let result: Array<string> = []
    const sb = new StringBuilder()
    if (!node.head.namespace.isRoot) {
      result = CollectionUtils.With(
        result,
        node.head.namespace.toDottedSyntax(),
        TexlLexer.PunctuatorDot
      )
    }

    result = CollectionUtils.With(
      result,
      node.head.token.toString(),
      TexlLexer.PunctuatorParenOpen
    )
    result = CollectionUtils.With(
      result,
      ...node.args.acceptResult(this, Precedence.Primary)
    )
    result = CollectionUtils.With(result, TexlLexer.PunctuatorParenClose)

    return this.applyPrecedence(parentPrecedence, Precedence.Primary, result)
  }

  public visitStrInterpNode(node: StrInterpNode, context: Precedence) {
    // Contracts.AssertValue(node);

    const count = node.count
    let result: LazyList<string> = LazyList.Empty

    result = result.with(['$"'])
    for (let i = 0; i < count; i++) {
      if (node.children[i].kind === NodeKind.StrLit) {
        // Contracts.Assert(node.Children[i] is StrLitNode);

        const strLit = node.children[i] as StrLitNode
        result = result.with([CharacterUtils.ExcelEscapeString(strLit.value)])
      } else {
        result = result
          .with(['{'])
          .with(node.children[i].acceptResult(this, Precedence.None))
          .with(['}'])
      }
    }

    result = result.with(['"'])
    return result.values
  }

  public visitListNode(
    node: ListNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    const listSep =
      TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
    let result: Array<string> = []
    for (let i = 0; i < node.children.length; ++i) {
      result = CollectionUtils.With(
        result,
        ...node.children[i].acceptResult(this, Precedence.None)
      )
      if (i != node.children.length - 1) {
        result = CollectionUtils.With(result, listSep)
      }
    }

    return result
  }

  public visitRecordNode(
    node: RecordNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node)

    const listSep =
      TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
    let result: Array<string> = []
    for (let i = 0; i < node.children.length; ++i) {
      result = CollectionUtils.With(
        result,
        node.ids[i].token.toString(),
        TexlLexer.PunctuatorColon
      )
      result = CollectionUtils.With(
        result,
        ...node.children[i].acceptResult(this, Precedence.SingleExpr)
      )
      if (i != node.children.length - 1) {
        result = CollectionUtils.With(result, listSep)
      }
    }

    result = CollectionUtils.With(
      [TexlLexer.PunctuatorCurlyOpen, ' '],
      ...result
    )
    result = CollectionUtils.With(result, ' ', TexlLexer.PunctuatorCurlyClose)

    if (node.sourceRestriction != null) {
      result = CollectionUtils.With([TexlLexer.PunctuatorAt], ...result)
    }

    return this.applyPrecedence(parentPrecedence, Precedence.SingleExpr, result)
  }

  public visitTableNode(
    node: TableNode,
    parentPrecedence: Precedence
  ): Array<string> {
    // Contracts.AssertValue(node);

    const listSep =
      TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
    let result: Array<string> = []
    for (let i = 0; i < node.children.length; ++i) {
      result = CollectionUtils.With(
        result,
        ...node.children[i].acceptResult(this, Precedence.SingleExpr)
      )
      if (i != node.children.length - 1) {
        result = CollectionUtils.With(result, listSep)
      }
    }

    result = CollectionUtils.With(
      [TexlLexer.PunctuatorBracketOpen, ' '],
      ...result
    )
    result = CollectionUtils.With(result, ' ', TexlLexer.PunctuatorBracketClose)

    return this.applyPrecedence(parentPrecedence, Precedence.SingleExpr, result)
  }

  public getRightToken(leftNode: TexlNode, right: Identifier): string {
    return right.token.toString()
  }

  private applyPrecedence(
    parentPrecedence: Precedence,
    precedence: Precedence,
    strings: Array<string>
  ): Array<string> {
    if (parentPrecedence > precedence) {
      let result = [TexlLexer.PunctuatorParenOpen]
      result = CollectionUtils.With(result, ...strings)
      result = CollectionUtils.With(result, TexlLexer.PunctuatorParenClose)
      return result
    }

    return strings
  }

  // For left associative operators: precRight == precLeft + 1.
  // private PrettyBinary(strOp: string, parentPrecedence: Precedence, precLeft: Precedence, left: TexlNode, right: TexlNode): Array<string>
  // {
  //     return this.PrettyBinary(strOp, parentPrecedence, precLeft, precLeft + 1, left, right);
  // }

  private prettyBinary(
    strOp: string,
    parentPrecedence: Precedence,
    precLeft: Precedence,
    precRight: Precedence,
    left: TexlNode,
    right: TexlNode
  ): Array<string> {
    // Contracts.AssertNonEmpty(strOp);

    return this.applyPrecedence(
      parentPrecedence,
      precLeft,
      CollectionUtils.With(
        CollectionUtils.With(left.acceptResult(this, precLeft), strOp),
        ...right.acceptResult(this, precRight)
      )
    )
  }

  private spacedOper(op: string): string {
    // Contracts.AssertNonEmpty(op);

    return ' ' + op + ' '
  }
}

export class PrettyPrintVisitor extends TexlFunctionalVisitor<
  Array<string>,
  PrettyPrintVisitorContext
> {
  private readonly _script: string

  private static readonly BinaryPrecedence: Dictionary<BinaryOp, Precedence> =
    new Dictionary<BinaryOp, Precedence>([
      [BinaryOp.Or, Precedence.Or],
      [BinaryOp.And, Precedence.And],
      [BinaryOp.Concat, Precedence.Concat],
      [BinaryOp.Add, Precedence.Add],
      [BinaryOp.Mul, Precedence.Mul],
      [BinaryOp.Div, Precedence.Mul],
      [BinaryOp.In, Precedence.In],
      [BinaryOp.Exactin, Precedence.In],
      [BinaryOp.Power, Precedence.Power],
      [BinaryOp.Error, Precedence.Error],
      [BinaryOp.Equal, Precedence.Compare],
      [BinaryOp.NotEqual, Precedence.Compare],
      [BinaryOp.Greater, Precedence.Compare],
      [BinaryOp.GreaterEqual, Precedence.Compare],
      [BinaryOp.Less, Precedence.Compare],
      [BinaryOp.LessEqual, Precedence.Compare],
    ])

  constructor(script: string) {
    super()
    this._script = script
  }

  // Public entry point for prettyprinting TEXL parse trees
  public static Format(
    node: TexlNode,
    before: SourceList,
    after: SourceList,
    script: string
  ): string {
    // Contracts.AssertValue(node);

    const pretty = new PrettyPrintVisitor(script)
    let arr = CollectionUtils.With(
      pretty.CommentsOf(before),
      ...node.acceptResult(pretty, new PrettyPrintVisitorContext(0))
    )
    arr = CollectionUtils.With(arr, ...pretty.CommentsOf(after))
    const preRegex = arr.join().replace('\n\n', '\n')
    return preRegex.replace(/\n+(\n+)/g, '\n')
    // return new RegExp(@"\n +(\n +)").Replace(preRegex, (Match match) => match.Groups[1].Value);
  }

  private CommentsOf(list: SourceList): Array<string> {
    if (list == null) {
      return []
    }
    return list.sources
      .filter((source) => source instanceof TokenSource)
      .filter((tok) => (tok as TokenSource).token.kind === TokKind.Comment)
      .map((source) => this.GetScriptForToken((source as TokenSource).token))
  }

  private Basic(
    node: TexlNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    return node.sourceList.sources
      .map((source) => {
        if (source instanceof NodeSource) {
          return source.node.acceptResult(this, context)
        } else if (source instanceof WhitespaceSource) {
          return ['']
        } else {
          return source.tokens.map(this.GetScriptForToken)
        }
      })
      .flat()
  }

  private Single(node: TexlNode): Array<string> {
    return node.sourceList.tokens
      .filter((tok) => tok.kind !== TokKind.Whitespace)
      .map(this.GetScriptForToken)
  }

  public visit(node: TexlNode, context: PrettyPrintVisitorContext) {
    switch (node.kind) {
      case NodeKind.Replaceable:
        return this.visitReplaceableNode(node as ReplaceableNode, context)
      case NodeKind.Error:
        return this.visitErrorNode(node as ErrorNode, context)
      case NodeKind.Blank:
        return this.visitBlankNode(node as BlankNode, context)
      case NodeKind.BoolLit:
        return this.visitBoolLitNode(node as BoolLitNode, context)
      case NodeKind.StrLit:
        return this.visitStrLitNode(node as StrLitNode, context)
      case NodeKind.NumLit:
        return this.visitNumLitNode(node as NumLitNode, context)
      case NodeKind.FirstName:
        return this.visitFirstNameNode(node as FirstNameNode, context)
      case NodeKind.Parent:
        return this.visitParentNode(node as ParentNode, context)
      case NodeKind.Self:
        return this.visitSelfNode(node as SelfNode, context)
      case NodeKind.DottedName:
        return this.visitDottedNameNode(node as DottedNameNode, context)
      case NodeKind.UnaryOp:
        return this.visitUnaryOpNode(node as UnaryOpNode, context)
      case NodeKind.BinaryOp:
        return this.visitBinaryOpNode(node as BinaryOpNode, context)
      case NodeKind.As:
        return this.visitAsNode(node as AsNode, context)
      case NodeKind.VariadicOp:
        return this.visitVariadicOpNode(node as VariadicOpNode, context)
      case NodeKind.Call:
        return this.visitCallNode(node as CallNode, context)
      case NodeKind.List:
        return this.visitListNode(node as ListNode, context)
      case NodeKind.Record:
        return this.visitRecordNode(node as RecordNode, context)
      case NodeKind.Table:
        return this.visitTableNode(node as TableNode, context)
      default:
        throw new Error('Unknown nodes are not supported')
    }
  }

  public visitReplaceableNode(
    node: ReplaceableNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    throw new Error('Replaceable nodes are not supported')
  }

  public visitErrorNode(
    node: ErrorNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node);
    return ['<error>']
  }

  public visitBlankNode(
    node: BlankNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node);
    return []
  }

  public visitBoolLitNode(
    node: BoolLitNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node);
    return [node.value ? TexlLexer.KeywordTrue : TexlLexer.KeywordFalse]
  }

  public visitStrLitNode(
    node: StrLitNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node);
    return ['"', CharacterUtils.ExcelEscapeString(node.value), '"']
  }

  public visitNumLitNode(
    node: NumLitNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node)

    return this.Single(node)
  }

  public visitFirstNameNode(
    node: FirstNameNode,
    context: PrettyPrintVisitorContext
  ): Array<string> {
    // Contracts.AssertValue(node);

    if (node.ident.atToken == null) {
      return [node.ident.token.toString()]
    } else {
      return [
        TexlLexer.PunctuatorBracketOpen,
        TexlLexer.PunctuatorAt,
        node.ident.token.toString(),
        TexlLexer.PunctuatorBracketClose,
      ]
    }
  }

  public visitParentNode(node: ParentNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    return [TexlLexer.KeywordParent]
  }

  public visitSelfNode(node: SelfNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    return [TexlLexer.KeywordSelf]
  }

  public visitDottedNameNode(
    node: DottedNameNode,
    context: PrettyPrintVisitorContext
  ) {
    // Contracts.AssertValue(node)

    return this.Basic(node, context)
  }

  public visitUnaryOpNode(
    node: UnaryOpNode,
    context: PrettyPrintVisitorContext
  ) {
    // Contracts.AssertValue(node)

    return this.Basic(node, context)
  }

  public visitBinaryOpNode(
    node: BinaryOpNode,
    context: PrettyPrintVisitorContext
  ) {
    // Contracts.AssertValue(node);

    if (node.token.kind == TokKind.PercentSign) {
      return this.Basic(node, context)
    }
    const result = PrettyPrintVisitor.BinaryPrecedence.tryGetValue(node.op)
    let precedence = result[1]
    if (!result[0]) {
      // Contracts.Assert(false, "Couldn't find precedence for " + node.Op);
      precedence = Precedence.Error
    }

    let builder: Array<string> = []
    let firstNode = true
    for (const source of node.sourceList.sources.filter(
      (source) => !(source instanceof WhitespaceSource)
    )) {
      if (source instanceof NodeSource) {
        if (firstNode) {
          builder = CollectionUtils.With(
            builder,
            ...source.node.acceptResult(
              this as TexlFunctionalVisitor<
                Array<string>,
                PrettyPrintVisitorContext
              >,
              context
            )
          )
          builder = CollectionUtils.With(builder, ' ')
          firstNode = false
        } else {
          builder = CollectionUtils.With(builder, ' ')
          builder = CollectionUtils.With(
            builder,
            ...source.node.acceptResult(
              this as TexlFunctionalVisitor<
                Array<string>,
                PrettyPrintVisitorContext
              >,
              context
            )
          )
        }
      } else {
        builder = CollectionUtils.With(
          builder,
          ...source.tokens.map(this.GetScriptForToken)
        )
      }
    }

    return builder
  }

  public visitVariadicOpNode(
    node: VariadicOpNode,
    context: PrettyPrintVisitorContext
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertNonEmpty(node.Children);

    if (node.op == VariadicOp.Chain) {
      let result: string[] = []
      for (const source of node.sourceList.sources.filter(
        (source) => !(source instanceof WhitespaceSource)
      )) {
        if (source instanceof NodeSource) {
          result = CollectionUtils.With(
            result,
            ...source.node.acceptResult(
              this as TexlFunctionalVisitor<
                Array<string>,
                PrettyPrintVisitorContext
              >,
              context
            )
          )
        } else if (
          source instanceof TokenSource &&
          source.token.kind == TokKind.Semicolon
        ) {
          result = CollectionUtils.With(
            CollectionUtils.With(result, this.GetScriptForToken(source.token)),
            this.GetNewLine(context.indentDepth + 1)
          )
        } else {
          result = CollectionUtils.With(
            result,
            ...source.tokens.map(this.GetScriptForToken)
          )
        }
      }

      return result
    }

    return this.Basic(node, context)
  }

  public visitCallNode(node: CallNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    return this.Basic(node, context)
  }

  public visitListNode(node: ListNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    // This must be precalculated, as if any generated argument contains a newline,
    // this should newline as well.
    context = context.indent()
    const preResult = this.PreGenerateNodes(context, node.sourceList)
    const generatedNodes = preResult[0]
    const hasNewline = preResult[1]
    const useNewlines = node.count > 1 || hasNewline

    let result: Array<string> = []
    for (const source of node.sourceList.sources) {
      if (source instanceof WhitespaceSource) {
        continue
      }

      const nodeSource = source as NodeSource
      if (nodeSource != null && useNewlines) {
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth + 1)
        )
        result = CollectionUtils.With(result, ...generatedNodes.get(nodeSource))
      } else if (nodeSource != null) {
        result = CollectionUtils.With(
          result,
          ...nodeSource.node.acceptResult(
            this as TexlFunctionalVisitor<
              Array<string>,
              PrettyPrintVisitorContext
            >,
            context
          )
        )
      } else if (
        source instanceof TokenSource &&
        source.token.kind == TokKind.ParenClose &&
        useNewlines
      ) {
        result = CollectionUtils.With(
          CollectionUtils.With(result, this.GetNewLine(context.indentDepth)),
          this.GetScriptForToken(source.token)
        )
      } else {
        result = CollectionUtils.With(
          result,
          ...source.tokens.map(this.GetScriptForToken)
        )
      }
    }

    return result
  }

  public visitRecordNode(node: RecordNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    context = context.indent()
    const preResult = this.PreGenerateNodes(context, node.sourceList)
    const generatedNodes = preResult[0]
    const hasNewline = preResult[1]
    const useNewlines = node.count > 1 || hasNewline

    let result: Array<string> = []
    let previousToken: Token = null
    for (const source of node.sourceList.sources) {
      if (source instanceof WhitespaceSource) {
        continue
      }

      const tokenSource = source as TokenSource
      const commentToken = tokenSource?.token as CommentToken
      if (source instanceof NodeSource) {
        result = CollectionUtils.With(result, ...generatedNodes.get(source))
      } else if (
        tokenSource != null &&
        tokenSource.token.kind == TokKind.Colon
      ) {
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token)
        )
        result = CollectionUtils.With(result, ' ')
      } else if (source instanceof IdentifierSource) {
        result = CollectionUtils.With(
          result,
          ...source.tokens.map(this.GetScriptForToken)
        )
      } else if (
        tokenSource != null &&
        tokenSource.token.kind == TokKind.CurlyClose &&
        useNewlines
      ) {
        result = CollectionUtils.With(
          result,
          ...this.GetNewLine(context.indentDepth)
        )
        result = CollectionUtils.With(
          result,
          ...this.GetScriptForToken(tokenSource.token)
        )
      } else if (
        tokenSource != null &&
        (tokenSource.token.Kind == TokKind.CurlyOpen ||
          tokenSource.token.Kind == TokKind.Comma) &&
        useNewlines
      ) {
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token)
        )
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth + 1)
        )
      } else if (
        commentToken != null &&
        (previousToken?.kind == TokKind.CurlyOpen ||
          previousToken?.kind == TokKind.Comma) &&
        !commentToken.value.startsWith('//') &&
        !commentToken.value.startsWith('\n')
      ) {
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token)
        )
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth + 1)
        )
      } else if (
        commentToken != null &&
        (previousToken?.kind == TokKind.CurlyOpen ||
          previousToken?.kind == TokKind.Comma) &&
        !commentToken.value.startsWith('//') &&
        commentToken.value.startsWith('\n')
      ) {
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token).trimStart()
        )
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth + 1)
        )
      } else {
        result = CollectionUtils.With(
          result,
          ...source.tokens.map(this.GetScriptForToken)
        )
      }

      previousToken = tokenSource?.token
    }

    return result
  }

  public visitTableNode(node: TableNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node);

    context = context.indent()
    const preResult = this.PreGenerateNodes(context, node.sourceList)
    const generatedNodes = preResult[0]
    const hasNewline = preResult[1]

    // let generatedNodes = PreGenerateNodes(context, node.SourceList, out let hasNewline);
    const useNewlines = node.count > 1 || hasNewline

    let result: Array<string> = []
    for (const source of node.sourceList.sources.filter(
      (source) => !(source instanceof WhitespaceSource)
    )) {
      const tokenSource = source as TokenSource
      if (source instanceof NodeSource) {
        result = CollectionUtils.With(result, ...generatedNodes.get(source))
      } else if (
        tokenSource != null &&
        tokenSource.token.kind == TokKind.Comma
      ) {
        if (useNewlines) {
          result = CollectionUtils.With(
            result,
            this.GetScriptForToken(tokenSource.token)
          )
          result = CollectionUtils.With(
            result,
            this.GetNewLine(context.indentDepth + 1)
          )
        } else {
          result = CollectionUtils.With(
            result,
            this.GetScriptForToken(tokenSource.token)
          )
          result = CollectionUtils.With(result, ' ')
        }
      } else if (
        tokenSource != null &&
        tokenSource.token.kind == TokKind.BracketOpen &&
        useNewlines
      ) {
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token)
        )
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth + 1)
        )
      } else if (
        tokenSource != null &&
        tokenSource.token.kind == TokKind.BracketClose &&
        useNewlines
      ) {
        result = CollectionUtils.With(
          result,
          this.GetNewLine(context.indentDepth)
        )
        result = CollectionUtils.With(
          result,
          this.GetScriptForToken(tokenSource.token)
        )
      } else {
        result = CollectionUtils.With(
          result,
          ...source.tokens.map(this.GetScriptForToken)
        )
      }
    }

    return result
  }

  public visitAsNode(node: AsNode, context: PrettyPrintVisitorContext) {
    // Contracts.AssertValue(node)

    return this.Basic(node, context)
  }

  private PreGenerateNodes(
    context: PrettyPrintVisitorContext,
    sourceList: SourceList
  ): [Dictionary<NodeSource, Array<string>>, boolean] {
    const generatedNodes = new Dictionary<NodeSource, Array<string>>()
    for (const source of sourceList.sources) {
      if (source instanceof NodeSource) {
        generatedNodes.set(source, source.node.acceptResult(this, context))
      }
    }

    const vs: string[] = []
    for (const v of generatedNodes.values()) {
      vs.push(...v)
    }
    const hasNewline = vs.some((v) => v.includes('\n'))

    return [generatedNodes, hasNewline]
  }

  private GetScriptForToken(token: Token): string {
    return token.Span.getFragment(this._script).trimEnd()
  }

  private GetNewLine(indentation: number): string {
    return '\n' + this.GetNewLineIndent(indentation)
  }

  private GetNewLineIndent(indentation: number): string {
    return Array(indentation - 1)
      .fill('    ')
      .join()
  }
}

export class PrettyPrintVisitorContext {
  public _indentDepth: number

  public get indentDepth() {
    return this._indentDepth
  }

  constructor(indentDepth: number) {
    this._indentDepth = indentDepth
  }

  public with(indentDepth: number): PrettyPrintVisitorContext {
    return new PrettyPrintVisitorContext(indentDepth)
  }

  indent(): PrettyPrintVisitorContext {
    return this.with(this.indentDepth + 1)
  }
}
