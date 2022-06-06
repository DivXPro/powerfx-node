import { Identifier } from '../Identifier'
import { Token } from '../../lexer/tokens'
import { VariadicBase } from './VariadicBase'
import { SourceList } from '../sourceInformation'
import { TexlNode } from './TexlNode'
import { Span } from '../../localization'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { NodeKind } from '../NodeKind'

export class RecordNode extends VariadicBase {
  public readonly commas: Token[]
  public readonly colons: Token[]
  public readonly ids: Identifier[]
  // CurlyClose can be null.
  public readonly curlyClose: Token

  // SourceRestriction can be null
  // Used to associate a record that is using display names with a data source
  public readonly sourceRestriction?: TexlNode

  // Assumes ownership of all of the array args.
  constructor(
    idNext: number,
    primaryTokens: Token,
    sourceList: SourceList,
    ids: Identifier[],
    exprs: TexlNode[],
    commas: Token[],
    colons: Token[],
    curlyCloseToken: Token,
    sourceRestriction?: TexlNode,
  ) {
    // Contracts.AssertValue(ids);
    // Contracts.AssertValue(exprs);
    // Contracts.Assert(ids.Length == exprs.Length);
    // Contracts.AssertValueOrNull(commas);
    // Contracts.AssertValueOrNull(colons);
    // Contracts.AssertValueOrNull(curlyCloseToken);
    // Contracts.AssertValueOrNull(sourceRestriction);
    super(idNext, primaryTokens, sourceList, exprs)
    this.ids = ids
    this.commas = commas
    this.colons = colons
    this.curlyClose = curlyCloseToken
    this.sourceRestriction = sourceRestriction
    if (sourceRestriction != null) {
      sourceRestriction.parent = this
      this.minChildID = Math.min(sourceRestriction.MinChildID, this.MinChildID)
    }
  }

  public clone(idNext: number, ts: Span): TexlNode {
    let children = this.cloneChildren(idNext++, ts)
    let newNodes = new Map<TexlNode, TexlNode>()
    for (let i = 0; i < this.children.length; ++i) {
      newNodes.set(this.children[i], children[i])
    }
    const newIdentifiers: Identifier[] = []
    for (let x = 0; x < this.ids.length; x++) {
      newIdentifiers[x] = this.ids[x].clone(ts)
    }
    return new RecordNode(
      idNext++,
      this.token.clone(ts),
      this.sourceList.clone(ts, newNodes),
      newIdentifiers,
      children,
      VariadicBase.Clone(this.commas, ts) as Token[],
      VariadicBase.Clone(this.colons, ts) as Token[],
      this.curlyClose.clone(ts),
      this.sourceRestriction?.clone(idNext++, ts),
    )
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      if (this.sourceRestriction != null) this.sourceRestriction.accept(visitor)

      this.acceptChildren(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public get kind() {
    return NodeKind.Record
  }

  public castRecord(): RecordNode {
    return this
  }

  public asRecord(): RecordNode {
    return this
  }

  public getTextSpan(): Span {
    const lim = this.curlyClose == null ? this.token.span.lim : this.curlyClose.span.lim
    return new Span(this.token.span.min, lim)
  }

  public getCompleteSpan(): Span {
    return this.getTextSpan()
  }
}
