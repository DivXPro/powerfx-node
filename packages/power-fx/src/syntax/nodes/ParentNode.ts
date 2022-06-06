import { TexlNode } from './TexlNode'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { NameNode } from './NameNode'

export class ParentNode extends NameNode {
  constructor(idNext: number, tok: Token) {
    super(idNext, tok, new SourceList(tok))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this as ParentNode)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this as ParentNode, context)
  }

  public clone(idNext: number, ts: Span) {
    return new ParentNode(idNext, this.token.clone(ts))
  }

  public get kind() {
    return NodeKind.Parent
  }

  public asParent(): ParentNode {
    return this
  }
}
