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

export class MidFunction extends BuiltinFunction {
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
      'Mid',
      undefined,
      TexlStrings.AboutMid,
      FunctionCategories.Text,
      DType.String,
      0,
      2,
      3,
      DType.String,
      DType.Number,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.StringFuncArg1, TexlStrings.StringFuncArg2],
      [
        TexlStrings.StringFuncArg1,
        TexlStrings.StringFuncArg2,
        TexlStrings.StringFuncArg3,
      ],
    ]
  }
}

// Mid(source:s|*[s], start:n|*[n], [count:n|*[n]])
export class MidTFunction extends BuiltinFunction {
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
      'Mid',
      undefined,
      TexlStrings.AboutMidT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      3
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.StringTFuncArg1, TexlStrings.StringFuncArg2],
      [
        TexlStrings.StringTFuncArg1,
        TexlStrings.StringFuncArg2,
        TexlStrings.StringFuncArg3,
      ],
    ]
    // return [[]]{ TexlStrings.StringTFuncArg1, TexlStrings.StringFuncArg2 };
    // return [[]]{ TexlStrings.StringTFuncArg1, TexlStrings.StringFuncArg2, TexlStrings.StringFuncArg3 };
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
    // Contracts.Assert(args.length == argTypes.length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.length && args.length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    let type0 = argTypes[0]
    let type1 = argTypes[1]

    // Arg0 should be either a string or a column of strings.
    // Its type dictates the function return type.
    if (type0.isTable) {
      let CheckStringColumnType = super.checkStringColumnType(
        argTypes[0],
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = CheckStringColumnType[1]
      fValid = fValid && CheckStringColumnType[0]

      // Ensure we have a one-column table of strings
      //  fValid= fValid && CheckStringColumnType(type0, args[0], errors, ref nodeToCoercedTypeMap);

      // Borrow the return type from the 1st arg
      returnType = type0
    } else {
      returnType = DType.CreateTable(
        new TypedName(DType.String, MidTFunction.OneColumnTableResultName)
      )
      if (!DType.String.accepts(type0)) {
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
    }

    // Arg1 should be either a number or a column of numbers.
    if (type1.isTable) {
      let checkNumericColumnType = super.checkNumericColumnType(
        argTypes[0],
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkNumericColumnType[1]
      fValid = fValid && checkNumericColumnType[0]

      // fValid &= CheckNumericColumnType(type1, args[1], errors, ref nodeToCoercedTypeMap);
    } else if (!DType.Number.accepts(type1)) {
      if (type1.coercesTo(DType.Number)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[1],
          DType.Number
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[1],
          TexlStrings.ErrNumberExpected
        )
      }
    }

    // Arg2 should be either a number or a column of numbers, if it exists.
    if (argTypes.length > 2) {
      let type2 = argTypes[2]
      if (type2.isTable) {
        let checkNumericColumnType = super.checkNumericColumnType(
          argTypes[0],
          args[0],
          errors,
          nodeToCoercedTypeMap
        )
        nodeToCoercedTypeMap = checkNumericColumnType[1]
        fValid = fValid && checkNumericColumnType[0]
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
      !type0.isTable &&
      !type1.isTable &&
      (argTypes.length <= 2 || !argTypes[2].isTable)
    ) {
      fValid = false
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrTypeError
      )
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrTypeError
      )
      if (args.length > 2) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[2],
          TexlStrings.ErrTypeError
        )
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
