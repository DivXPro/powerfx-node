import { DType, TypedName } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization/Strings'
import { TexlNode } from '../../syntax/nodes'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Replace(source:s, start:n, count:n, replacement:s)
export class ReplaceFunction extends BuiltinFunction {
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
      'Replace',
      undefined,
      TexlStrings.AboutReplace,
      FunctionCategories.Text,
      DType.String,
      0,
      4,
      4,
      DType.String,
      DType.Number,
      DType.Number,
      DType.String
    )
  }

  public getSignatures() {
    return [
      [
        TexlStrings.ReplaceFuncArg1,
        TexlStrings.StringFuncArg2,
        TexlStrings.StringFuncArg3,
        TexlStrings.ReplaceFuncArg4,
      ],
    ] //{  };
  }
}

// Replace(source:s|*[s], start:n|*[n], count:n|*[n], replacement:s|*[s])
export class ReplaceTFunction extends BuiltinFunction {
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
      'Replace',
      undefined,
      TexlStrings.AboutReplaceT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      4,
      4
    )
  }

  public getSignatures() {
    return [
      [
        TexlStrings.StringTFuncArg1,
        TexlStrings.StringFuncArg2,
        TexlStrings.StringFuncArg3,
        TexlStrings.ReplaceFuncArg4,
      ],
    ] // {  };
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T')
  }

  //       public override bool CheckInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary < TexlNode, DType > nodeToCoercedTypeMap)
  // {

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
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
    let type3 = argTypes[3]

    // Arg0 should be either a string or a column of strings.
    // Its type dictates the function return type.
    if (type0.isTable) {
      // Ensure we have a one-column table of strings
      let checkStringColumnType = super.checkStringColumnType(
        type0,
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
        new TypedName(DType.String, ReplaceTFunction.OneColumnTableResultName)
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
      // fValid &= CheckNumericColumnType(type1, args[1], errors, ref nodeToCoercedTypeMap);
      let CheckNumericColumnType = super.checkNumericColumnType(
        type1,
        args[1],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = CheckNumericColumnType[1]
      fValid = fValid && CheckNumericColumnType[0]
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

    // Arg2 should be either a number or a column of numbers.
    if (type2.isTable) {
      // fValid &= CheckNumericColumnType(type2, args[2], errors, ref nodeToCoercedTypeMap);
      let CheckNumericColumnType = super.checkNumericColumnType(
        type2,
        args[2],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = CheckNumericColumnType[1]
      fValid = fValid && CheckNumericColumnType[0]
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

    // Arg3 should be either a string or a column of strings.
    if (type3.isTable) {
      // fValid &= CheckStringColumnType(type3, args[3], errors, ref nodeToCoercedTypeMap);
      let checkStringColumnType = super.checkStringColumnType(
        type3,
        args[3],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = checkStringColumnType[1]
      fValid = fValid && checkStringColumnType[0]
    } else if (!DType.String.accepts(type3)) {
      if (type3.coercesTo(DType.String)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[3],
          DType.String
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[3],
          TexlStrings.ErrStringExpected
        )
      }
    }

    // At least one arg has to be a table.
    if (!type0.isTable && !type1.isTable && !type2.isTable && !type3.isTable) {
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
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[3],
        TexlStrings.ErrTypeError
      )
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
