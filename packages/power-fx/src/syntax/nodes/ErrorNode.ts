import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'

export class ErrorNode extends TexlNode {
  public readonly message: string
  public readonly args?: any[]

  constructor(idNext: number, primaryToken: Token, msg: string, ...args: any[]) {
    // Contracts.AssertValue(args)
    super(idNext, primaryToken, new SourceList(primaryToken))
    this.message = msg
    this.args = args
  }

  public clone(idNext: number, ts: Span): TexlNode {
    return new ErrorNode(idNext, this.token.clone(ts), this.message, ...this.args)
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    visitor.visit(this)
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public get kind() {
    return NodeKind.Error
  }

  public asError(): ErrorNode {
    return this as ErrorNode
  }
}
