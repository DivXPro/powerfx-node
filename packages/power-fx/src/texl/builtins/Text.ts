import { IErrorContainer } from '../../app/errorContainers'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlFunction } from '../../functions/TexlFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { StrLitNode, TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

export class TextFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Text',
      undefined,
      TexlStrings.AboutText,
      FunctionCategories.Table |
        FunctionCategories.Text |
        FunctionCategories.DateTime,
      DType.String,
      0,
      1,
      3,
      DType.Number,
      DType.String,
      DType.String
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.TextArg1, TexlStrings.TextArg2],
      [TexlStrings.TextArg1, TexlStrings.TextArg2, TexlStrings.TextArg3],
    ]
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer
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

    let isValid = true
    let returnType = DType.String
    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType>

    const arg0 = args[0]
    const arg0Type = argTypes[0]

    let isValidString = true
    const result = this.checkType(
      arg0,
      arg0Type,
      DType.Number,
      TexlFunction.DefaultErrorContainer
    )
    let isValidNumber = result[0]
    let matchedWithCoercion = result[1]
    let arg0CoercedType = matchedWithCoercion ? DType.Number : DType.Invalid

    if (!isValidNumber || matchedWithCoercion) {
      if (DType.DateTime.accepts(arg0Type)) {
        // No coercion needed for datetimes here.
        arg0CoercedType = DType.Invalid
      } else {
        const typeResult = this.checkType(
          arg0,
          arg0Type,
          DType.String,
          TexlFunction.DefaultErrorContainer
        )
        isValidString = typeResult[0]
        matchedWithCoercion = typeResult[1]

        if (isValidString) {
          if (matchedWithCoercion) {
            // If both the matches were with coercion, we pick string over number.
            // For instance Text(true) returns true in the case of EXCEL. If we picked
            // number coercion, then we would return 1 and it will not match EXCEL behavior.
            arg0CoercedType = DType.String
          } else {
            arg0CoercedType = DType.Invalid
          }
        }
      }
    }

    if (!isValidNumber && !isValidString) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrNumberOrStringExpected
      )
      isValid = false
    }

    if (args.length < 2) {
      if (isValid && arg0CoercedType.isValid) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          arg0,
          arg0CoercedType
        )
        return [true, { returnType, nodeToCoercedTypeMap }]
      }

      return [isValid, { returnType, nodeToCoercedTypeMap }]
    }

    let formatNode: StrLitNode
    if (!DType.String.accepts(argTypes[1])) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrStringExpected
      )
      isValid = false
    } else if ((formatNode = args[1].asStrLit()) != null) {
      // Verify statically that the format string doesn't contain BOTH numeric and date/time
      // format specifiers. If it does, that's an error accd to Excel and our spec.
      let fmt = formatNode.value

      // But firstly skip any locale-prefix
      if (fmt.startsWith('[$-')) {
        const end = fmt.indexOf(']', 3)
        if (end > 0) {
          fmt = fmt.substr(end + 1)
        }
      }
      const hasDateTimeFmt = /m|d|y|h|H|s|a|A|p|P/g.test(fmt)
      const hasNumericFmt = /0|#/g.test(fmt)
      // let hasDateTimeFmt = fmt.IndexOfAny(new char[] { 'm', 'd', 'y', 'h', 'H', 's', 'a', 'A', 'p', 'P' }) >= 0;
      // let hasNumericFmt = fmt.IndexOfAny(new char[] { '0', '#' }) >= 0;
      if (hasDateTimeFmt && hasNumericFmt) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Moderate,
          formatNode,
          TexlStrings.ErrIncorrectFormat_Func,
          this.name
        )
        isValid = false
      }
    }

    if (args.length > 2) {
      const argType = argTypes[2]
      if (!DType.String.accepts(argType)) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[2],
          TexlStrings.ErrStringExpected
        )
        isValid = false
      }
    }

    if (isValid) {
      if (arg0CoercedType.isValid) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          arg0,
          arg0CoercedType
        )
        return [true, { returnType, nodeToCoercedTypeMap }]
      }
    } else {
      nodeToCoercedTypeMap = null
    }

    return [isValid, { returnType, nodeToCoercedTypeMap }]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 1 || argumentIndex == 2
  }
}

// Text(arg:O)
export class TextFunction_UO extends BuiltinFunction {
  public get supportsParamCoercion() {
    return false
  }

  public get requiresErrorContext() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  constructor() {
    super(
      undefined,
      'Text',
      undefined,
      TexlStrings.AboutText,
      FunctionCategories.Text,
      DType.String,
      0,
      1,
      1,
      DType.UntypedObject
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.TextArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return this.getUniqueTexlRuntimeNameInner('_UO')
  }
}
