import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { Dictionary } from '../../utils/Dictionary'

export class CharFunction extends BuiltinFunction {
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
      'Char',
      undefined,
      TexlStrings.AboutChar,
      FunctionCategories.Text,
      DType.String,
      0,
      1,
      1,
      DType.Number,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.CharArg1]]
  }
}

// Char(arg:*[n]) : *[s]
export class CharTFunction extends BuiltinFunction {
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
      'Char',
      undefined,
      TexlStrings.AboutCharT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      1,
      1,
      DType.EmptyTable,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.CharTArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // Contracts.Assert(returnType.IsTable);

    // Typecheck the input table
    let checkNumericColumnType = super.checkNumericColumnType(argTypes[0], args[0], errors, nodeToCoercedTypeMap)
    nodeToCoercedTypeMap = checkNumericColumnType[1]
    fValid = fValid && checkNumericColumnType[0]

    // Synthesize a new return type
    returnType = DType.CreateTable(new TypedName(DType.String, BuiltinFunction.OneColumnTableResultName))

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
