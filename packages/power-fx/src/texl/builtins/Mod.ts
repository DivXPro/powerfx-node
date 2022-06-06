import { DType, TypedName } from '../../types'
import { CollectionUtils, Dictionary } from '../../utils'
import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors/DocumentErrorSeverity'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax/nodes'
import { FunctionCategories } from '../../types/FunctionCategories'

export class ModFunction extends BuiltinFunction {
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
    super(
      undefined,
      'Mod',
      undefined,
      TexlStrings.AboutMod,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      2,
      2,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.ModFuncArg1, TexlStrings.ModFuncArg2]]
  }
}

// Mod(number:n|*[n], divisor:n|*[n])
export class ModTFunction extends BuiltinFunction {
  // public override bool SupportsParamCoercion => true;
  // public override bool IsSelfContained => true;
  // public override bool RequiresErrorContext => true;

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
    super(undefined, 'Mod', undefined, TexlStrings.AboutModT, FunctionCategories.Table, DType.EmptyTable, 0, 2, 2)
  }

  public getSignatures() {
    return [[TexlStrings.ModTFuncArg1, TexlStrings.ModTFuncArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T')
  }

  //   public override bool CheckInvocation(TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
  // {
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
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    // bool fValid = super.checkInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    let type0: DType = argTypes[0]
    let type1: DType = argTypes[1]

    let arg0: TexlNode = args[0]
    let arg1: TexlNode = args[1]

    // Arg0 should be either a number or a column of number (coercion is ok).
    let matchedWithCoercion: boolean

    if (type0.isTable) {
      // Ensure we have a one-column table of numbers.
      // fValid &= CheckNumericColumnType(type0, arg0, errors, ref nodeToCoercedTypeMap);
      let checkNumericColumnType = super.checkNumericColumnType(type0, arg0, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]
    } else if (super.checkType(arg0, type0, DType.Number, ModTFunction.DefaultErrorContainer)[0]) {
      matchedWithCoercion = super.checkType(arg0, type0, DType.Number, ModTFunction.DefaultErrorContainer)[1]
      if (matchedWithCoercion)
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, arg0, DType.Number)
    } else {
      fValid = false
      errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, arg0, TexlStrings.ErrNumberExpected)
    }

    // Arg1 should be either a number or a column of number (coercion is ok).
    if (type1.isTable) {
      let checkNumericColumnType = super.checkNumericColumnType(type1, arg1, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]

      // fValid &= CheckNumericColumnType(type1, arg1, errors, ref nodeToCoercedTypeMap);
    } else if (super.checkType(arg1, type1, DType.Number, ModTFunction.DefaultErrorContainer)[0]) {
      matchedWithCoercion = super.checkType(arg1, type1, DType.Number, ModTFunction.DefaultErrorContainer)[1]
      if (matchedWithCoercion)
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, arg1, DType.Number)
    } else {
      fValid = false
      errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, arg1, TexlStrings.ErrNumberExpected)
    }

    returnType = DType.CreateTable(new TypedName(DType.Number, ModTFunction.OneColumnTableResultName))

    // At least one arg has to be a table.
    if (!(type0.isTable || type1.isTable)) fValid = false

    if (!fValid) nodeToCoercedTypeMap = null

    // return fValid;
    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
