import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'

export class BooleanFunction extends BuiltinFunction {
  public static BooleanInvariantFunctionName = 'Boolean'

  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      BooleanFunction.BooleanInvariantFunctionName,
      undefined,
      TexlStrings.AboutBoolean,
      FunctionCategories.Text,
      DType.Boolean,
      0,
      1,
      1,
      DType.String,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.BooleanArg1]]
  }
}

// Boolean(arg:O)
export class BooleanFunction_UO extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      BooleanFunction.BooleanInvariantFunctionName,
      undefined,
      TexlStrings.AboutBoolean,
      FunctionCategories.Text,
      DType.Boolean,
      0,
      1,
      1,
      DType.UntypedObject,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.BooleanArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_UO')
  }
}
