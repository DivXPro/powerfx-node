import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class ChainingNode extends IntermediateNode {
  public Nodes: IntermediateNode[]

  constructor(irContext: IRContext, nodes: IntermediateNode[]) {
    super(irContext)
    Contracts.AssertAllValues(nodes)

    this.Nodes = nodes
  }

  // public Accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): TResult {
  //   return visitor.Visit(this, context)
  // }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `Chained(${this.Nodes.join(', ')})`
  }
}
