import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { FunctionWithTableInput } from './FunctionWithTableInput'

export class FirstLastNFunction extends FunctionWithTableInput {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }
  constructor(isFirst: boolean) {
    super(
      undefined,
      isFirst ? 'FirstN' : 'LastN',
      isFirst ? TexlStrings.AboutFirstN : TexlStrings.AboutLastN,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      1,
      2,
      DType.EmptyTable,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.FirstLastNArg1], [TexlStrings.FirstLastNArg1, TexlStrings.FirstLastNArg2]]
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors)
    let fArgsValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    var arg0Type = argTypes[0]
    if (arg0Type.isTable) {
      returnType = arg0Type
    } else {
      returnType = arg0Type.isRecord ? arg0Type.toTable() : DType.Error
      fArgsValid = false
    }
    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }
}
