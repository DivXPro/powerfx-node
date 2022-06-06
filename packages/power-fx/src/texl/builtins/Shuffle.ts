import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

// Shuffle(source:*)
export class ShuffleFunction extends BuiltinFunction {
  // Multiple invocations with the same args may result in different results.

  public get isSelfContained() {
    return true
  }
  public get isStateless() {
    return false
  }
  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      'Shuffle',
      undefined,
      TexlStrings.AboutShuffle,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      1,
      1,
      DType.EmptyTable,
    )
  }

  public getSignatures() {
    return [[TexlStrings.ShuffleArg1]]
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

    // var isValid = base.CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let isValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    var fError = false
    let toTableWithError = argTypes[0].toTableWithError()
    returnType = toTableWithError[0]
    fError = toTableWithError[1]

    let flag = isValid && !fError
    return [flag, { returnType, nodeToCoercedTypeMap }]
  }
}
