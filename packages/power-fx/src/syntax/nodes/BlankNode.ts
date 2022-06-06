import { SourceList } from '../sourceInformation'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'

export class BlankNode extends TexlNode {
  constructor(idNext: number, primaryToken: Token) {
    super(idNext, primaryToken, new SourceList(primaryToken))
  }
  get kind() {
    return NodeKind.Blank
  }

  public clone(idNext: number, ts: Span) {
    return new BlankNode(idNext, this.token.clone(ts))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor)
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public AsBlank() {
    return this
  }
}
