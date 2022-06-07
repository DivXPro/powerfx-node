// Power(number:n, number:n):n

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

// Equivalent DAX function: Power
export class PowerFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Power',
      undefined,
      TexlStrings.AboutPower,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      2,
      2,
      DType.Number,
      DType.Number
    )
  }

  public getSignatures() {
    return [[TexlStrings.PowerFuncArg1, TexlStrings.PowerFuncArg2]]
  }
}

// Power(number:n|*[n], number:n|*[n]):*[n]
// Equivalent DAX function: Power
export class PowerTFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Power',
      undefined,
      TexlStrings.AboutPowerT,
      FunctionCategories.MathAndStat,
      DType.EmptyTable,
      0,
      2,
      2
    )
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('_T')
  }

  public getSignatures() {
    return [[TexlStrings.PowerTFuncArg1, TexlStrings.PowerTFuncArg2]]
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding | undefined
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);

    const result = super.checkInvocation(args, argTypes, errors)
    let fValid = result[0]
    let { returnType, nodeToCoercedTypeMap } = result[1]
    // let fValid = base.CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    const result2 = this.checkAllParamsAreTypeOrSingleColumnTable(
      DType.Number,
      args,
      argTypes,
      errors
    )
    returnType = result2[1].returnType
    nodeToCoercedTypeMap = result2[1].nodeToCoercedTypeMap

    fValid &&= result2[0]

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
