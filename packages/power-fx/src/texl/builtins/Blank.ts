import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

// Blank()
export class BlankFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'Blank', undefined, TexlStrings.AboutBlank, FunctionCategories.Text, DType.ObjNull, 0, 0, 0)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]]
  }
}
