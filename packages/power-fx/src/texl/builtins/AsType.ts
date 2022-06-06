import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding/Binder'
import { IsIExternalCdsDataSource } from '../../entities/external/IExternalCdsDataSource'
import { IsIExternalDataSource } from '../../entities/external/IExternalDataSource'
import { IsIExternalTabularDataSource } from '../../entities/external/IExternalTabularDataSource'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { OperationCapabilityMetadata } from '../../functions/delegation/OperationCapabilityMetadata'
import { DelegationCapability } from '../../functions/delegation/DelegationCapability'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { FunctionName } from './FunctionNames'

// AsType(record:P, table:*[]): ![]
export class AsTypeFunction extends BuiltinFunction {
  public static AsTypeInvariantFunctionName = FunctionName.AsType

  public get requiresErrorContext() {
    return true
  }

  public get isAsync() {
    return true
  }

  public get canReturnExpandInfo() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    // super(AsTypeInvariantFunctionName, TexlStrings.AboutAsType, FunctionCategories.Table, DType.EmptyRecord, 0, 2, 2, DType.Error /* Polymorphic type is checked in override */, DType.EmptyTable)
    super(
      undefined,
      AsTypeFunction.AsTypeInvariantFunctionName,
      undefined,
      TexlStrings.AboutAsType,
      FunctionCategories.Table,
      DType.EmptyRecord,
      0,
      2,
      2,
      DType.Error /* Polymorphic type is checked in override */,
      DType.EmptyTable,
    )
  }

  public getSignatures() {
    return [[TexlStrings.AsTypeArg1, TexlStrings.AsTypeArg2]]
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
    // Contracts.Assert(args.Length == 2);
    // Contracts.Assert(argTypes.Length == 2);
    // Contracts.AssertValue(errors);

    const baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap
    if (!baseResult[0]) {
      return baseResult
    }

    // Check if first argument is poly type or an activity pointer
    if (!argTypes[0].isPolymorphic && !argTypes[0].isActivityPointer) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrBadType_ExpectedType_ProvidedType,
        DKind.Polymorphic.toString(),
        argTypes[0].getKindString(),
      )
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    // Check if table arg referrs to a connected data source.
    const tableArg = args[1]
    const result = binding.tryGetFirstNameInfo(tableArg.id)
    const tableInfo = result[1]
    const tableDsInfo = tableInfo.data

    if (!result[0] || !IsIExternalDataSource(tableInfo.data) || !IsIExternalTabularDataSource(tableDsInfo)) {
      errors.ensureError(tableArg, TexlStrings.ErrAsTypeAndIsTypeExpectConnectedDataSource)
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    if (
      binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled &&
      IsIExternalCdsDataSource(tableDsInfo) &&
      argTypes[0].hasPolymorphicInfo
    ) {
      const expandInfo = argTypes[0].polymorphicInfo.tryGetExpandInfo(tableDsInfo.tableMetadata.name)
      if (expandInfo != null) {
        returnType = argTypes[0].expandPolymorphic(argTypes[1], expandInfo)
        return [true, { returnType, nodeToCoercedTypeMap }]
      }
    }

    returnType = argTypes[1].toRecord()
    return [true, { returnType, nodeToCoercedTypeMap }]
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    return (
      binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled &&
      metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.AsType))
    )
  }

  protected requiresPagedDataForParamCore(args: TexlNode[], paramIndex: number, binding: TexlBinding): boolean {
    // Contracts.AssertValue(args)
    // Contracts.AssertAllValues(args)
    // Contracts.Assert(paramIndex >= 0 && paramIndex < args.Length)
    // Contracts.AssertValue(binding)
    // Contracts.Assert(binding.IsPageable(args[paramIndex].VerifyValue()))

    // For the second argument, we need only metadata. No actual data from datasource is required.
    return paramIndex != 1
  }
}
