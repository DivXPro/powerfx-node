import { DName } from '../../utils/DName'
import { StringBuilder } from '../../utils/StringBuilder'
import { Contracts } from '../../utils/Validation'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { ScopeSymbol } from '../symbols/ScopeSymbol'
import { IntermediateNode } from './IntermediateNode'
import { UnaryOpKind } from './UnaryOpKind'

export class AggregateCoercionNode extends IntermediateNode {
  public readonly Op: UnaryOpKind
  public readonly Child: IntermediateNode
  public readonly FieldCoercions: Map<DName, IntermediateNode>
  public readonly Scope: ScopeSymbol

  constructor(
    irContext: IRContext,
    op: UnaryOpKind,
    scope: ScopeSymbol,
    child: IntermediateNode,
    fieldCoercions: Map<DName, IntermediateNode>,
  ) {
    super(irContext)
    Contracts.AssertValue(child)
    Contracts.Assert(op == UnaryOpKind.RecordToRecord || op == UnaryOpKind.TableToTable)

    this.Op = op
    this.Scope = scope
    this.Child = child
    this.FieldCoercions = fieldCoercions
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString(): string {
    let f: string[] = []
    this.FieldCoercions.forEach((value, key) => {
      f.push(`${key} <- ${value}`)
    })
    var sb = new StringBuilder()
    sb.append(`AggregateCoercion(${this.Op}, `)
    sb.append(f.join(','))
    sb.append(')')
    return sb.toString()
  }
}
