import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import {
  DelegationCapability,
  OperationCapabilityMetadata,
} from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { Dictionary } from '../../utils/Dictionary'
import { StringOneArgFunction } from './StringOneArgFunction'

export class LenFunction extends StringOneArgFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super('Len', TexlStrings.AboutLen, FunctionCategories.Text, DType.Number)
  }

  public getSignatures() {
    return [[TexlStrings.LenArg1]]
  }

  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(DelegationCapability.Length)
  }

  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ) {
    return super.isRowScopedServerDelegatable(callNode, binding, metadata)
  }
}

// Len(arg:*[s])
export class LenTFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Len',
      undefined,
      TexlStrings.AboutLenT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      1,
      1,
      DType.EmptyTable
    )
  }

  public getSignatures() {
    return [[TexlStrings.LenTArg1]]
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

    let baseResult = super.checkInvocation(args, argTypes, errors)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    // Typecheck the input table
    let checkNumericColumnType = super.checkStringColumnType(
      argTypes[0],
      args[0],
      errors,
      nodeToCoercedTypeMap
    )
    nodeToCoercedTypeMap = checkNumericColumnType[1]
    fValid = fValid && checkNumericColumnType[0]

    // fValid &= CheckStringColumnType(argTypes[0], args[0], errors, ref nodeToCoercedTypeMap);

    returnType = DType.CreateTable(
      new TypedName(DType.Number, LenTFunction.OneColumnTableResultName)
    )

    return [fValid, { returnType, nodeToCoercedTypeMap }]

    // Synthesize a new return type
    // returnType = DType.CreateTable(new TypedName(DType.Number, OneColumnTableResultName));

    // return fValid;
  }
}
