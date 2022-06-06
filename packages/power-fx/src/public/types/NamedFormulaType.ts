import { TypedName } from '../../types/TypedName'
import { DName } from '../../utils/DName'
import { FormulaType } from './FormulaType'
export class NamedFormulaType {
  public _typedName: TypedName
  public displayName: DName
  field: FormulaType

  constructor(name: TypedName, displayName?: string)
  constructor(name: string, type: FormulaType, displayName?: string)
  constructor(name: string | TypedName, typeOrDisplayName: FormulaType | string, displayName?: string) {
    if (name instanceof TypedName) {
      this._typedName = name
      this.displayName = typeOrDisplayName == null ? undefined : new DName(typeOrDisplayName as string)
    } else {
      this._typedName = new TypedName((typeOrDisplayName as FormulaType)._type, new DName(name))
      this.displayName = typeOrDisplayName == null ? undefined : new DName(displayName)
    }
  }

  public get name() {
    return this._typedName.name
  }

  public get type(): FormulaType {
    return FormulaType.Build(this._typedName.type)
  }
}
