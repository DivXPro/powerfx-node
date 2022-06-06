import { DName } from '../../utils/DName'
import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class SingleColumnTableAccessNode extends IntermediateNode {
  public readonly From: IntermediateNode
  public readonly Field: DName

  constructor(irContext: IRContext, from: IntermediateNode, field: DName) {
    super(irContext)
    Contracts.AssertValid(field)
    Contracts.AssertValue(from)

    this.From = from
    this.Field = field
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public ToString() {
    return `SingleColumnAccess(${this.From},${this.Field})`
  }
}
