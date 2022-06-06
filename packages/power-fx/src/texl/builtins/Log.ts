import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

export class LogFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  public get hasPreciseErrors() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Log',
      undefined,
      TexlStrings.AboutLog,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      1,
      2,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.MathFuncArg1], [TexlStrings.MathFuncArg1, TexlStrings.LogBase]]
  }
}

// Log(number:n|*[n], [base:n|*[n]]):*[n]
// Equivalent Excel function: Log
export class LogTFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(undefined, 'Log', undefined, TexlStrings.AboutLogT, FunctionCategories.MathAndStat, DType.EmptyTable, 0, 1, 2)
  }

  public getSignatures() {
    return [[TexlStrings.MathFuncArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('_T')
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

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    let checkNumericColumnType = super.checkAllParamsAreTypeOrSingleColumnTable(DType.Number, args, argTypes, errors)
    returnType = checkNumericColumnType[1].returnType
    fValid = fValid && checkNumericColumnType[0]

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
