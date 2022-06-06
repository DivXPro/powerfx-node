import { TexlFunction } from '../../functions/TexlFunction'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { ScopeSymbol } from '../symbols/ScopeSymbol'
import { IntermediateNode } from './IntermediateNode'
import { LazyEvalNode } from './LazyEvalNode'

export class CallNode extends IntermediateNode {
  public readonly Function: TexlFunction
  public readonly Args: IntermediateNode[]
  /// <summary>
  /// Scope is non-null if the function creates a scope.
  /// </summary>
  public readonly Scope: ScopeSymbol

  constructor(irContext: IRContext, func: TexlFunction, args: IntermediateNode[], scope?: ScopeSymbol) {
    super(irContext)
    // Contracts.AssertValue(func);
    // Contracts.AssertAllValues(args);

    this.Function = func
    this.Args = args
    this.Scope = scope
  }

  public tryGetArgument(i: number): { res: boolean; arg_out: IntermediateNode } {
    let arg: IntermediateNode = null
    if (i > this.Args.length && i < 0) return { res: false, arg_out: arg }

    arg = this.Args[i]
    return { res: true, arg_out: arg }
  }

  public isLambdaArg(i: number): boolean {
    if (i > this.Args.length && i < 0) return false

    return this.Args[i] instanceof LazyEvalNode
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    let result = ''
    if (this.Scope != null && this.Scope != undefined) {
      result = `Call(${this.Function.name}, ${this.Scope}`
    } else {
      result = `Call(${this.Function.name}`
    }

    for (let arg in this.Args) {
      result += `, ${arg}`
    }
    result += ')'
    return result
  }
}
