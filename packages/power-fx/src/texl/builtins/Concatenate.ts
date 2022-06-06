// Concatenate(source1:s, source2:s, ...)
// Corresponding DAX function: Concatenate

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// This only performs string/string concatenation.
export abstract class ConcatenateFunctionBase extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(name: string) {
    super(
      undefined,
      name,
      undefined,
      TexlStrings.AboutConcatenate,
      FunctionCategories.Text,
      DType.String,
      0,
      1,
      Number.MAX_SAFE_INTEGER,
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.ConcatenateArg1],
      [TexlStrings.ConcatenateArg1, TexlStrings.ConcatenateArg1],
      [TexlStrings.ConcatenateArg1, TexlStrings.ConcatenateArg1, TexlStrings.ConcatenateArg1],
      [
        TexlStrings.ConcatenateArg1,
        TexlStrings.ConcatenateArg1,
        TexlStrings.ConcatenateArg1,
        TexlStrings.ConcatenateArg1,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return this.getGenericSignatures(arity, TexlStrings.ConcatenateArg1, TexlStrings.ConcatenateArg1)
    }

    return super.getSignaturesAtArity(arity)
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length >= 1);
    // Contracts.AssertValue(errors);

    const count = args.length
    let fArgsValid = true
    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType>

    for (let i = 0; i < count; i++) {
      const typeResult = this.checkTypeWithCoerce(args[i], argTypes[i], DType.String, errors, true)
      const coercionType = typeResult[1]
      const typeChecks = typeResult[0]
      if (typeChecks && coercionType != null) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, args[i], coercionType)
      }

      fArgsValid &&= typeChecks
    }

    if (!fArgsValid) {
      nodeToCoercedTypeMap = null
    }

    const returnType = this.returnType

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }
}

// Concatenate(source1:s|*[s], source2:s|*[s], ...)
// Corresponding DAX function: Concatenate
// Note, this performs string/table, table/table, table/string concatenation, but not string/string
// Tables will be expanded to be the same size as the largest table. For each scalar, a new empty table
// will be created, and the scalar value will be used to fill the table to be the same size as the largest table
export class ConcatenateTableFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Concatenate',
      undefined,
      TexlStrings.AboutConcatenateT,
      FunctionCategories.Table | FunctionCategories.Text,
      DType.EmptyTable,
      0,
      1,
      Number.MAX_SAFE_INTEGER,
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.ConcatenateTArg1, TexlStrings.ConcatenateTArg1],
      [TexlStrings.ConcatenateTArg1, TexlStrings.ConcatenateTArg1, TexlStrings.ConcatenateTArg1],
      [
        TexlStrings.ConcatenateTArg1,
        TexlStrings.ConcatenateTArg1,
        TexlStrings.ConcatenateTArg1,
        TexlStrings.ConcatenateTArg1,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return this.getGenericSignatures(arity, TexlStrings.ConcatenateArg1, TexlStrings.ConcatenateArg1)
    }

    return super.getSignaturesAtArity(arity)
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length >= 1);
    // Contracts.AssertValue(errors);

    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType>

    const count = args.length
    let hasTableArg = false
    let fArgsValid = true

    // Type check the args
    for (let i = 0; i < count; i++) {
      const rst = this.checkParamIsTypeOrSingleColumnTable(
        DType.String,
        args[i],
        argTypes[i],
        errors,
        nodeToCoercedTypeMap,
      )
      nodeToCoercedTypeMap = rst[1].nodeToCoercedTypeMap
      fArgsValid &&= rst[0]
      // fArgsValid &= CheckParamIsTypeOrSingleColumnTable(DType.String, args[i], argTypes[i], errors, out var isTable, ref nodeToCoercedTypeMap);
      hasTableArg ||= rst[1].isTable
    }

    fArgsValid &&= hasTableArg

    if (!fArgsValid) {
      nodeToCoercedTypeMap = null
    }

    const returnType = DType.CreateTable(new TypedName(DType.String, BuiltinFunction.OneColumnTableResultName))

    return [hasTableArg && fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }
}

export class ConcatenateFunction extends ConcatenateFunctionBase {
  constructor() {
    super('Concatenate')
  }
}
