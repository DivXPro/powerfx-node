import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IScopeSymbol } from '../symbols/IScopeSymbol'
import { IntermediateNode } from './IntermediateNode'

export class ScopeAccessNode extends IntermediateNode {
  /// <summary>
  /// Either a ScopeSymbol or a ScopeAccessSymbol
  /// A ScopeSymbol here represents access to the whole scope record,
  /// A ScopeAccessSymbol here represents access to a single field from the scope
  /// </summary>
  public readonly value: IScopeSymbol

  constructor(irContext: IRContext, symbol: IScopeSymbol) {
    super(irContext)
    Contracts.AssertValue(symbol)
    this.value = symbol
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }
  public toString() {
    return `ScopeAccess(${this.value})`
  }
}
