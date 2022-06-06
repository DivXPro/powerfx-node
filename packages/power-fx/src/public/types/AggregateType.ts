import { DType } from '../../types/DType'
import { TypedName } from '../../types/TypedName'
import { DPath } from '../../utils/DPath'
import { SingleSourceDisplayNameProvider } from '../displayNames'
import { FormulaType } from './FormulaType'
import { NamedFormulaType } from './NamedFormulaType'

export abstract class AggregateType extends FormulaType {
  constructor(type: DType) {
    super(type)
  }

  // Enumerate fields
  public getNames(): NamedFormulaType[] {
    let names: TypedName[] = this._type.getAllNames(DPath.Root)
    // return from name in names select new NamedFormulaType(name);
    return names.map((name) => new NamedFormulaType(name))
  }

  protected addFieldToType(field: NamedFormulaType): DType {
    let displayNameProvider = this._type.displayNameProvider
    if (displayNameProvider == null) {
      displayNameProvider = new SingleSourceDisplayNameProvider()
    }

    if (displayNameProvider instanceof SingleSourceDisplayNameProvider) {
      if (field.displayName != null) {
        displayNameProvider = displayNameProvider.addField(field.name, field.displayName)
      }
    }

    let newType = this._type.add(field._typedName)

    if (displayNameProvider != null) {
      newType = DType.ReplaceDisplayNameProvider(newType, displayNameProvider)
    }

    return newType
  }
}
