import { IRContext } from '../../ir/IRContext'
import { FormulaType } from '../types/FormulaType'
import { RecordType } from '../types/RecordType'
import { BlankValue } from './BlankValue'
import { FormulaValue } from './FormulaValue'
import { InMemoryRecordValue } from './InMemoryRecordValue'
import { IValueVisitor } from './IValueVisitor'
import { NamedValue } from './NamedValue'
import { ValidFormulaValue } from './ValidFormulaValue'

export abstract class RecordValue extends ValidFormulaValue {
  public abstract get fields(): NamedValue[]

  constructor(irContext: IRContext) {
    super(irContext)
    // Contract.Assert(IRContext.ResultType is RecordType);
  }

  public static Empty(): RecordValue {
    const type = new RecordType()
    const irContext = IRContext.NotInSource(type)
    return new InMemoryRecordValue(irContext, [])
  }

  // public GetField(name: string): FormulaValue
  // {
  //     return GetField(IRContext.NotInSource(FormulaType.Blank), name);
  // }

  public getField(irContextOrName: string): FormulaValue
  public getField(irContextOrName: IRContext, name: string): FormulaValue
  public getField(irContextOrName: IRContext | string, name?: string): FormulaValue {
    const _name = typeof irContextOrName === 'string' ? irContextOrName : name
    const _context =
      irContextOrName instanceof IRContext ? irContextOrName : IRContext.NotInSource(FormulaType.Blank)
    for (const field of this.fields) {
      if (name === field.name) {
        return field.value
      }
    }
    return new BlankValue(_context)
  }

  public abstract setField(name: string, value: FormulaValue, checkField: boolean): void

  // Return an object, which can be used as 'dynamic' to fetch fields.
  public toObject() {
    // let e = new ExpandoObject();
    let dict: Record<string, any> = {}
    for (const field of this.fields) {
      dict[field.name] = field.value.toObject()
    }
    return dict
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
