import { SourceList } from '../sourceInformation'
import { TokKind } from '../../lexer/TokKind'
import { BinaryOp } from '../../lexer/BinaryOp'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { TexlNode } from './TexlNode'

export class BinaryOpNode extends TexlNode {
  readonly left: TexlNode
  readonly right: TexlNode
  op: BinaryOp

  constructor(
    idNext: number,
    primaryToken: Token,
    sourceList: SourceList,
    op: BinaryOp,
    left: TexlNode,
    right: TexlNode,
  ) {
    // Contracts.AssertValue(left)
    // Contracts.AssertValue(right)
    super(idNext, primaryToken, sourceList)
    this.op = op
    this.left = left
    this.right = right
    left.parent = this
    right.parent = this
    this.depth = 1 + (left.Depth > right.Depth ? left.Depth : right.Depth)
    this.minChildID = Math.min(left.MinChildID, right.MinChildID)
  }

  public clone(idNext: number, ts: Span) {
    const left = this.left.clone(idNext++, ts)
    const right = this.right.clone(idNext++, ts)
    const newNodes = new Map([
      [this.left, left],
      [this.right, right],
    ])
    return new BinaryOpNode(idNext++, this.token, this.sourceList.clone(ts, newNodes), this.op, left, right)
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor)
    if (visitor.preVisit(this)) {
      this.left.accept(visitor)
      this.right.accept(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public get kind() {
    return NodeKind.BinaryOp
  }

  public castBinaryOp(): BinaryOpNode {
    return this
  }

  public asBinaryOp(): BinaryOpNode {
    return this
  }

  public getCompleteSpan(): Span {
    if (this.token.kind == TokKind.PercentSign && this.right.token.span.lim < this.left.token.span.min)
      return new Span(this.right.token.span.min, this.left.token.span.lim)
    else return new Span(this.left.getCompleteSpan().min, this.right.getCompleteSpan().lim)
  }
}
