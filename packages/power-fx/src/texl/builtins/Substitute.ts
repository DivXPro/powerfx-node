import { DType, TypedName } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding/Binder'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax/nodes'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Substitute(source:s, match:s, replacement:s, [instanceCount:n])
export class SubstituteFunction extends BuiltinFunction {
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
      'Substitute',
      undefined,
      TexlStrings.AboutSubstitute,
      FunctionCategories.Text,
      DType.String,
      0,
      3,
      4,
      DType.String,
      DType.String,
      DType.String,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [
        TexlStrings.SubstituteFuncArg1,
        TexlStrings.SubstituteFuncArg2,
        TexlStrings.SubstituteFuncArg3,
      ],
      [
        TexlStrings.SubstituteFuncArg1,
        TexlStrings.SubstituteFuncArg2,
        TexlStrings.SubstituteFuncArg3,
        TexlStrings.SubstituteFuncArg4,
      ],
    ]
  }
}

// Substitute(source:s|*[s], match:s|*[s], replacement:s|*[s], [instanceCount:n|*[n]])
export class SubstituteTFunction extends BuiltinFunction {
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
      'Substitute',
      undefined,
      TexlStrings.AboutSubstituteT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      3,
      4
    )
  }

  public getSignatures() {
    return [
      [
        TexlStrings.SubstituteTFuncArg1,
        TexlStrings.SubstituteFuncArg2,
        TexlStrings.SubstituteFuncArg3,
      ],
      [
        TexlStrings.SubstituteTFuncArg1,
        TexlStrings.SubstituteFuncArg2,
        TexlStrings.SubstituteFuncArg3,
        TexlStrings.SubstituteFuncArg4,
      ],
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

    // let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap
    let type0 = argTypes[0]
    let type1 = argTypes[1]
    let type2 = argTypes[2]

    // Arg0 should be either a string or a column of strings.
    // Its type dictates the function return type.
    if (type0.isTable) {
      // Ensure we have a one-column table of strings
      let checkStringColumnType = super.checkStringColumnType(
        argTypes[0],
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkStringColumnType[1]
      fValid = fValid && checkStringColumnType[0]

      // fValid &= CheckStringColumnType(type0, args[0], errors, ref nodeToCoercedTypeMap);

      // Borrow the return type from the 1st arg
      returnType = type0
    } else {
      returnType = DType.CreateTable(
        new TypedName(DType.String, BuiltinFunction.OneColumnTableResultName)
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

    // Arg1 should be either a string or a column of strings.
    if (type1.isTable) {
      let checkStringColumnType = super.checkStringColumnType(
        type1,
        args[1],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkStringColumnType[1]
      fValid = fValid && checkStringColumnType[0]
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

    // Arg2 should be either a string or a column of strings.
    if (type2.isTable) {
      let checkStringColumnType = super.checkStringColumnType(
        type2,
        args[2],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkStringColumnType[1]
      fValid = fValid && checkStringColumnType[0]
      // fValid &= CheckStringColumnType(type2, args[2], errors, ref nodeToCoercedTypeMap);
    } else if (!DType.String.accepts(type2)) {
      if (type2.coercesTo(DType.String)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[2],
          DType.String
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[2],
          TexlStrings.ErrStringExpected
        )
      }
    }

    let hasCount = args.length == 4
    if (hasCount) {
      let type3 = argTypes[3]

      // Arg3 should be either a number or a column of numbers.
      if (type3.isTable) {
        let CheckNumericColumnType = super.checkNumericColumnType(
          type3,
          args[3],
          errors,
          nodeToCoercedTypeMap
        )
        nodeToCoercedTypeMap = CheckNumericColumnType[1]
        fValid = fValid && CheckNumericColumnType[0]
        // fValid &= CheckNumericColumnType(type3, args[3], errors, ref nodeToCoercedTypeMap);
      } else if (!DType.Number.accepts(type3)) {
        if (type3.coercesTo(DType.Number)) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
            nodeToCoercedTypeMap,
            args[3],
            DType.Number
          )
        } else {
          fValid = false
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            args[3],
            TexlStrings.ErrNumberExpected
          )
        }
      }
    }

    // At least one arg has to be a table.
    if (
      !(type0.isTable || type1.isTable || type2.isTable) &&
      (!hasCount || !argTypes[3].isTable)
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
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[2],
        TexlStrings.ErrTypeError
      )
      if (hasCount) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[3],
          TexlStrings.ErrTypeError
        )
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
