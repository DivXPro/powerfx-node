// A container for the symbols/scopes that are available for
// use within a given .visit method on EvalVisitor, allowing
// the EvalVisitor to be scope-agnostic. The implementation
// of call stack semantics in our language can leverage the
// existing C# call stack semantics by making new instances

import { ScopeSymbol } from '../ir/symbols/ScopeSymbol'
import { FormulaValue } from '../public/values'
import { RecordValue } from '../public/values/RecordValue'
import { Dictionary } from '../utils/Dictionary'
import { IScope, RecordScope } from './IScope'

// of this class in the bodies of the various .visit methods
export class SymbolContext {
  constructor(currentScope: ScopeSymbol, scopeValues: Dictionary<number, IScope>) {
    this._currentScope = currentScope
    this._scopeValues = scopeValues
  }

  private _currentScope: ScopeSymbol

  public get currentScope() {
    return this._currentScope
  }

  private _scopeValues: Dictionary<number, IScope>

  public get scopeValues() {
    return this._scopeValues
  }

  public static New(): SymbolContext {
    return new SymbolContext(null, new Dictionary<number, IScope>())
  }

  public static NewTopScope(topScope: ScopeSymbol, ruleScope: RecordValue): SymbolContext {
    return new SymbolContext(topScope, new Dictionary<number, IScope>([[topScope.id, new RecordScope(ruleScope)]]))
  }

  public withScope(currentScope: ScopeSymbol): SymbolContext {
    return new SymbolContext(currentScope, this.scopeValues)
  }

  public withScopeValues(scopeValues: IScope | RecordValue): SymbolContext {
    const newScopeValues = new Dictionary<number, IScope>(this.scopeValues)
    newScopeValues.set(
      this.currentScope.id,
      scopeValues instanceof RecordValue ? new RecordScope(scopeValues) : scopeValues,
    )
    return new SymbolContext(this.currentScope, newScopeValues)
  }

  public getScopeVar(scope: ScopeSymbol, name: string): FormulaValue {
    const record = this.scopeValues.get(scope.id)
    return record.resolve(name) // Binder should ensure success.
  }
}
