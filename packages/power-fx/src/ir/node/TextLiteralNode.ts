import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class TextLiteralNode extends IntermediateNode {
  public readonly LiteralValue: string

  constructor(irContext: IRContext, value: string) {
    super(irContext)
    this.LiteralValue = value
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public ToString(): string {
    return `Text(${this.LiteralValue})`
  }
}
