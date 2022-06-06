import { TexlNode } from './TexlNode'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { VariadicOp } from '../../lexer/VariadicOp'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { VariadicBase } from './VariadicBase'

export class VariadicOpNode extends VariadicBase {
  public readonly op: VariadicOp
  public readonly opTokens: Token[]

  // Assumes ownership of the 'children' and 'opTokens' array.
  constructor(idNext: number, op: VariadicOp, children: TexlNode[], opTokens: Token[] = [], sourceList: SourceList) {
    // Contracts.AssertNonEmpty(opTokens);
    super(idNext, opTokens[0], sourceList, children)
    this.op = op
    this.opTokens = opTokens
  }

  public clone(idNext: number, ts: Span) {
    const children = this.cloneChildren(idNext++, ts)
    const newNodes = new Map<TexlNode, TexlNode>()
    for (let i = 0; i < this.children.length; ++i) {
      newNodes.set(this.children[i], children[i])
    }

    return new VariadicOpNode(
      idNext++,
      this.op,
      children,
      VariadicBase.Clone(this.opTokens, ts),
      this.sourceList.clone(ts, newNodes),
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
    return NodeKind.VariadicOp
  }
}
