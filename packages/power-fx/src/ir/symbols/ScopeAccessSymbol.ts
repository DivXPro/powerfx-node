import { DName } from '../../utils/DName'
import { Contracts } from '../../utils/Validation'
import { IScopeSymbol } from './IScopeSymbol'
import { ScopeSymbol } from './ScopeSymbol'

export class ScopeAccessSymbol implements IScopeSymbol {
  private _parent: ScopeSymbol
  public get Parent(): ScopeSymbol {
    return this._parent
  }
  private _index: number
  public get Index(): number {
    return this._index
  }

  private _name: DName

  public get Name(): DName {
    return this.Parent.accessedFields[this._index]
  }

  constructor(parent: ScopeSymbol, index: number) {
    Contracts.AssertValue(parent)
    Contracts.AssertIndex(index, parent.accessedFields.length)

    this._parent = parent
    this._index = index
  }

  public ToString(): string {
    return `${this._parent}, ${this._name}`
  }
}
