import { VariadicBase } from './VariadicBase'
import { Token } from '../../lexer/tokens'
import { SourceList } from '../sourceInformation'
import { TexlNode } from './TexlNode'
import { Span } from '../../localization'
import { Dictionary } from '../../utils'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { NodeKind } from '../NodeKind'

export class StrInterpNode extends VariadicBase {
  // StrInterpEnd can be null.
  public readonly strInterpEnd: Token

  constructor(
    idNext: number,
    strInterpStart: Token,
    sourceList: SourceList,
    children: TexlNode[],
    strInterpEnd: Token,
  ) {
    // Contracts.AssertValueOrNull(strInterpEnd);
    super(idNext, strInterpStart, sourceList, children)
    this.strInterpEnd = strInterpEnd
  }

  public clone(idNext: number, ts: Span): TexlNode {
    const children = this.cloneChildren(idNext, ts)
    const newNodes = new Dictionary<TexlNode, TexlNode>()
    for (let i = 0; i < this.children.length; ++i) {
      newNodes.set(this.children[i], children[i])
    }

    return new StrInterpNode(
      idNext,
      this.token.clone(ts),
      this.sourceList.clone(ts, newNodes),
      children,
      this.strInterpEnd,
    )
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.acceptChildren(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<TResult, TContext>(
    visitor: TexlFunctionalVisitor<TResult, TContext>,
    context: TContext,
  ): TResult {
    return visitor.visit(this, context)
  }

  public get kind() {
    return NodeKind.StrInterp
  }

  public asStrInterp(): StrInterpNode {
    return this
  }

  public getTextSpan(): Span {
    if (this.strInterpEnd == null) {
      return super.getTextSpan()
    }

    return new Span(this.token.span.min, this.strInterpEnd.Span.lim)
  }

  public getCompleteSpan(): Span {
    let limit: number

    // If we have a close paren, then the call node is complete.
    // If not, then the call node ends with the end of the last argument.
    if (this.strInterpEnd != null) {
      limit = this.strInterpEnd.Span.lim
    } else {
      limit = this.children[this.children.length - 1].getCompleteSpan().lim
    }

    return new Span(this.token.Span.min, limit)
  }
}
