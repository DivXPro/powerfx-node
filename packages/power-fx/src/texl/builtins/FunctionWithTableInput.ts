import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter } from '../../localization/Strings'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { DPath } from '../../utils/DPath'

export abstract class FunctionWithTableInput extends BuiltinFunction {
  constructor(
    theNamespace: DPath | null,
    name: string,
    description: StringGetter,
    fc: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number,
    ...paramTypes: DType[]
  ) {
    let ns = theNamespace
    if (theNamespace == null) {
      ns = DPath.Root
    }
    super(ns, name, '', description, fc, returnType, maskLambdas, arityMin, arityMax, ...paramTypes)
  }

  // constructor(string name, TexlStrings.StringGetter description, FunctionCategories fc, DType returnType, BigInteger maskLambdas, int arityMin, int arityMax, params DType[] paramTypes)
  //             : this(DPath.Root, name, description, fc, returnType, maskLambdas, arityMin, arityMax, paramTypes)
  //   {
  //   }

  public supportCoercionForArg(argIndex: number): boolean {
    if (!super.supportCoercionForArg(argIndex)) {
      return false
    }

    // For first arg we don't support coercion.
    return argIndex != 0
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number): boolean {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 0
  }
}
