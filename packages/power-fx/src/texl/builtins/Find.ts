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

export class FindFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Find',
      undefined,
      TexlStrings.AboutFind,
      FunctionCategories.Text,
      DType.Number,
      0,
      2,
      3,
      DType.String,
      DType.String,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.FindArg1, TexlStrings.FindArg2],
      [TexlStrings.FindArg1, TexlStrings.FindArg2, TexlStrings.FindArg3],
    ]
  }
}

// Find(find_text:s|*[s], within_text:s|*[s], [start_index:n|*[n]])
export class FindTFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Find',
      undefined,
      TexlStrings.AboutFindT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      3
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.FindTArg1, TexlStrings.FindTArg2],
      [TexlStrings.FindTArg1, TexlStrings.FindTArg2, TexlStrings.FindTArg3],
    ]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T')
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

    // let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    let type0 = argTypes[0]
    let type1 = argTypes[1]

    // Arg0 should be either a string or a column of strings.
    if (type0.isTable) {
      // Ensure we have a one-column table of strings.
      let checkNumericColumnType = super.checkStringColumnType(
        type0,
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]
      // fValid &= CheckStringColumnType(type0, args[0], errors, ref nodeToCoercedTypeMap);
    } else if (!DType.String.accepts(type0)) {
      if (type0.coercesTo(DType.String)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[0],
          DType.String
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[0],
          TexlStrings.ErrStringExpected
        )
      }
    }

    // Arg1 should be either a string or a column of strings.
    if (type1.isTable) {
      let checkNumericColumnType = super.checkStringColumnType(
        type1,
        args[1],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]

      // fValid &= CheckStringColumnType(type1, args[1], errors, ref nodeToCoercedTypeMap);
    } else if (!DType.String.accepts(type1)) {
      if (type1.coercesTo(DType.String)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[1],
          DType.String
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[1],
          TexlStrings.ErrStringExpected
        )
      }
    }

    returnType = DType.CreateTable(
      new TypedName(DType.Number, FindTFunction.OneColumnTableResultName)
    )

    let hasStartIndex = argTypes.length == 3

    if (hasStartIndex) {
      let type2 = argTypes[2]

      // Arg2 should be either a number or a column of numbers.
      if (argTypes[2].isTable) {
        let checkNumericColumnType = super.checkNumericColumnType(
          type2,
          args[2],
          errors,
          nodeToCoercedTypeMap
        )
        nodeToCoercedTypeMap = checkNumericColumnType[1]
        fValid = fValid && checkNumericColumnType[0]

        // fValid &= CheckNumericColumnType(type2, args[2], errors, ref nodeToCoercedTypeMap);
      } else if (!DType.Number.accepts(type2)) {
        if (type2.coercesTo(DType.Number)) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
            nodeToCoercedTypeMap,
            args[2],
            DType.Number
          )
        } else {
          fValid = false
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            args[2],
            TexlStrings.ErrNumberExpected
          )
        }
      }
    }

    // At least one arg has to be a table.
    if (
      !(type0.isTable || type1.isTable) &&
      (!hasStartIndex || !argTypes[2].isTable)
    ) {
      fValid = false
    }
    return [fValid, { returnType, nodeToCoercedTypeMap }]

    // return fValid;
  }
}
