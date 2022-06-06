import { BindKind, TexlBinding } from '../binding'
import { BinaryOp, TokKind, UnaryOp, VariadicOp } from '../lexer'
import TexlLexer from '../lexer/TexlLexer'
import { TexlParser } from '../parser'
import {
  AsNode,
  BinaryOpNode,
  CallNode,
  DottedNameNode,
  FirstNameNode,
  ListNode,
  Precedence,
  RecordNode,
  StrInterpNode,
  TableNode,
  TexlNode,
  UnaryOpNode,
  VariadicOpNode,
} from '../syntax'
import { NodeKind } from '../syntax/NodeKind'
import { TexlFunctionalVisitor } from '../syntax/visitors'
import { LeafNodeType, NonLeafNodeType } from '../syntax/visitors/types'
import { LazyList } from '../utilityDataStructures/LazyList'

// A visitor that provides PII-free unformatted prints of powerapps formulas.
export class StructuralPrint extends TexlFunctionalVisitor<LazyList<string>, Precedence> {
  private readonly _binding: TexlBinding

  constructor(binding?: TexlBinding) {
    super()
    this._binding = binding
  }

  // Public entry point for prettyprinting TEXL parse trees
  public static Print(node: TexlNode, binding?: TexlBinding): string {
    // Contracts.AssertValue(node);

    const pretty = new StructuralPrint(binding)
    return node.acceptResult(pretty, Precedence.None).values.join()
  }

  public visit(node: LeafNodeType | NonLeafNodeType, parentPrecedence: Precedence): LazyList<string> {
    // Contracts.AssertValue(node);
    switch (node.kind) {
      case NodeKind.Replaceable:
        return LazyList.Of<string>('#$replaceable$#')
      case NodeKind.Error:
        return LazyList.Of<string>('#$error$#')
      case NodeKind.Blank:
        return LazyList.Of<string>('Blank()')
      case NodeKind.BoolLit:
        return LazyList.Of<string>('#$boolean$#')
      case NodeKind.StrLit:
        return LazyList.Of<string>('#$string$#')
      case NodeKind.NumLit:
        return LazyList.Of<string>('#$number$#')
      case NodeKind.FirstName: {
        const info = this._binding?.getInfo(node)
        if (info != null && info.kind !== BindKind.Unknown) {
          return LazyList.Of<string>(`#\$${BindKind[info.kind]}\$#`)
        }
        if ((node as FirstNameNode).ident.atToken == null) {
          return LazyList.Of<string>('#$firstname$#')
        } else {
          return LazyList.Of<string>('#$disambiguation$#')
        }
      }
      case NodeKind.Parent:
        return LazyList.Of<string>(TexlLexer.KeywordParent)
      case NodeKind.Self:
        return LazyList.Of<string>(TexlLexer.KeywordSelf)
      case NodeKind.DottedName: {
        const dottedNameNode = node as DottedNameNode
        const separator: string = TexlParser.GetTokString(dottedNameNode.token.kind)
        let values = dottedNameNode.left.acceptResult(this, Precedence.Primary)
        values = values.with([separator])
        if (dottedNameNode.right.atToken != null || dottedNameNode.usesBracket)
          values = values.with(['#$disambiguation$#'])
        else
          values = values.with(
            (dottedNameNode.rightNode?.acceptResult(this, parentPrecedence) ?? LazyList.Of<string>('#$righthandid$#'))
              .values,
          )
        return this.applyPrecedence(parentPrecedence, Precedence.Primary, values)
      }
      case NodeKind.As:
        return this.applyPrecedence(
          parentPrecedence,
          Precedence.As,
          (node as AsNode).left
            .acceptResult(this, Precedence.As)
            .with([this.spacedOper(TexlLexer.KeywordAs)])
            .with(['#$righthandid$#']),
        )
      case NodeKind.UnaryOp: {
        const unaryNode = node as UnaryOpNode
        const child = unaryNode.child.acceptResult(this, Precedence.PrefixUnary)
        let result: LazyList<string>
        switch (unaryNode.op) {
          case UnaryOp.Not:
            if (node.token.kind == TokKind.KeyNot)
              result = LazyList.Of<string>(TexlLexer.KeywordNot, ' ').with(child.values)
            else result = LazyList.Of<string>(TexlLexer.PunctuatorBang).with(child.values)
            break
          case UnaryOp.Minus:
            result = LazyList.Of<string>(TexlLexer.PunctuatorSub).with(child.values)
            break
          case UnaryOp.Percent:
            result = LazyList.Of<string>(...child.values).with([TexlLexer.PunctuatorPercent])
            break
          default:
            // Contracts.Assert(false)
            result = LazyList.Of<string>('#$error$#').with(child.values)
            break
        }
        return this.applyPrecedence(parentPrecedence, Precedence.PrefixUnary, result)
      }
      case NodeKind.BinaryOp: {
        const binaryNode = node as BinaryOpNode
        switch (binaryNode.op) {
          case BinaryOp.Or:
            if (binaryNode.token.Kind == TokKind.KeyOr)
              return this.prettyBinary({
                strOp: this.spacedOper(TexlLexer.KeywordOr),
                parentPrecedence,
                precLeft: Precedence.Or,
                left: binaryNode.left,
                right: binaryNode.right,
              })
            else
              return this.prettyBinary({
                strOp: this.spacedOper(TexlLexer.PunctuatorOr),
                parentPrecedence,
                precLeft: Precedence.Or,
                left: binaryNode.left,
                right: binaryNode.right,
              })
          case BinaryOp.And:
            if (binaryNode.token.Kind == TokKind.KeyAnd)
              return this.prettyBinary({
                strOp: this.spacedOper(TexlLexer.KeywordAnd),
                parentPrecedence,
                precLeft: Precedence.And,
                left: binaryNode.left,
                right: binaryNode.right,
              })
            else
              return this.prettyBinary({
                strOp: this.spacedOper(TexlLexer.PunctuatorAnd),
                parentPrecedence,
                precLeft: Precedence.And,
                left: binaryNode.left,
                right: binaryNode.right,
              })
          case BinaryOp.Concat:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorAmpersand),
              parentPrecedence,
              precLeft: Precedence.Concat,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Add:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorAdd),
              parentPrecedence,
              precLeft: Precedence.Add,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Mul:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorMul),
              parentPrecedence,
              precLeft: Precedence.Mul,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Div:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorDiv),
              parentPrecedence,
              precLeft: Precedence.Mul,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.In:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.KeywordIn),
              parentPrecedence,
              precLeft: Precedence.In,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Exactin:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.KeywordExactin),
              parentPrecedence,
              precLeft: Precedence.In,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Power:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorCaret),
              parentPrecedence,
              precLeft: Precedence.Power,
              precRight: Precedence.PrefixUnary,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Error:
            return this.prettyBinary({
              strOp: '#$error$#',
              parentPrecedence,
              precLeft: Precedence.Error,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Equal:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorEqual),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.NotEqual:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorNotEqual),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Less:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorLess),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.LessEqual:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorLessOrEqual),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.Greater:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorGreater),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          case BinaryOp.GreaterEqual:
            return this.prettyBinary({
              strOp: this.spacedOper(TexlLexer.PunctuatorGreaterOrEqual),
              parentPrecedence,
              precLeft: Precedence.Compare,
              left: binaryNode.left,
              right: binaryNode.right,
            })
          default:
            // Contracts.Assert(false)
            return this.prettyBinary({
              strOp: '#$error$#',
              parentPrecedence,
              precLeft: Precedence.Atomic + 1,
              left: binaryNode.left,
              right: binaryNode.right,
            })
        }
      }
      case NodeKind.VariadicOp: {
        const variadicNode = node as VariadicOpNode
        switch (variadicNode.op) {
          case VariadicOp.Chain:
            const count = variadicNode.count
            let result: LazyList<string> = LazyList.Empty
            for (let i = 0; i < count; i++) {
              result = result.with(variadicNode.children[i].acceptResult(this, Precedence.None).values)
              if (i != count - 1)
                result = result.with([
                  this.spacedOper(TexlLexer.LocalizedInstance.localizedPunctuatorChainingSeparator),
                ])
            }
            return result
          default:
            // Contracts.Assert(false);
            return LazyList.Of<string>('#$error$#')
        }
      }
      case NodeKind.Call: {
        const callNode = node as CallNode
        let result: LazyList<string> = LazyList.Empty
        if (!callNode.head.namespace.isRoot) {
          result = result.with(['#$servicefunction#$', TexlLexer.PunctuatorDot])
        } else {
          result = result
            .with([callNode.head.token.toString(), TexlLexer.PunctuatorParenOpen])
            .with(callNode.args.acceptResult(this, Precedence.Primary).values)
            .with([TexlLexer.PunctuatorParenClose])
        }
        return this.applyPrecedence(parentPrecedence, Precedence.Primary, result)
      }
      case NodeKind.StrInterp: {
        // Contracts.AssertValue(node);

        const strIntepNode = node as StrInterpNode
        const count = strIntepNode.count
        let result = LazyList.Empty.with(['$"']) as LazyList<string>

        for (let i = 0; i < count; i++) {
          if (strIntepNode.children[i].kind === NodeKind.StrLit) {
            result = result.with(strIntepNode.children[i].acceptResult(this, parentPrecedence).values)
          } else {
            result = result
              .with(['{'])
              .with(strIntepNode.children[i].acceptResult(this, parentPrecedence).values)
              .with(['}'])
          }
        }

        return result.with(['"'])
      }
      case NodeKind.List: {
        const listNode = node as ListNode
        const listSep = TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
        let result: LazyList<string> = LazyList.Empty
        for (let i = 0; i < listNode.children.length; ++i) {
          result = result.with(listNode.children[i].acceptResult(this, Precedence.None).values)
          if (i != listNode.children.length - 1) result = result.with([listSep])
        }
        return result
      }
      case NodeKind.Record: {
        const recodeNode = node as RecordNode
        let listSep = TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
        let result: LazyList<string> = LazyList.Empty
        for (let i = 0; i < recodeNode.children.length; ++i) {
          result = result
            .with(['#$fieldname$#', TexlLexer.PunctuatorColon])
            .with(recodeNode.children[i].acceptResult(this, Precedence.SingleExpr).values)
          if (i != recodeNode.children.length - 1) result = result.with([listSep])
        }
        result = LazyList.Of<string>(TexlLexer.PunctuatorCurlyOpen, ' ')
          .with(result.values)
          .with([' ', TexlLexer.PunctuatorCurlyClose])
        if (recodeNode.sourceRestriction != null) {
          result = LazyList.Of<string>(TexlLexer.PunctuatorAt).with(result.values)
        }
        return this.applyPrecedence(parentPrecedence, Precedence.SingleExpr, result)
      }
      case NodeKind.Table: {
        const tableNode = node as TableNode
        let listSep = TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
        let result: LazyList<string> = LazyList.Empty
        for (let i = 0; i < tableNode.children.length; ++i) {
          result = result.with(tableNode.children[i].acceptResult(this, Precedence.SingleExpr).values)
          if (i != tableNode.children.length - 1) result = result.with([listSep])
        }
        result = LazyList.Of<string>(TexlLexer.PunctuatorBracketOpen, ' ')
          .with(result.values)
          .with([' ', TexlLexer.PunctuatorBracketClose])
        return this.applyPrecedence(parentPrecedence, Precedence.SingleExpr, result)
      }
    }
  }

  private applyPrecedence(
    parentPrecedence: Precedence,
    precedence: Precedence,
    strings: LazyList<string>,
  ): LazyList<string> {
    if (parentPrecedence > precedence) {
      var result = LazyList.Of<string>(TexlLexer.PunctuatorParenOpen)
      result = result.with(strings.values)
      result = result.with([TexlLexer.PunctuatorParenClose])
      return result
    }
    return strings
  }

  // For left associative operators: precRight == precLeft + 1.
  //   private PrettyBinary(string strOp, Precedence parentPrecedence, Precedence precLeft, TexlNode left, TexlNode right): LazyList<string>
  //   {
  //       return PrettyBinary(strOp, parentPrecedence, precLeft, precLeft + 1, left, right);
  //   }

  private prettyBinary(props: {
    strOp: string
    parentPrecedence: Precedence
    precLeft: Precedence
    precRight?: Precedence
    left: TexlNode
    right: TexlNode
  }): LazyList<string> {
    //   Contracts.AssertNonEmpty(strOp);
    const { strOp, parentPrecedence, precLeft, precRight = precLeft + 1, left, right } = props
    return this.applyPrecedence(
      parentPrecedence,
      precLeft,
      left.acceptResult(this, precLeft).with([strOp]).with(right.acceptResult(this, precRight).values),
    )
  }

  private spacedOper(op: string): string {
    // Contracts.AssertNonEmpty(op)

    return ' ' + op + ' '
  }
}
