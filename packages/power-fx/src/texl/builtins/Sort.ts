import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DelegationCapability, IDelegationMetadata } from '../../functions/delegation'
import { SortOpMetadata } from '../../functions/delegation/delegationMetadata'
import { ArgValidators, SortOrderValidator } from '../../functions/functionArgValidators'
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo'
import { TexlStrings } from '../../localization'
import { DelegationStatus, DelegationTelemetryInfo, TrackingProvider } from '../../logging/trackers'
import { CallNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DKind, DType } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CharacterUtils } from '../../utils/CharacterUtils'
import { Dictionary } from '../../utils/Dictionary'
import { DPath } from '../../utils/DPath'
import { LanguageConstants } from '../../utils/LanguageConstants'
import { StringBuilder } from '../../utils/StringBuilder'
import { FunctionWithTableInput } from './FunctionWithTableInput'

// Sort(source:*, valueFunc:b, [order:s])
export class SortFunction extends FunctionWithTableInput {
  private readonly _sortOrderValidator: SortOrderValidator

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      'Sort',
      TexlStrings.AboutSort,
      FunctionCategories.Table,
      DType.EmptyTable,
      0x02,
      2,
      3,
      DType.EmptyTable,
    )

    this.scopeInfo = new FunctionScopeInfo(this)
    this._sortOrderValidator = ArgValidators.SortOrderValidator
  }

  public getSignatures() {
    return [
      [TexlStrings.SortArg1, TexlStrings.SortArg2],
      [TexlStrings.SortArg1, TexlStrings.SortArg2, TexlStrings.SortArg3],
    ]
  }

  //   public override bool CheckInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
  // {
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    const newLocal = (returnType = argTypes[0])

    var exprType = argTypes[1]
    if (!exprType.isPrimitive || exprType.isOptionSet) {
      fValid = false
      errors.ensureError(args[1], TexlStrings.ErrSortWrongType)
    }

    if (args.length == 3 && argTypes[2] != DType.String) {
      fValid = false
      errors.ensureError(args[2], TexlStrings.ErrSortIncorrectOrder)
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 0 || argumentIndex == 2
  }

  private IsValidSortOrderNode(node: TexlNode, metadata: SortOpMetadata, binding: TexlBinding, columnPath: DPath) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValid(columnPath);

    if (binding.isAsync(node)) {
      super.addSuggestionMessageToTelemetry('Async sortorder node.', node, binding)
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.AsyncSortOrder,
        node,
        binding,
        this,
        DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo(),
      )
      return false
    }

    let sortOrder: string
    switch (node.kind) {
      case NodeKind.FirstName:
      case NodeKind.StrLit:
        let TryGetValue = this._sortOrderValidator.tryGetValidValue(node, binding)
        sortOrder = TryGetValue[1]
        return TryGetValue[0] && this.IsSortOrderSuppportedByColumn(node, binding, sortOrder, metadata, columnPath)
      case NodeKind.DottedName:
      case NodeKind.Call:
        let TryGetValue2 = this._sortOrderValidator.tryGetValidValue(node, binding)
        sortOrder = TryGetValue2[1]
        if (TryGetValue2[0] && this.IsSortOrderSuppportedByColumn(node, binding, sortOrder, metadata, columnPath)) {
          return true
        }

        // If both ascending and descending are supported then we can support this.
        return (
          this.IsSortOrderSuppportedByColumn(
            node,
            binding,
            LanguageConstants.DescendingSortOrderString,
            metadata,
            columnPath,
          ) &&
          this.IsSortOrderSuppportedByColumn(
            node,
            binding,
            LanguageConstants.AscendingSortOrderString,
            metadata,
            columnPath,
          )
        )
      default:
        super.addSuggestionMessageToTelemetry('Unsupported sortorder node kind.', node, binding)
        return false
    }
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false
    }

    let metadata: SortOpMetadata = null
    let TryGetEntityMetadata = super.tryGetDelegationMetadata(callNode, binding)
    let delegationMetadata: IDelegationMetadata = TryGetEntityMetadata[1]
    if (TryGetEntityMetadata[0]) {
      let TryGetValidDataSourceForDelegation = super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        new DelegationCapability(DelegationCapability.ArrayLookup),
      )
      if (
        !binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled ||
        !TryGetValidDataSourceForDelegation[0]
      ) {
        super.suggestDelegationHint(callNode, binding)
        return false
      }

      metadata = delegationMetadata.sortDelegationMetadata //.VerifyValue();
    } else {
      let TryGetValidDataSourceForDelegation = super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        new DelegationCapability(DelegationCapability.Sort),
      )
      let dataSource = TryGetValidDataSourceForDelegation[1]
      if (!TryGetValidDataSourceForDelegation[0]) {
        return false
      }

      metadata = dataSource.delegationMetadata.sortDelegationMetadata
    }

    let args = callNode.args.children //.VerifyValue();
    let arg1 = args[1] //.VerifyValue();

    // For now, we are only supporting delegation for Sort operations where second argument is column name.
    // For example, Sort(CDS, Value)
    let firstName = arg1.asFirstName()
    if (firstName == null) {
      super.suggestDelegationHint(arg1, binding)
      super.addSuggestionMessageToTelemetry('Arg1 is not a FirstName node.', arg1, binding)
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.UnSupportedSortArg,
        arg1,
        binding,
        this,
        DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo(),
      )

      return false
    }

    const firstNameInfo = binding.getInfo(firstName)
    if (firstNameInfo == null) {
      return false
    }

    const columnName = DPath.Root.append(firstNameInfo.name)
    if (!metadata.isDelegationSupportedByColumn(columnName, new DelegationCapability(DelegationCapability.Sort))) {
      super.suggestDelegationHint(firstName, binding)
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.NoDelSupportByColumn,
        firstName,
        binding,
        this,
        DelegationTelemetryInfo.CreateNoDelSupportByColumnTelemetryInfo(firstNameInfo),
      )
      return false
    }

    const defaultSortOrder = LanguageConstants.AscendingSortOrderString
    var cargs = args.length

    // Verify that the third argument (If present) is an Enum or string literal.
    if (cargs < 3 && this.IsSortOrderSuppportedByColumn(callNode, binding, defaultSortOrder, metadata, columnName)) {
      return true
    }

    // TASK: 6237100 - Binder: Propagate errors in subtree of the callnode to the call node itself
    // Only FirstName, DottedName and StrLit non-async nodes are supported for arg2.
    var arg2 = args[2] //.VerifyValue();
    if (!this.IsValidSortOrderNode(arg2, metadata, binding, columnName)) {
      super.suggestDelegationHint(arg2, binding)
      return false
    }

    return true
  }

  public static GetSortComparatorIdForType(type: DType) {
    // Contracts.AssertValid(type);

    switch (type.kind) {
      case DKind.Boolean:
        return '0'
      case DKind.Number:
      case DKind.Color:
      case DKind.Currency:
      case DKind.Date:
      case DKind.Time:
      case DKind.DateTime:
        return '1'
      case DKind.String:
      case DKind.Image:
      case DKind.PenImage:
      case DKind.Hyperlink:
      case DKind.Media:
      case DKind.Blob:
      default:
        // Contracts.Assert(DType.String.Accepts(type, exact: false));
        return '2'
    }
  }

  public static GenerateColumnNamesMappingForSortByColumns(sourceType: DType) {
    // Contracts.Assert(sourceType.IsTable);

    let allColumns = sourceType.getNames(DPath.Root)
    let separator = '' //'';

    let primitiveColumnsAndComparatorIds = new StringBuilder()
    primitiveColumnsAndComparatorIds.append('{')

    for (let column of allColumns) {
      if (column.type.isPrimitive && !column.type.isOptionSet) {
        primitiveColumnsAndComparatorIds.appendFormat(
          '{0}"{1}":{2}',
          separator,
          CharacterUtils.EscapeString(column.name.value)[0],
          SortFunction.GetSortComparatorIdForType(column.type),
        )
        separator = ','
      }
    }

    primitiveColumnsAndComparatorIds.append('}')

    return primitiveColumnsAndComparatorIds.toString()
  }

  private IsSortOrderSuppportedByColumn(
    node: TexlNode,
    binding: TexlBinding,
    order: string,
    metadata: SortOpMetadata,
    columnPath: DPath,
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(order);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValid(columnPath);

    const result = this.IsSortOrderSuppportedByColumnNext(order, metadata, columnPath)
    if (!result) {
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.SortOrderNotSupportedByColumn,
        node,
        binding,
        this,
        DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo(),
      )
    }

    return result
  }

  private IsSortOrderSuppportedByColumnNext(order: string, metadata: SortOpMetadata, columnPath: DPath) {
    // Contracts.AssertValue(order);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValid(columnPath);

    order = order.toLowerCase()

    // If column is marked as ascending only then return false if order requested is descending.
    return order != LanguageConstants.DescendingSortOrderString || !metadata.isColumnAscendingOnly(columnPath)
  }
}
