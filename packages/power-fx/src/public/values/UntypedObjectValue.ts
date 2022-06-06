import { IValueVisitor } from '.'
import { IRContext } from '../../ir/IRContext'
import { ValidFormulaValue } from './ValidFormulaValue'
import { FormulaType } from '../types'
import { JsonCustomObject } from '../../interpreter/functions/LibraryJson'

export interface IUntypedObject {
  type: FormulaType
  getArrayLength(): number
  at(index: number): IUntypedObject
  tryGetProperty(key: string): [boolean, IUntypedObject]
  getString(): string
  getNumber(): number
  getBoolean(): boolean
}

export function IsIUntypedObject(data: any): data is IUntypedObject {
  return data instanceof JsonCustomObject
}

export class UntypedObjectValue extends ValidFormulaValue {
  protected readonly _impl: IUntypedObject

  public get impl() {
    return this._impl
  }

  constructor(irContext: IRContext, impl: IUntypedObject) {
    super(irContext)
    // Contract.Assert(IRContext.ResultType == FormulaType.CustomObject);
    this._impl = impl
  }

  public toObject(): any {
    throw new Error('NotImplementedException')
  }

  public visit(visitor: IValueVisitor) {
    visitor.visit(this)
  }
}
