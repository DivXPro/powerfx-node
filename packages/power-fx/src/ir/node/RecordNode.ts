import { DName } from '../../utils/DName'
import { IRContext } from '../IRContext'
import { IRNodeVisitor } from '../IRNodeVisitor'
import { IntermediateNode } from './IntermediateNode'

export class RecordNode extends IntermediateNode {
  public readonly Fields: Map<DName, IntermediateNode>

  constructor(irContext: IRContext, fields: Map<DName, IntermediateNode>) {
    super(irContext)
    // Contracts.AssertAllValid(fields.Keys);
    // Contracts.AssertAllValues(fields.Values);

    this.Fields = fields
  }

  public accept<TResult, TContext>(visitor: IRNodeVisitor<TResult, TContext>, context: TContext): Promise<TResult> {
    return visitor.visit(this, context)
  }

  public toString() {
    let f: string[] = []
    this.Fields.forEach((value, key) => {
      f.push(`${key} , ${value}`)
    })

    return `Record(${f.join(',')})`
  }
}
