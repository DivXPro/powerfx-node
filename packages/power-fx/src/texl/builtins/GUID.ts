import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class GUIDNoArgFunction extends BuiltinFunction {
  // Multiple invocations may produce different return values.
  public get isStateless() {
    return true
  }
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'GUID', undefined, TexlStrings.AboutGUID, FunctionCategories.Text, DType.Guid, 0, 0, 0)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]]
  }
}

// GUID(GuidString:s)
export class GUIDPureFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'GUID',
      undefined,
      TexlStrings.AboutGUID,
      FunctionCategories.Text,
      DType.Guid,
      0,
      1,
      1,
      DType.String,
    )
  }

  public getSignatures() {
    return [[TexlStrings.GUIDArg]]
  }
}
