import { DType } from '../../types/DType'
import { TypedName } from '../../types/TypedName'
import { DPath } from '../../utils/DPath'
import { SingleSourceDisplayNameProvider } from '../displayNames'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'
import { NamedFormulaType } from './NamedFormulaType'
import { RecordType } from './RecordType'

export class TableType extends FormulaType {
  constructor(type?: DType) {
    super(type == null ? DType.EmptyTable : type)
  }

  static FromRecord(type: RecordType): TableType {
    const tableType = type._type.toTable()
    return new TableType(tableType)
  }

  public visit(vistor: ITypeVistor): void {
    vistor.visit(this)
  }

  public add(field: NamedFormulaType): TableType {
    const newType = this._type.addTypeName(field._typedName)
    return new TableType(newType)
  }

  public get singleColumnFieldName(): string {
    return this.getNames()[0].name.toString()
  }

  public get singleColumnFieldType(): FormulaType {
    return this.getNames()[0].type
  }

  public toRecord(): RecordType {
    return new RecordType(this._type.toRecord())
  }

  public getNames(): NamedFormulaType[] {
    let names: TypedName[] = this._type.getAllNames(DPath.Root)
    return names.map((name) => new NamedFormulaType(name))
    // return from name in names select new NamedFormulaType(name);
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
