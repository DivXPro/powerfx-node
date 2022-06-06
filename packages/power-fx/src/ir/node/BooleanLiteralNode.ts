import { DName } from '../../utils/DName'
import { StringBuilder } from '../../utils/StringBuilder'
import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { ScopeSymbol } from '../symbols/ScopeSymbol'
import { IntermediateNode } from './IntermediateNode'
import { UnaryOpKind } from './UnaryOpKind'

export class BooleanLiteralNode extends IntermediateNode {
  public readonly LiteralValue: boolean
  constructor(irContext: IRContext, value: boolean) {
    super(irContext)
    this.LiteralValue = value
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }
  public toString() {
    return `Bool(${this.LiteralValue})`
  }
}
