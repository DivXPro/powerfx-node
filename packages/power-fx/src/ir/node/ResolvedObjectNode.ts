import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class ResolvedObjectNode extends IntermediateNode {
  public readonly Value: any

  constructor(irContext: IRContext, value: any) {
    super(irContext)
    Contracts.AssertValue(value)
    this.Value = value
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `ResolvedObject(${this.Value})`
  }
}
