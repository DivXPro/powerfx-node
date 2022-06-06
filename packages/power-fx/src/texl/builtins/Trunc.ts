// Trunc(number:n, digits:n)

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Truncate by rounding toward zero.
export class TruncFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Trunc',
      undefined,
      TexlStrings.AboutTrunc,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      1,
      2,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.TruncArg1], [TexlStrings.TruncArg1, TexlStrings.TruncArg2]]
  }
}

export class TruncTableFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(undefined, 'Trunc', undefined, TexlStrings.AboutTruncT, FunctionCategories.Table, DType.EmptyTable, 0, 1, 2)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.TruncTArg1], [TexlStrings.TruncTArg1, TexlStrings.TruncTArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return super.getUniqueTexlRuntimeNameInner('_T')
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
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    const checkResult = super.checkInvocation(args, argTypes, errors)
    let fValid = checkResult[0]
    let { returnType, nodeToCoercedTypeMap } = checkResult[1]
    if (argTypes.length == 2) {
      var type0 = argTypes[0]
      var type1 = argTypes[1]

      var otherType = DType.Invalid
      let otherArg: TexlNode = null

      // At least one of the arguments has to be a table.
      if (type0.isTable) {
        // Ensure we have a one-column table of numerics
        const checkNumResult = this.checkNumericColumnType(type0, args[0], errors, nodeToCoercedTypeMap)
        nodeToCoercedTypeMap = checkNumResult[1]
        fValid &&= checkNumResult[0]

        // Borrow the return type from the 1st arg
        returnType = type0

        // Check arg1 below.
        otherArg = args[1]
        otherType = type1
      } else if (type1.isTable) {
        // Ensure we have a one-column table of numerics
        const checkNumResult = this.checkNumericColumnType(type1, args[1], errors, nodeToCoercedTypeMap)
        nodeToCoercedTypeMap = checkNumResult[1]
        fValid &&= checkNumResult[0]

        // Since the 1st arg is not a table, make a new table return type *[Result:n]
        returnType = DType.CreateTable(new TypedName(DType.Number, BuiltinFunction.OneColumnTableResultName))

        // Check arg0 below.
        otherArg = args[0]
        otherType = type0
      } else {
        // Contracts.Assert(returnType.IsTable);
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[0], TexlStrings.ErrTypeError)
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[1], TexlStrings.ErrTypeError)

        // Both args are invalid. No need to continue.
        return [false, { returnType, nodeToCoercedTypeMap }]
      }

      // Contracts.Assert(otherType.IsValid);
      // Contracts.AssertValue(otherArg);
      // Contracts.Assert(returnType.IsTable);
      // Contracts.Assert(!fValid || returnType.IsColumn);

      if (otherType.isTable) {
        // Ensure we have a one-column table of numerics
        const checkNumResult = this.checkNumericColumnType(otherType, otherArg, errors, nodeToCoercedTypeMap)
        nodeToCoercedTypeMap = checkNumResult[1]
        fValid &&= checkNumResult[0]
      } else if (!DType.Number.accepts(otherType)) {
        if (otherType.coercesTo(DType.Number)) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, otherArg, DType.Number)
        } else {
          fValid = false
          errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, otherArg, TexlStrings.ErrTypeError)
        }
      }
    } else {
      var type0 = argTypes[0]

      if (type0.isTable) {
        // Ensure we have a one-column table of numerics
        const checkNumResult = this.checkNumericColumnType(type0, args[0], errors, nodeToCoercedTypeMap)
        nodeToCoercedTypeMap = checkNumResult[1]
        fValid &&= checkNumResult[0]

        // Borrow the return type from the 1st arg
        returnType = type0
      } else {
        // Contracts.Assert(returnType.IsTable);
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[0], TexlStrings.ErrTypeError)
        return [false, { returnType, nodeToCoercedTypeMap }]
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
