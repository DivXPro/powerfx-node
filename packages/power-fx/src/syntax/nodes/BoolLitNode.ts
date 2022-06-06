import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { TokKind } from '../../lexer/TokKind'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'

export class BoolLitNode extends TexlNode {
  constructor(idNext: number, tok: Token) {
    // Contracts.AssertValue(tok)
    // Contracts.Assert(tok.Kind == TokKind.True || tok.Kind == TokKind.False)
    super(idNext, tok, new SourceList(tok))
  }

  public get kind() {
    return NodeKind.BoolLit
  }

  public get value() {
    return this.token.kind === TokKind.True
  }

  public clone(idNext: number, ts: Span): TexlNode {
    return new BoolLitNode(idNext, this.token.clone(ts))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public castBoolLit(): BoolLitNode {
    return this
  }

  public AsBoolLit(): BoolLitNode {
    return this
  }
}
