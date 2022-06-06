import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

export class ColorFadeTFunction extends BuiltinFunction {
  private static readonly TableKindString = DType.EmptyTable.getKindString()

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'ColorFade',
      undefined,
      TexlStrings.AboutColorFadeT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      2,
    )
  }
  public get isTrackedInTelemetry() {
    return true
  }

  public getSignatures() {
    return [[TexlStrings.ColorFadeTArg1, TexlStrings.ColorFadeTArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
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

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    let type0 = argTypes[0]
    let type1 = argTypes[1]

    let otherType = DType.Invalid
    let otherArg: TexlNode = null

    // At least one of the arguments has to be a table.
    if (type0.isTable) {
      // Ensure we have a one-column table of colors.
      let checkNumericColumnType = super.checkNumericColumnType(type0, args[0], errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]

      // Borrow the return type from the 1st arg.
      returnType = type0

      // Check arg1 below.
      otherArg = args[1]
      otherType = type1

      let checkType = this.CheckOtherType(otherType, otherArg, DType.Number, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkType[1]
      fValid = fValid && checkType[0]

      // Contracts.Assert(returnType.IsTable);
      // Contracts.Assert(!fValid || returnType.IsColumn);
    } else if (type1.isTable) {
      // Ensure we have a one-column table of numerics.
      let checkNumericColumnType = super.checkNumericColumnType(type1, args[1], errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]

      // Since the 1st arg is not a table, make a new table return type *[Result:c]
      returnType = DType.CreateTable(new TypedName(DType.Color, ColorFadeTFunction.OneColumnTableResultName))

      // Check arg0 below.
      otherArg = args[0]
      otherType = type0

      let CheckOtherType = this.CheckOtherType(otherType, otherArg, DType.Color, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = CheckOtherType[1]
      fValid = fValid && CheckOtherType[0]

      // Contracts.Assert(returnType.IsTable);
      // Contracts.Assert(!fValid || returnType.IsColumn);
    } else {
      // Contracts.Assert(returnType.IsTable);

      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrTypeError_Ex1_Ex2_Found,
        ColorFadeTFunction.TableKindString,
        DType.Color.getKindString(),
        type0.getKindString(),
      )
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrTypeError_Ex1_Ex2_Found,
        ColorFadeTFunction.TableKindString,
        DType.Number.getKindString(),
        type1.getKindString(),
      )

      // Both args are invalid. No need to continue.
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  private CheckOtherType(
    otherType: DType,
    otherArg: TexlNode,
    expectedType: DType,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>,
  ): [boolean, Dictionary<TexlNode, DType>] {
    // Contracts.Assert(otherType.IsValid);
    // Contracts.AssertValue(otherArg);
    // Contracts.Assert(expectedType == DType.Color || expectedType == DType.Number);
    // Contracts.AssertValue(errors);

    if (otherType.isTable) {
      // Ensure we have a one-column table of numerics/color values based on expected type.
      let checkNumericColumnType = super.checkNumericColumnType(otherType, otherArg, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      let expected = expectedType == DType.Number ? checkNumericColumnType[0] : checkNumericColumnType[0]
      return [expected, nodeToCoercedTypeMap]
    }

    if (expectedType.accepts(otherType)) {
      return [true, nodeToCoercedTypeMap]
    }

    if (otherType.coercesTo(expectedType)) {
      nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, otherArg, expectedType)
      return [true, nodeToCoercedTypeMap]
    }

    errors.ensureErrorWithSeverity(
      DocumentErrorSeverity.Severe,
      otherArg,
      TexlStrings.ErrTypeError_Ex1_Ex2_Found,
      ColorFadeTFunction.TableKindString,
      expectedType.getKindString(),
      otherType.getKindString(),
    )
    return [false, nodeToCoercedTypeMap]
  }
}
