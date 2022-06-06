import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { Identifier } from '../Identifier'
import { NodeKind } from '../NodeKind'
import { NameNode } from './NameNode'
import { Span } from '../../localization'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'

export class FirstNameNode extends NameNode {
  readonly ident: Identifier

  public get isLhs() {
    return this.parent != null && this.parent.asDottedName() != null
  }

  constructor(idNext: number, tok: Token, sourceList: SourceList | undefined, ident: Identifier) {
    super(idNext, tok, sourceList || new SourceList(tok))
    this.ident = ident
  }

  get kind() {
    return NodeKind.FirstName
  }

  clone(idNext: number, ts: Span) {
    return new FirstNameNode(idNext, this.token.clone(ts), new SourceList(this.token), this.ident.clone(ts))
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public castFirstName(): FirstNameNode {
    return this
  }

  public asFirstName(): FirstNameNode {
    return this
  }
}
