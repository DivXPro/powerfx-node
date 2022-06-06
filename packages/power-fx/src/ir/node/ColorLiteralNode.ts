import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class ColorLiteralNode extends IntermediateNode {
  public readonly LiteralValue: number

  constructor(irContext: IRContext, value: number) {
    super(irContext)
    this.LiteralValue = value
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `Color(${this.LiteralValue})`
  }
}
