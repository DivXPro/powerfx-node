import { SourceList } from '../sourceInformation'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { StrLitToken } from '../../lexer/tokens'

export class StrLitNode extends TexlNode {
  readonly value: string

  constructor(idNext: number, tok: StrLitToken) {
    super(idNext, tok, new SourceList(tok))
    this.value = tok.value
  }

  public get kind() {
    return NodeKind.StrLit
  }

  public clone(idNext: number, ts: Span): TexlNode {
    return new StrLitNode(idNext, this.token.clone(ts) as StrLitToken)
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }
}
