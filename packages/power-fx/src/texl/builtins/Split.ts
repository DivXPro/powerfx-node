import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType, TypedName } from '../../types'
import { Dictionary } from '../../utils/Dictionary'
import { StringTwoArgFunction } from './StringTwoArgFunction'

// Split(text:s, separator:s)
export class SplitFunction extends StringTwoArgFunction {
  constructor() {
    super('Split', TexlStrings.AboutSplit, DType.EmptyTable)
  }

  public getSignatures() {
    return [[TexlStrings.SplitArg1, TexlStrings.SplitArg2]]
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
    // Contracts.Assert(args.Length == 2);
    // Contracts.AssertValue(errors);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    returnType = DType.CreateTable(new TypedName(DType.String, BuiltinFunction.OneColumnTableResultName))
    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
