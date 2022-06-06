import { TexlNode } from './TexlNode'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { VariadicBase } from './VariadicBase'
import { Span } from '../../localization'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { NodeKind } from '../NodeKind'

export class TableNode extends VariadicBase {
  public readonly commas: Token[]
  // BracketClose can be null.
  public readonly bracketClose?: Token

  // Assumes ownership of all of the array args.
  constructor(
    idNext: number,
    primaryToken: Token,
    sourceList: SourceList,
    exprs: TexlNode[],
    commas: Token[] = [],
    bracketCloseToken?: Token, // : base(ref idNext, primaryToken, sourceList, exprs)
  ) {
    // Contracts.AssertValue(exprs);
    // Contracts.AssertValueOrNull(commas);
    // Contracts.AssertValueOrNull(bracketCloseToken);
    super(idNext, primaryToken, sourceList, exprs)
    this.commas = commas
    this.bracketClose = bracketCloseToken
  }

  public clone(idNext: number, ts: Span) {
    const children = this.cloneChildren(idNext++, ts)
    const newNodes = new Map<TexlNode, TexlNode>()
    for (let i = 0; i < this.children.length; ++i) newNodes.set(this.children[i], children[i])

    return new TableNode(
      idNext++,
      this.token.clone(ts),
      this.sourceList.clone(ts, newNodes),
      children,
      VariadicBase.Clone(this.commas, ts),
      this.bracketClose?.clone(ts),
    )
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.acceptChildren(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public get kind() {
    return NodeKind.Table
  }

  public asTable(): TableNode {
    return this
  }

  public getCompleteSpan() {
    let lim
    if (this.bracketClose != null) lim = this.bracketClose.span.lim
    else if (this.children.length == 0) lim = this.token.span.lim
    else lim = this.children[this.children.length].getCompleteSpan().lim

    return new Span(this.token.span.min, lim)
  }

  public getTextSpan() {
    const lim = this.bracketClose == null ? this.token.span.lim : this.bracketClose.span.lim
    return new Span(this.token.span.min, lim)
  }
}
