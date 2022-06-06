import { IsBlankFunctionBase } from './IsBlank'
import { StringGetter, TexlStrings } from '../../localization'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
export class IsBlankOrErrorFunction extends IsBlankFunctionBase {
  public static IsBlankOrErrorInvariantFunctionName = 'IsBlankOrError'

  constructor() {
    super(
      IsBlankOrErrorFunction.IsBlankOrErrorInvariantFunctionName,
      TexlStrings.AboutIsBlankOrError,
      FunctionCategories.Table | FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.IsBlankOrErrorArg1]]
  }
}

// IsBlankOrError(expression:E)
// Equivalent Excel and DAX function: IsBlank
export class IsBlankOrErrorOptionSetValueFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor() {
    super(
      undefined,
      IsBlankOrErrorFunction.IsBlankOrErrorInvariantFunctionName,
      undefined,
      TexlStrings.AboutIsBlankOrError,
      FunctionCategories.Table | FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
      DType.OptionSetValue,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.IsBlankOrErrorArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('OptionSetValue')
  }
}
