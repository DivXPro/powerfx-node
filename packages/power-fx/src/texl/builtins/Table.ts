import { extend } from 'dayjs'
import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { Dictionary } from '../../utils/Dictionary'

// Table(rec, rec, ...)
export class TableFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      'Table',
      undefined,
      TexlStrings.AboutTable,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      0,
      Number.MAX_SAFE_INTEGER
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [
      [TexlStrings.TableArg1],
      [TexlStrings.TableArg1, TexlStrings.TableArg1],
      [TexlStrings.TableArg1, TexlStrings.TableArg1, TexlStrings.TableArg1],
    ]
  }

  public getSignaturesAtArity(arity: number): Array<StringGetter[]> {
    if (arity > 2) {
      return this.getGenericSignatures(arity, TexlStrings.TableArg1)
    }

    return this.getSignaturesAtArity(arity)
  }

  // Typecheck an invocation of Table.
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

    const result = super.checkInvocation(args, argTypes, errors)
    let isValid = result[0]
    let nodeToCoercedTypeMap = result[1].nodeToCoercedTypeMap
    let returnType = result[1].returnType
    // Contracts.Assert(returnType.IsTable);

    // Ensure that all args (if any) are records with compatible schemas.
    let rowType = DType.EmptyRecord
    for (let i = 0; i < argTypes.length; i++) {
      let argType = argTypes[i]
      if (!argType.isRecord) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[i],
          TexlStrings.ErrNeedRecord
        )
        isValid = false
      } else if (!rowType.canUnionWith(argType)) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[i],
          TexlStrings.ErrIncompatibleRecord
        )
        isValid = false
      } else {
        let isUnionError = false
        // rowType = DType.Union(ref isUnionError, rowType, argType);
        const rst = DType.UnionWithError(isUnionError, rowType, argType)
        isUnionError = rst[1]
        rowType = rst[0]
        // Contracts.Assert(!isUnionError);
        // Contracts.Assert(rowType.IsRecord);
      }
    }

    // Contracts.Assert(rowType.IsRecord);
    returnType = rowType.toTable()

    return [isValid, { returnType, nodeToCoercedTypeMap: null }]
  }
}

export class TableFunction_UO extends BuiltinFunction {
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
      'Table',
      undefined,
      TexlStrings.AboutTable,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      1,
      1,
      DType.UntypedObject
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.TableArg1]]
  }

  // Typecheck an invocation of Table.
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    const result = super.checkInvocation(args, argTypes, errors)
    const isValid = result[0]
    let returnType = result[1].returnType
    let nodeToCoercedTypeMap = result[1].nodeToCoercedTypeMap
    const rowType = DType.EmptyRecord.add(
      new TypedName(DType.UntypedObject, BuiltinFunction.ColumnName_Value)
    )
    returnType = rowType.toTable()

    return [isValid, { returnType, nodeToCoercedTypeMap }]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return this.getUniqueTexlRuntimeNameInner('_UO')
  }
}
