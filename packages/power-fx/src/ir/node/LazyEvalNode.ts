import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class LazyEvalNode extends IntermediateNode {
  public readonly Child: IntermediateNode

  constructor(irContext: IRContext, wrapped: IntermediateNode) {
    super(irContext)
    Contracts.AssertValue(wrapped)
    this.Child = wrapped
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `Lazy(${this.Child})`
  }
}
