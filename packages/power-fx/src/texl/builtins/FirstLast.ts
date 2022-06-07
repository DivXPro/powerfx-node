import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DataSourceKind } from '../../entities/DataSourceKind'
import { DocumentErrorSeverity } from '../../errors'
import { DelegationCapability } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { FunctionWithTableInput } from './FunctionWithTableInput'

export class FirstLastFunction extends FunctionWithTableInput {
  public get requiresErrorContext() {
    return this._isFirst
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  private readonly _isFirst: boolean

  constructor(isFirst: boolean) {
    super(
      undefined,
      isFirst ? 'First' : 'Last',
      isFirst ? TexlStrings.AboutFirst : TexlStrings.AboutLast,
      FunctionCategories.Table,
      DType.EmptyRecord,
      0,
      1,
      1,
      DType.EmptyTable
    )

    this._isFirst = isFirst
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.Top)
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding) {
    return false
  }

  public getSignatures() {
    return [[TexlStrings.FirstLastArg1]]
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
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fArgsValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // let fArgsValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    let arg0Type = argTypes[0]
    if (arg0Type.isTable) {
      returnType = arg0Type.toRecord()
    } else {
      returnType = arg0Type.isRecord ? arg0Type : DType.Error
      fArgsValid = false
    }
    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    // Only delegate First, not last
    if (!this._isFirst) {
      return false
    }

    // If has top capability (e.g. Dataverse)
    let TryGetValidDataSourceForDelegation =
      super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        this.functionDelegationCapability
      )
    let dataSource = TryGetValidDataSourceForDelegation[1]
    if (TryGetValidDataSourceForDelegation[0]) {
      return true
    }

    // If is a client-side pageable data source
    let TryGetDataSource = super.tryGetDataSource(callNode, binding)
    dataSource = TryGetDataSource[1]
    if (
      TryGetDataSource[0] &&
      dataSource.kind == DataSourceKind.Connected &&
      dataSource.isPageable
    ) {
      return true
    }

    if (dataSource != null && dataSource.isDelegatable) {
      binding.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        callNode,
        TexlStrings.OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService,
        this.name
      )
    }

    return false
  }
}
