import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { BuiltinFunction } from '../../functions/BuiltinFunction';
import { TexlStrings } from '../../localization';
import { TexlNode } from '../../syntax';
import { DKind } from '../../types/DKind';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { Dictionary } from '../../utils/Dictionary';

export class IsTodayFunction extends BuiltinFunction {
  // Multiple invocations may result in different return values.

  public get isStateless() {
    return false;
  }

  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'IsToday',
      undefined,
      TexlStrings.AboutIsToday,
      FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
      DType.DateTime
    );
  }

  public getSignatures() {
    // return EnumerableUtils.Yield(new [] { TexlStrings.IsTodayFuncArg1 });
    return [[TexlStrings.IsTodayFuncArg1]];
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors);
    let fValid = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    let type0 = argTypes[0];

    // Arg0 should not be a Time
    if (type0.kind == DKind.Time) {
      fValid = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrDateExpected
      );
    }

    returnType = this.returnType;

    return [fValid, { returnType, nodeToCoercedTypeMap }];
  }
}
