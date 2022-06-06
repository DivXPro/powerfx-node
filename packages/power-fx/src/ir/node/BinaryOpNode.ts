import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { BinaryOpKind } from './BinaryOpKind'
import { IntermediateNode } from './IntermediateNode'

export class BinaryOpNode extends IntermediateNode {
  public readonly Op: BinaryOpKind
  public readonly Left: IntermediateNode
  public readonly Right: IntermediateNode

  constructor(irContext: IRContext, op: BinaryOpKind, left: IntermediateNode, right: IntermediateNode) {
    super(irContext)
    Contracts.AssertValue(left)
    Contracts.AssertValue(right)

    this.Op = op
    this.Left = left
    this.Right = right
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString(): string {
    return `BinaryOp(${this.Op}, ${this.Left}, ${this.Right})`
  }
}
