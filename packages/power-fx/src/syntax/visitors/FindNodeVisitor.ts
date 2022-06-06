import {
  BinaryOpNode,
  CallNode,
  DottedNameNode,
  ListNode,
  RecordNode,
  StrInterpNode,
  TableNode,
  TexlNode,
  UnaryOpNode,
  VariadicOpNode,
} from '../nodes'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { NodeKind } from '../NodeKind'
import { IdentityTexlVisitor } from './IdentityTexlVisitor'
import { LeafNodeType, NonLeafNodeType } from './types'
import { TokKind } from '../../lexer/TokKind'
import { StrInterpEndToken } from '../../lexer/tokens'

export class FindNodeVisitor extends IdentityTexlVisitor {
  private readonly _cursorPosition: number
  private _result: TexlNode

  constructor(cursorPosition: number) {
    super()
    // Contracts.Assert(cursorPosition >= 0);
    this._cursorPosition = cursorPosition
  }

  private SetCurrentNodeAsResult(node: TexlNode) {
    // Contracts.AssertValue(node);

    this._result = node
  }

  public static Run(node: TexlNode, cursorPosition: number): TexlNode {
    // Contracts.AssertValue(node);
    // Contracts.Assert(cursorPosition >= 0);

    const visitor = new FindNodeVisitor(cursorPosition)
    node.accept(visitor)
    return visitor._result
  }

  public preVisit(node: NonLeafNodeType): boolean {
    //
    switch (node.kind) {
      case NodeKind.VariadicOp:
        return this.preVisitVariadicOpNode(node as VariadicOpNode)
      case NodeKind.BinaryOp:
        return this.preVisitBinaryOpNode(node as BinaryOpNode)
      case NodeKind.UnaryOp:
        return this.preVisitUnaryOpNode(node as UnaryOpNode)
      case NodeKind.Call:
        return this.preVisitCallNode(node as CallNode)
      case NodeKind.List:
        return this.preVisitListNode(node as ListNode)
      case NodeKind.DottedName:
        return this.preVisitDottedNameNode(node as DottedNameNode)
      case NodeKind.Record:
        return this.preVisitRecordNode(node as RecordNode)
      case NodeKind.Table:
        return this.preVisitTableNode(node as TableNode)
      case NodeKind.StrInterp:
        return this.preVisitStrInterpNode(node as StrInterpNode)
      default:
        return
    }
  }

  public preVisitVariadicOpNode(node: VariadicOpNode): boolean {
    // Contracts.AssertValue(node);
    // Contracts.Assert(node.Children.Length > 0);

    const numTokens = CollectionUtils.Size(node.opTokens)

    // Contracts.Assert(node.Children.Length == numTokens + 1 || node.Children.Length == numTokens);

    for (var i = 0; i < numTokens; i++) {
      const token = node.opTokens[i]

      // Cursor position is inside ith child.

      if (this._cursorPosition <= token.Span.min) {
        node.children[i].accept(this)
        return false
      }

      // Cursor is on one of the operator tokens

      if (this._cursorPosition <= token.Span.lim) {
        this._result = node
        return false
      }
    }

    // If we got here the cursor should be in the last child.
    node.children[node.children.length - 1].accept(this)

    return false
  }

  public preVisitStrInterpNode(node: StrInterpNode) {
    if (
      this._cursorPosition <= node.token.Span.min || // Cursor position is before the $"
      (node.strInterpEnd != null &&
        node.strInterpEnd instanceof StrInterpEndToken &&
        node.strInterpEnd.Span.lim <= this._cursorPosition) || // Cursor is after the close quote.
      node.children.length == 0
    ) {
      //// Cursor is inside empty string interpolation.
      // _result = node;

      // If we got here we could be inside an empty island
      // i.e. $"Hello {|}"
      // Just visit the last child
      node.children[node.children.length - 1].accept(this)
      return false
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]

      // Cursor position is inside ith child.
      if (this._cursorPosition <= child.getCompleteSpan().lim) {
        child.accept(this)
        return false
      }
    }

    return false
  }

  public preVisitBinaryOpNode(node: BinaryOpNode): boolean {
    // Contracts.AssertValue(node)

    // Cursor is in the left node.
    if (this._cursorPosition <= node.token.Span.min) {
      node.left.accept(this)
      return false
    }

    // Cursor is inside the operation token.
    if (this._cursorPosition <= node.token.Span.lim) {
      this._result = node
      return false
    }

    node.right.accept(this)
    return false
  }

  public preVisitUnaryOpNode(node: UnaryOpNode) {
    // Contracts.AssertValue(node)

    // Cursor is inside the operation token.
    if (node.token.kind == TokKind.PercentSign) {
      const span = node.getSourceBasedSpan()

      if (
        (node.token.Span.min <= this._cursorPosition && this._cursorPosition <= node.token.Span.lim) ||
        this._cursorPosition <= span.min ||
        this._cursorPosition >= span.lim
      ) {
        this._result = node
        return false
      }
    } else {
      if (this._cursorPosition <= node.token.Span.lim) {
        this._result = node
        return false
      }
    }

    // Cursor is inside the child.
    node.child.accept(this)
    return false
  }

  public preVisitCallNode(node: CallNode) {
    // Contracts.AssertValue(node)
    // Contracts.Assert(node.Token.Kind == TokKind.ParenOpen || node.Token.Kind == TokKind.StrInterpStart)

    if (
      this._cursorPosition <= node.token.Span.min || // Cursor position is before the open paren.
      (node.parenClose != null && node.parenClose.Span.lim <= this._cursorPosition) || // Cursor is after the closed paren.
      node.args.count == 0
    ) {
      //// Cursor is between the open and closed paren.
      this._result = node
      return false
    }

    // Cursor is in one of the args.
    node.args.accept(this)
    return false
  }

  public preVisitListNode(node: ListNode) {
    // Contracts.AssertValue(node)
    // Contracts.Assert(node.Children.Length > 0)
    // Contracts.Assert(node.Children.Length == CollectionUtils.Size(node.Delimiters) + 1)

    for (let i = 0; i < CollectionUtils.Size(node.delimiters); i++) {
      const tokDel = node.delimiters[i]

      // Cursor position is inside ith child.
      if (this._cursorPosition <= tokDel.Span.min) {
        node.children[i].accept(this)
        return false
      }
    }

    // If we got here the cursor should be in the last child.
    node.children[node.children.length - 1].accept(this)
    return false
  }

  public preVisitDottedNameNode(node: DottedNameNode) {
    // Contracts.AssertValue(node)
    // Contracts.Assert(node.Token.IsDottedNamePunctuator)

    // Cursor is before the dot.
    if (this._cursorPosition <= node.token.Span.min) {
      node.left.accept(this)
      return false
    }

    // Cursor is in the dot or the right identifier.
    this._result = node
    return false
  }

  public preVisitRecordNode(node: RecordNode) {
    // Contracts.AssertValue(node)
    // Contracts.Assert(node.Token.Kind == TokKind.CurlyOpen || node.Token.Kind == TokKind.Ident)

    if (
      this._cursorPosition <= node.token.Span.min || // If cursor position is before the open curly return the record node.
      node.count == 0 || // Or if the record node is empty, return the record node.
      (node.curlyClose != null && node.curlyClose.Span.lim <= this._cursorPosition)
    ) {
      //// Cursor is after the closed curly.
      this._result = node
      return false
    }

    // Cursor is between the open and closed curly.
    const length = CollectionUtils.Size(node.commas)

    for (let i = 0; i < length; i++) {
      const tokComma = node.commas[i]

      // Cursor position is inside ith child.
      if (this._cursorPosition <= tokComma.Span.min) {
        node.children[i].accept(this)
        return false
      }
    }

    if (node.curlyClose == null || this._cursorPosition <= node.curlyClose.Span.min) {
      // Cursor is within the last child.
      node.children[node.children.length - 1].accept(this)
      return false
    }

    // Cursor is after the closing curly.
    this._result = node
    return false
  }

  public preVisitTableNode(node: TableNode) {
    // Contracts.AssertValue(node)
    // Contracts.Assert(node.Token.Kind == TokKind.BracketOpen)

    if (
      this._cursorPosition <= node.token.Span.min || // If cursor position is before the open Bracket return the table node.
      node.count == 0 || // Or if the table node is empty, return the table node.
      (node.bracketClose != null && node.bracketClose.Span.lim <= this._cursorPosition)
    ) {
      //// Cursor is after the closed bracket.
      this._result = node
      return false
    }

    // Cursor is between the open and closed bracket.
    for (let i = 0; i < node.children.length; i++) {
      // Cursor position is inside ith child.
      if (this._cursorPosition <= node.children[i].token.Span.lim) {
        node.children[i].accept(this)
        return false
      }
    }

    // If we got here the cursor is not within the brackets. return tableNode.
    this._result = node
    return false
  }

  public visit(node: LeafNodeType) {
    this.SetCurrentNodeAsResult(node)
  }

  // public Visit(node: BoolLitNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: ErrorNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: StrLitNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: NumLitNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: FirstNameNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: ParentNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }

  // public void Visit(node: SelfNode)
  // {
  //     SetCurrentNodeAsResult(node);
  // }
}
