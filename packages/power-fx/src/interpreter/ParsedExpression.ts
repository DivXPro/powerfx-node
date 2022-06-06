import { IntermediateNode } from '../ir/node'
import { IExpression } from '../public/IExpression'
import { FormulaValue } from '../public/values'
import { RecordValue } from '../public/values/RecordValue'
import { CultureInfo } from '../utils/CultureInfo'
import { EvalVisitor } from './EvalVisitor'
import { SymbolContext } from './SymbolContext'
import { ScopeSymbol } from '../ir/symbols/ScopeSymbol'

export class ParsedExpression implements IExpression {
  private _irnode: IntermediateNode
  private readonly _topScopeSymbol: ScopeSymbol
  private readonly _cultureInfo: CultureInfo

  public get irnode() {
    return this._irnode
  }
  constructor(irnode: IntermediateNode, topScope: ScopeSymbol, cultureInfo?: CultureInfo) {
    this._irnode = irnode
    this._topScopeSymbol = topScope
    this._cultureInfo = cultureInfo ?? CultureInfo.CurrentCulture
  }

  public async eval(parameters: RecordValue): Promise<FormulaValue> {
    const ev2 = new EvalVisitor(this._cultureInfo)
    const newValue = await this._irnode.accept(ev2, SymbolContext.NewTopScope(this._topScopeSymbol, parameters))

    return newValue
  }
}
