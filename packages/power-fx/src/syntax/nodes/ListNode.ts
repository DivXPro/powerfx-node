import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { TexlNode } from './TexlNode'
import { VariadicBase } from './VariadicBase'
import { NodeKind } from '../NodeKind'
import { Span } from '../../localization'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'

export class ListNode extends VariadicBase {
  readonly delimiters?: Token[]
  constructor(
    idNext: number,
    tok: Token,
    args: TexlNode[],
    delimiters: Token[] | undefined,
    sourceList: SourceList
  ) {
    // Contracts.AssertValue(args)
    // Contracts.AssertValueOrNull(delimiters)
    super(idNext, tok, sourceList, args)
    this.delimiters = delimiters
  }

  get kind() {
    return NodeKind.List
  }

  clone(idNext: number, ts: Span) {
    const children = this.cloneChildren(idNext++, ts)
    let newNodes = new Map<TexlNode, TexlNode>()
    for (let i = 0; i < this.children.length; ++i) {
      newNodes.set(this.children[i], children[i])
    }
    return new ListNode(
      idNext++,
      this.token.clone(ts),
      children,
      VariadicBase.Clone(this.delimiters, ts),
      this.sourceList.clone(ts, newNodes)
    )
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.acceptChildren(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(
    visitor: TexlFunctionalVisitor<Result, Context>,
    context: Context
  ): Result {
    return visitor.visit(this, context)
  }

  public castList(): ListNode {
    return this
  }

  public asList(): ListNode {
    return this
  }
}
