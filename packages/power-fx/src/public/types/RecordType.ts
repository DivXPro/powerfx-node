import { DType } from '../../types/DType'
import { TypedName } from '../../types/TypedName'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { FormulaType } from './FormulaType'
import { ITypeVistor } from './ITypeVistor'
import { NamedFormulaType } from './NamedFormulaType'
import { TableType } from './TableType'
import { SingleSourceDisplayNameProvider } from '../displayNames'
import { AggregateType } from './AggregateType'

// export class RecordType extends FormulaType {
export class RecordType extends AggregateType {
  constructor(type?: DType) {
    super(type ?? DType.EmptyRecord)
  }

  public visit(visitor: ITypeVistor) {
    visitor.visit(this)
  }

  private addNamedFormulaType(field: NamedFormulaType): RecordType {
    return new RecordType(this.addFieldToType(field))
  }

  public add(field: NamedFormulaType): RecordType
  public add(name: string, type: FormulaType): RecordType
  public add(name: NamedFormulaType | string, type?: FormulaType): RecordType {
    if (name instanceof NamedFormulaType) {
      return this.addNamedFormulaType(name)
    }
    return this.addNamedFormulaType(new NamedFormulaType(new TypedName(type._type, new DName(name))))
  }

  public toTable(): TableType {
    return new TableType(this._type.toTable())
  }

  public maybeGetFieldType(fieldName: string): FormulaType | undefined {
    // $$$ Better lookup
    let ftype: FormulaType = null
    this.getNames().forEach((field) => {
      if (field.name.value === fieldName) {
        ftype = field.type
        return ftype
      }
    })
    if (ftype != null) {
      return ftype
    }
    return undefined
  }

  public getFieldType(fieldName: string): FormulaType {
    let ft = this.maybeGetFieldType(fieldName)
    if (ft == null) {
      throw new Error(`No field ${fieldName}`)
    }
    return ft
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
      if (!field.displayName.equals(DName.Default())) {
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
