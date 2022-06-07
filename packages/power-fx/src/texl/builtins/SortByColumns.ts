import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DataSourceToQueryOptionsMap } from '../../entities/queryOptions/DataSourceToQueryOptionsMap'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { DelegationCapability } from '../../functions/delegation'
import { SortOpMetadata } from '../../functions/delegation/delegationMetadata'
import {
  ArgValidators,
  SortOrderValidator,
} from '../../functions/functionArgValidators'
import { SignatureConstraint } from '../../functions/SignatureConstraint'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode, StrLitNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import {
  DKind,
  DType,
  DTypeHelper,
  FieldNameKind,
  TypedName,
} from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { LanguageConstants } from '../../utils/LanguageConstants'

// SortByColumns(source:*, name:s, order:s...name:s, [order:s])
export class SortByColumnsFunction extends BuiltinFunction {
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
      'SortByColumns',
      undefined,
      TexlStrings.AboutSortByColumns,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      Number.MAX_VALUE,
      DType.EmptyTable,
      DType.String
    )

    this._sortOrderValidator = ArgValidators.SortOrderValidator

    // SortByColumns(source, name, order, name, order, ...name, order, ...)
    this.signatureConstraint = new SignatureConstraint(5, 2, 0, 9)
  }

  public get requiresErrorContext() {
    return true
  }

  public getSignatures() {
    // Enumerate just the base overloads (the first 2 possibilities).
    return [
      [TexlStrings.SortByColumnsArg1, TexlStrings.SortByColumnsArg2],
      [
        TexlStrings.SortByColumnsArg1,
        TexlStrings.SortByColumnsArg2,
        TexlStrings.SortByColumnsArg3,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 3) {
      return this.GetOverloadsSortByColumns(arity)
    }

    return super.getSignaturesAtArity(arity)
  }

  //   public override checkInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
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

    // Contracts.Assert(returnType.IsTable);

    // returnType = argTypes[0];

    let sourceType = argTypes[0]
    for (let i = 1; i < args.length; i += 2) {
      let colNameArg = args[i]
      let colNameArgType = argTypes[i]
      let nameNode: StrLitNode

      if (colNameArgType.kind != DKind.String) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          colNameArg,
          TexlStrings.ErrStringExpected
        )
        fValid = false
      } else if ((nameNode = colNameArg.asStrLit()) != null) {
        // Verify that the name is valid.
        if (DName.IsValidDName(nameNode.value)) {
          let columnName = new DName(nameNode.value)

          // Verify that the name exists.
          let TryGetType = sourceType.tryGetType(columnName)
          let columnType = TryGetType[1]
          if (!TryGetType[0]) {
            sourceType.reportNonExistingName(
              FieldNameKind.Logical,
              errors,
              columnName,
              args[i]
            )
            fValid = false
          } else if (!columnType.isPrimitive || columnType.isOptionSet) {
            fValid = false
            errors.ensureError(colNameArg, TexlStrings.ErrSortWrongType)
          }
        } else {
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            nameNode,
            TexlStrings.ErrArgNotAValidIdentifier_Name,
            nameNode.value
          )
          fValid = false
        }
      }

      let nextArgIdx = i + 1
      if (nextArgIdx < args.length && argTypes[nextArgIdx] != DType.String) {
        fValid = false
        errors.ensureError(args[i + 1], TexlStrings.ErrSortIncorrectOrder)
      }
    }

    // return fValid;
    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex >= 0
  }

  private IsColumnSortable(
    node: StrLitNode,
    binding: TexlBinding,
    sortMetadata: SortOpMetadata
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(sortMetadata);

    let columnPath = DPath.Root.append(new DName(node.value))
    if (
      !sortMetadata.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(DelegationCapability.Sort)
      )
    ) {
      super.suggestDelegationHint(node, binding)
      return false
    }

    return true
  }

  private IsValidSortableColumnNode(
    node: TexlNode,
    binding: TexlBinding,
    metadata: SortOpMetadata
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    if (
      binding.errorContainer.hasErrors(node) ||
      node.kind != NodeKind.StrLit
    ) {
      return false
    }

    let columnName = node.asStrLit() //.VerifyValue();
    return this.IsColumnSortable(columnName, binding, metadata)
  }

  private IsSortOrderSuppportedByColumn(
    order: string,
    metadata: SortOpMetadata,
    columnPath: DPath
  ) {
    // Contracts.AssertValue(order);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValid(columnPath);

    order = order.toLowerCase()

    // If column is marked as ascending only then return false if order requested is descending.
    return (
      order != LanguageConstants.DescendingSortOrderString ||
      !metadata.isColumnAscendingOnly(columnPath)
    )
  }

  private IsValidSortOrderNode(
    node: TexlNode,
    metadata: SortOpMetadata,
    binding: TexlBinding,
    columnPath: DPath
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValid(columnPath);

    if (binding.isAsync(node)) {
      let message = `Function:${this.name}, SortOrderNode is async`
      super.addSuggestionMessageToTelemetry(message, node, binding)
      return false
    }

    let sortOrder: string
    switch (node.kind) {
      case NodeKind.FirstName:
      case NodeKind.StrLit:
        let TryGetValidValue = this._sortOrderValidator.tryGetValidValue(
          node,
          binding
        )
        sortOrder = TryGetValidValue[1]
        return (
          TryGetValidValue[0] &&
          this.IsSortOrderSuppportedByColumn(sortOrder, metadata, columnPath)
        )
      case NodeKind.DottedName:
      case NodeKind.Call:
        let TryGetValidValue2 = this._sortOrderValidator.tryGetValidValue(
          node,
          binding
        )
        sortOrder = TryGetValidValue2[1]
        if (
          TryGetValidValue2[0] &&
          this.IsSortOrderSuppportedByColumn(sortOrder, metadata, columnPath)
        ) {
          return true
        }

        // If both ascending and descending are supported then we can support this.
        return (
          this.IsSortOrderSuppportedByColumn(
            LanguageConstants.DescendingSortOrderString,
            metadata,
            columnPath
          ) &&
          this.IsSortOrderSuppportedByColumn(
            LanguageConstants.AscendingSortOrderString,
            metadata,
            columnPath
          )
        )
      default:
        super.addSuggestionMessageToTelemetry(
          'Unsupported sortorder node.',
          node,
          binding
        )
        return false
    }
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (binding.errorContainer.hasErrors(callNode)) {
      return false
    }

    if (!super.checkArgsCount(callNode, binding)) {
      return false
    }

    let metadata: SortOpMetadata = null
    let TryGetEntityMetadata = super.tryGetDelegationMetadata(callNode, binding)
    let delegationMetadata = TryGetEntityMetadata[1]
    if (TryGetEntityMetadata[0]) {
      let TryGetValidDataSourceForDelegation =
        super.tryGetValidDataSourceForDelegation(
          callNode,
          binding,
          new DelegationCapability(DelegationCapability.ArrayLookup)
        )
      if (
        !binding.document.properties.enabledFeatures
          .isEnhancedDelegationEnabled ||
        !TryGetValidDataSourceForDelegation[0]
      ) {
        super.suggestDelegationHint(callNode, binding)
        return false
      }

      metadata = delegationMetadata.sortDelegationMetadata //.VerifyValue();
    } else {
      let TryGetValidDataSourceForDelegation =
        super.tryGetValidDataSourceForDelegation(
          callNode,
          binding,
          new DelegationCapability(DelegationCapability.Sort)
        )
      let dataSource = TryGetValidDataSourceForDelegation[1]
      if (!TryGetValidDataSourceForDelegation[0]) {
        return false
      }

      metadata = dataSource.delegationMetadata.sortDelegationMetadata
    }

    let args = callNode.args.children //.VerifyValue();
    let cargs = args.length

    const defaultSortOrder = LanguageConstants.AscendingSortOrderString

    for (let i = 1; i < cargs; i += 2) {
      if (!this.IsValidSortableColumnNode(args[i], binding, metadata)) {
        super.suggestDelegationHint(args[i], binding)
        return false
      }

      let columnName = args[i].asStrLit().value //.VerifyValue().Value;
      let sortOrderNode = i + 1 < cargs ? args[i + 1] : null
      let sortOrder = sortOrderNode == null ? defaultSortOrder : '' // '';
      if (sortOrderNode != null) {
        if (
          !this.IsValidSortOrderNode(
            sortOrderNode,
            metadata,
            binding,
            DPath.Root.append(new DName(columnName))
          )
        ) {
          super.suggestDelegationHint(sortOrderNode, binding)
          return false
        }
      } else if (
        !this.IsSortOrderSuppportedByColumn(
          sortOrder,
          metadata,
          DPath.Root.append(new DName(columnName))
        )
      ) {
        super.suggestDelegationHint(args[i], binding)
        return false
      }
    }

    return true
  }

  // Gets the overloads for SortByColumns function for the specified arity.
  private GetOverloadsSortByColumns(arity: number) {
    // Contracts.Assert(arity > 3);

    const OverloadCount = 2

    let overloads = new Array<StringGetter[]>(OverloadCount)

    // Limit the argCount avoiding potential OOM
    let argCount =
      arity > this.signatureConstraint.repeatTopLength
        ? this.signatureConstraint.repeatTopLength
        : arity
    for (let ioverload = 0; ioverload < OverloadCount; ioverload++) {
      let iArgCount = argCount + ioverload
      let overload = [] // new TexlStrings.StringGetter[iArgCount];
      overload[0] = TexlStrings.SortByColumnsArg1
      for (let iarg = 1; iarg < iArgCount; iarg += 2) {
        overload[iarg] = TexlStrings.SortByColumnsArg2

        if (iarg < iArgCount - 1) {
          overload[iarg + 1] = TexlStrings.SortByColumnsArg3
        }
      }

      overloads.push(overload)
    }

    return overloads // new ReadOnlyCollection<TexlStrings.StringGetter[]>(overloads);
  }

  public get affectsDataSourceQueryOptions() {
    return true
  }

  public updateDataQuerySelects(
    callNode: CallNode,
    binding: TexlBinding,
    dataSourceToQueryOptionsMap: DataSourceToQueryOptionsMap
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (
      !super.checkArgsCount(callNode, binding, DocumentErrorSeverity.Moderate)
    ) {
      return false
    }

    let args = callNode.args.children //.VerifyValue();

    let dsType = binding.getType(args[0])
    if (dsType.associatedDataSources == null) {
      return false
    }

    let retval = false

    for (let i = 1; i < args.length; i += 2) {
      let columnType = binding.getType(args[i])
      let columnNode = args[i].asStrLit()
      if (columnType.kind != DKind.String || columnNode == null) {
        continue
      }

      let columnName = columnNode.value

      // Contracts.Assert(dsType.Contains(new DName(columnName)));

      retval =
        retval ||
        DTypeHelper.AssociateDataSourcesToSelect(
          dsType,
          dataSourceToQueryOptionsMap,
          columnName,
          columnType,
          true
        )
    }

    return retval
  }
}

// SortByColumns(source:*, name:s, values:*[])
export class SortByColumnsOrderTableFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    super(
      undefined,
      'SortByColumns',
      undefined,
      TexlStrings.AboutSortByColumnsWithOrderValues,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      3,
      3,
      DType.EmptyTable,
      DType.String,
      DType.EmptyTable
    )
  }

  public get requiresErrorContext() {
    return true
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('OrderTable')
  }

  public getSignatures() {
    return [
      [
        TexlStrings.SortByColumnsWithOrderValuesArg1,
        TexlStrings.SortByColumnsWithOrderValuesArg2,
        TexlStrings.SortByColumnsWithOrderValuesArg3,
      ],
    ] //{};
  }

  //   public override bool CheckInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
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

    // Contracts.Assert(returnType.IsTable);

    returnType = argTypes[0]
    let sourceType = argTypes[0]
    let nameArg = args[1]
    let nameArgType = argTypes[1]
    let nameNode: StrLitNode = null
    let columnType = DType.Invalid

    if (nameArgType.kind != DKind.String) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        nameArg,
        TexlStrings.ErrStringExpected
      )
      fValid = false
    } else if ((nameNode = nameArg.asStrLit()) != null) {
      // Verify that the name is valid.
      if (DName.IsValidDName(nameNode.value)) {
        let columnName = new DName(nameNode.value)

        // Verify that the name exists.
        let TryGetType = sourceType.tryGetType(columnName)
        columnType = TryGetType[1]
        if (!TryGetType[0]) {
          sourceType.reportNonExistingName(
            FieldNameKind.Logical,
            errors,
            columnName,
            nameNode
          )
          fValid = false
        } else if (!columnType.isPrimitive) {
          fValid = false
          errors.ensureError(nameArg, TexlStrings.ErrSortWrongType)
        }
      } else {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          nameNode,
          TexlStrings.ErrArgNotAValidIdentifier_Name,
          nameNode.value
        )
        fValid = false
      }
    }

    let valuesArg = args[2]
    let columns: TypedName[] // IEnumerable < TypedName > ;
    if ((columns = argTypes[2].getNames(DPath.Root)).length != 1) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        valuesArg,
        TexlStrings.ErrInvalidSchemaNeedCol
      )
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    let column = columns[0] //.Single();
    if (
      nameNode != null &&
      columnType.isValid &&
      !columnType.accepts(column.type)
    ) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        valuesArg,
        TexlStrings.ErrTypeError_Arg_Expected_Found,
        nameNode.value,
        columnType.getKindString(),
        column.type.getKindString()
      )
      fValid = false
    }

    // return fValid;
    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 0 || argumentIndex == 1
  }

  public get affectsDataSourceQueryOptions() {
    return true
  }

  public updateDataQuerySelects(
    callNode: CallNode,
    binding: TexlBinding,
    dataSourceToQueryOptionsMap: DataSourceToQueryOptionsMap
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    // Ignore delegation warning
    if (
      !super.checkArgsCount(callNode, binding, DocumentErrorSeverity.Moderate)
    ) {
      return false
    }

    let args = callNode.args.children //.VerifyValue();

    let dsType = binding.getType(args[0])
    if (dsType.associatedDataSources == null) {
      return false
    }

    let columnType = binding.getType(args[1])
    let columnNode = args[1].asStrLit()
    if (columnType.kind != DKind.String || columnNode == null) {
      return false
    }

    let columnName = columnNode.value

    // Contracts.Assert(dsType.Contains(new DName(columnName)));

    return DTypeHelper.AssociateDataSourcesToSelect(
      dsType,
      dataSourceToQueryOptionsMap,
      columnName,
      columnType,
      true
    )
  }
}
