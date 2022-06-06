import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class ErrorNode extends IntermediateNode {
  // ErrorHint contains the stringified part of the Parse Tree
  // that resulted in this error node.
  // This mostly exists for debug purposes.
  public readonly ErrorHint: string

  constructor(irContext: IRContext, value: string) {
    super(irContext)
    this.ErrorHint = value
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    return `Error(${this.ErrorHint})`
  }
}
