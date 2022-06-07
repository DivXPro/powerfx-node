import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

export class IsErrorFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'IsError',
      undefined,
      TexlStrings.AboutIsError,
      FunctionCategories.Logical,
      DType.Boolean,
      0,
      1,
      1
    )
  }

  public getSignatures() {
    return [[TexlStrings.IsErrorArg]]
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 1);
    // Contracts.AssertValue(errors);

    let nodeToCoercedTypeMap = null

    // let type = super.returnType;

    // Contracts.Assert(ReturnType == DType.Boolean);

    let returnType = this.returnType
    return [true, { returnType, nodeToCoercedTypeMap }]
  }
}
