import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { UnaryOp } from '../../lexer/UnaryOp'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import TexlLexer from '../../lexer/TexlLexer'

export class UnaryOpNode extends TexlNode {
  readonly child: TexlNode
  readonly op: UnaryOp

  get isPercent() {
    return this.op === UnaryOp.Percent
  }

  get kind() {
    return NodeKind.UnaryOp
  }

  constructor(idNext: number, primaryToken: Token, sourceList: SourceList, op: UnaryOp, child: TexlNode) {
    super(idNext, primaryToken, sourceList)
    this.child = child
    this.op = op
    this.depth = child.Depth + 1
    this.minChildID = Math.min(child.MinChildID, this.minChildID)
  }

  clone(idNext: number, ts: Span) {
    const child = this.child.clone(idNext++, ts)
    const newNodes = new Map<TexlNode, TexlNode>([[this.child, child]])
    return new UnaryOpNode(idNext, this.token.clone(ts), this.sourceList.clone(ts, newNodes), this.op, this.child)
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.child.accept(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public castUnaryOp(): UnaryOpNode {
    return this
  }

  public asUnaryOpLit(): UnaryOpNode {
    return this
  }

  public getCompleteSpan(): Span {
    // For syntax coloring regarding percentages
    if (this.isPercent)
      return new Span(this.child.token.span.min, this.child.token.span.lim + TexlLexer.PunctuatorPercent.length)
    else return new Span(this.token.span.min, this.child.getCompleteSpan().lim)
  }
}
