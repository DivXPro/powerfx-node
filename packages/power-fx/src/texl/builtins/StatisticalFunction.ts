// Abstract base class for all statistical functions with similar signatures that take

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlFunction } from '../../functions/TexlFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// scalar arguments.
export abstract class StatisticalFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor(
    name: string,
    description: StringGetter,
    fc: FunctionCategories, // : base(name, description, fc, DType.Number, 0, 1, int.MaxValue, DType.Number)
  ) {
    super(undefined, name, undefined, description, fc, DType.Number, 0, 1, Number.MAX_SAFE_INTEGER, DType.Number)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [
      [TexlStrings.StatisticalArg],
      [TexlStrings.StatisticalArg, TexlStrings.StatisticalArg],
      [TexlStrings.StatisticalArg, TexlStrings.StatisticalArg, TexlStrings.StatisticalArg],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return this.getGenericSignatures(arity, TexlStrings.StatisticalArg, TexlStrings.StatisticalArg)
    }
    return super.getSignaturesAtArity(arity)
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    if (binding == null) {
      const result = super.checkInvocation(args, argTypes, errors)
      let fValid = result[0]
      let { returnType, nodeToCoercedTypeMap } = result[1]

      // Contracts.Assert(returnType == DType.Number);

      // Ensure that all the arguments are numeric/coercible to numeric.
      for (let i = 0; i < argTypes.length; i++) {
        const checkTypeResult = this.checkType(args[i], argTypes[i], DType.Number, TexlFunction.DefaultErrorContainer)
        const matchedWithCoercion = checkTypeResult[1]
        if (checkTypeResult[0]) {
          if (matchedWithCoercion) {
            nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, args[i], DType.Number, true)
          }
        } else {
          errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[i], TexlStrings.ErrNumberExpected)
          fValid = false
        }
      }

      if (!fValid) {
        nodeToCoercedTypeMap = null
      }

      return [fValid, { returnType, nodeToCoercedTypeMap }]
    }
    return super.checkInvocation(args, argTypes, errors, binding)
  }
}
