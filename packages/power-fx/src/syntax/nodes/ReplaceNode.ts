import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { SourceList } from '../sourceInformation'
import { ReplaceableToken } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'

export class ReplaceableNode extends TexlNode {
  readonly value: string

  constructor(idNext: number, tok: ReplaceableToken) {
    super(idNext, tok, new SourceList(tok))
    this.value = tok.value
    // Contracts.AssertValue(this.value)
  }

  get kind() {
    return NodeKind.Replaceable
  }

  clone(idNext: number, ts: Span) {
    return new ReplaceableNode(idNext, this.token.clone(ts) as ReplaceableToken)
  }

  public asReplaceable(): ReplaceableNode {
    return this
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }
}
