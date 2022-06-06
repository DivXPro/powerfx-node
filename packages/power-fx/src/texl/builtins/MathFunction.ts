import { IErrorContainer } from '../../app/errorContainers/IErrorContainer'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization/Strings'
import { TexlNode } from '../../syntax/nodes/TexlNode'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

export abstract class MathOneArgFunction extends BuiltinFunction {
  public get supportsParamCoercion(): boolean {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor(name: string, description: StringGetter, fc: FunctionCategories) {
    super(undefined, name, undefined, description, fc, DType.Number, 0, 1, 1, DType.Number)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.MathFuncArg1]]
  }
}

export abstract class MathOneArgTableFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor(name: string, description: StringGetter, fc: FunctionCategories) {
    super(undefined, name, undefined, description, fc, DType.EmptyTable, 0, 1, 1, DType.EmptyTable)
  }

  public getSignatures(): Array<StringGetter[]> {
    let arr = []
    arr.push([TexlStrings.MathTFuncArg1])
    return arr
  }

  public getUniqueTexlRuntimeName(isPrefetching: boolean = false): string {
    return super.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 1);
    // Contracts.AssertValue(errors);

    // , out DType returnType, out Dictionary < TexlNode, DType > nodeToCoercedTypeMap

    var res = super.checkInvocation(args, argTypes, errors)
    let fValid: boolean = res[0]
    let returnType = res[1].returnType
    let nodeToCoercedTypeMap = res[1].nodeToCoercedTypeMap
    // Contracts.Assert(returnType.IsTable);

    var arg = args[0]
    var argType = argTypes[0]
    let checkNumeric: [boolean, Dictionary<TexlNode, DType>] = super.checkNumericColumnType(
      argType,
      arg,
      errors,
      nodeToCoercedTypeMap,
    )
    //  ref nodeToCoercedTypeMap
    fValid = fValid && checkNumeric[0]

    if (nodeToCoercedTypeMap?.size > 0 ?? false) {
      // Now set the coerced type to a table with numeric column type with the same name as in the argument.
      returnType = nodeToCoercedTypeMap.get(arg)
    } else {
      returnType = argType
    }

    if (!fValid) {
      nodeToCoercedTypeMap = null
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
