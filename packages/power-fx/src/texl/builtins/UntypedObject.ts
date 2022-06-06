import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'

export class ParseJsonFunction extends BuiltinFunction {
  public static ParseJsonInvariantFunctionName = 'ParseJson'

  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  public get isHidden() {
    return true
  }

  constructor() {
    super(
      undefined,
      ParseJsonFunction.ParseJsonInvariantFunctionName,
      undefined,
      TexlStrings.AboutParseJson,
      FunctionCategories.Text,
      DType.UntypedObject,
      0,
      1,
      1,
      DType.String,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.ParseJsonArg1]]
  }
}

export class IndexFunction_UO extends BuiltinFunction {
  public static IndexInvariantFunctionName = 'Index'

  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  public get isHidden() {
    return true
  }

  constructor() {
    super(
      undefined,
      IndexFunction_UO.IndexInvariantFunctionName,
      undefined,
      TexlStrings.AboutIndex,
      FunctionCategories.Table,
      DType.UntypedObject,
      0,
      2,
      2,
      DType.UntypedObject,
      DType.Number,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.IndexArg1, TexlStrings.IndexArg2]]
  }
}
