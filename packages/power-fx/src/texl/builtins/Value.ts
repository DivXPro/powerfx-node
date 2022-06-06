// Value(arg:s|n [,language:s])

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Corresponding Excel and DAX function: Value
export class ValueFunction extends BuiltinFunction {
  public static ValueInvariantFunctionName = 'Value'

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
      ValueFunction.ValueInvariantFunctionName,
      undefined,
      TexlStrings.AboutValue,
      FunctionCategories.Text,
      DType.Number,
      0,
      1,
      2,
      DType.String,
      DType.String,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.ValueArg1], [TexlStrings.ValueArg1, TexlStrings.ValueArg2]]
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
    // Contracts.AssertAllValid(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType>

    let isValid = true
    let argType = argTypes[0]
    if (!DType.Number.accepts(argType) && !DType.String.accepts(argType)) {
      if (argType.coercesTo(DType.DateTime) && !argType.isControl) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, args[0], DType.DateTime)
      } else {
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[0], TexlStrings.ErrNumberOrStringExpected)
        isValid = false
      }
    }

    if (args.length > 1) {
      argType = argTypes[1]
      if (!DType.String.accepts(argType)) {
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[1], TexlStrings.ErrStringExpected)
        isValid = false
      }
    }

    const returnType = DType.Number
    return [isValid, { returnType, nodeToCoercedTypeMap }]
  }

  public hasSuggestionsForParam(index: number) {
    return index === 1
  }
}

// Value(arg:O)
export class ValueFunction_UO extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      ValueFunction.ValueInvariantFunctionName,
      undefined,
      TexlStrings.AboutValue,
      FunctionCategories.Text,
      DType.Number,
      0,
      1,
      1,
      DType.UntypedObject,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.ValueArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return this.getUniqueTexlRuntimeNameInner('_UO')
  }
}
