import { IScopeSymbol } from './IScopeSymbol'
import { DName } from '../../utils/DName'

export class ScopeSymbol implements IScopeSymbol {
  public id: number
  public get accessedFields(): DName[] {
    return this._fields
  }
  private _fields: DName[] = []

  constructor(id: number) {
    this.id = id
  }

  public addOrGetIndexForField(fieldName: DName): number {
    if (this._fields.indexOf(fieldName) > -1) {
      return this._fields.indexOf(fieldName)
    }
    this._fields.push(fieldName)
    return this._fields.length - 1
  }

  public toString(): string {
    return `Scope ${this.id}`
  }
}
