import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'
import { UnaryOpKind } from './UnaryOpKind'

export class UnaryOpNode extends IntermediateNode {
  public readonly Op: UnaryOpKind
  public readonly Child: IntermediateNode

  constructor(irContext: IRContext, op: UnaryOpKind, child: IntermediateNode) {
    super(irContext)
    Contracts.AssertValue(child)
    Contracts.Assert(op != UnaryOpKind.RecordToRecord && op != UnaryOpKind.TableToTable)

    this.Op = op
    this.Child = child
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `UnaryOp(${this.Op},${this.Child})`
  }
}
