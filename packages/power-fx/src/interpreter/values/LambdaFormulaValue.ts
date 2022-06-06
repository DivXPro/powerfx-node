import { IRContext } from '../../ir/IRContext'
import { IntermediateNode } from '../../ir/node'
import { FormulaValue } from '../../public/values'
import { IValueVisitor } from '../../public/values/IValueVisitor'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'

export class LambdaFormulaValue extends FormulaValue {
  private readonly _tree: IntermediateNode

  // Lambdas don't get a special type.
  // Type is the type the lambda evaluates too.
  constructor(irContext: IRContext, node: IntermediateNode) {
    super(irContext)
    this._tree = node
  }

  public async evalAsync(runner: EvalVisitor, context: SymbolContext): Promise<FormulaValue> {
    const result = await this._tree.accept(runner, context)
    return result
  }

  public toObject() {
    return '<Lambda>'
  }

  public visit(visitor: IValueVisitor) {
    throw new Error('NotImplementedException')
  }
}
