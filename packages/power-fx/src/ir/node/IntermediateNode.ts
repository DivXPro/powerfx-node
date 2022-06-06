import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'

export abstract class IntermediateNode {
  private _IRContext: IRContext
  public get IRContext(): IRContext {
    return this._IRContext
  }

  constructor(irContext: IRContext) {
    this._IRContext = irContext
  }
  public abstract accept<TResult, TContext>(
    visitor: IRNodeVisitor<TResult, TContext>,
    context: TContext,
  ): Promise<TResult> | TResult
}
