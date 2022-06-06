import { TexlNode } from './TexlNode'
import { Identifier } from '../Identifier'
import { NodeKind } from '../NodeKind'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { TexlVisitor } from '../visitors/TexlVisitor'
import { TexlFunctionalVisitor } from '../visitors'

export class AsNode extends TexlNode {
  readonly left: TexlNode
  readonly right: Identifier

  constructor(idNext: number, primaryToken: Token, sourceList: SourceList, left: TexlNode, right: Identifier) {
    // Contracts.AssertValue(left)
    // Contracts.AssertValue(right)
    super(idNext, primaryToken, sourceList)
    this.left = left
    this.right = right
    left.parent = this
    this.depth = 1 + left.Depth
    this.minChildID = left.MinChildID
  }

  get kind() {
    return NodeKind.As
  }

  clone(idNext: number, ts: Span) {
    const left = this.left.clone(idNext++, ts)
    const newNodes = new Map([[left, left]])
    return new AsNode(idNext, this.token.clone(ts), this.sourceList.clone(ts, newNodes), left, this.right)
  }

  accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor)
    if (visitor.preVisit(this)) {
      this.left.accept(visitor)
      visitor.postVisit(this)
    }
  }

  acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }
}
