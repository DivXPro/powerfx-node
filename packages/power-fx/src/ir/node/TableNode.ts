import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class TableNode extends IntermediateNode {
  public readonly Values: IntermediateNode[]

  constructor(irContext: IRContext, values: IntermediateNode[]) {
    super(irContext)
    Contracts.AssertAllValues(values)
    this.Values = values
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public ToString() {
    return `Table(${this.Values.join(',')})`
  }
}
