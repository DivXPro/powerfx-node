import { SourceList } from '../sourceInformation'
import { NumLitToken, Token } from '../../lexer/tokens'
import { TexlNode } from './TexlNode'
import { NodeKind } from '../NodeKind'
import { Span } from '../../localization'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'

export class NumLitNode extends TexlNode {
  readonly numValue?: number

  constructor(idNext: number, tok: Token, sourceList?: SourceList, value?: number) {
    // Contracts.Assert(tok.Kind != TokKind.NumLit)
    super(idNext, tok, sourceList || new SourceList(tok))
    this.numValue = value
  }

  get value(): NumLitToken {
    return this.token as NumLitToken
  }

  get kind() {
    return NodeKind.NumLit
  }

  clone(idNext: number, ts: Span) {
    if (this.value == null) {
      return new NumLitNode(
        idNext,
        this.token.clone(ts),
        this.sourceList.clone(ts, undefined as unknown as Map<TexlNode, TexlNode>),
        this.numValue,
      )
    }
    return new NumLitNode(idNext, this.value.clone(ts))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }
}
