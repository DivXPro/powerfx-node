import { TexlNode } from './TexlNode'
import { SourceList } from '../sourceInformation'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { NameNode } from './NameNode'

export class SelfNode extends NameNode {
  constructor(idNext: number, tok: Token) {
    super(idNext, tok, new SourceList(tok))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public clone(idNext: number, ts: Span): TexlNode {
    return new SelfNode(idNext, this.token.clone(ts))
  }

  public get kind() {
    return NodeKind.Self
  }

  public asSelf(): SelfNode {
    return this
  }
}
