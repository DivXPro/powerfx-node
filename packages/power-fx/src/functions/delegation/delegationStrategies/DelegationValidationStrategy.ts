import { TexlBinding } from '../../../binding/Binder'
import { BinderUtils } from '../../../binding/BinderUtils'
import { CallInfo, FirstNameInfo } from '../../../binding/bindingInfo'
import { DocumentErrorSeverity } from '../../../errors'
import {
  ErrorResourceKey,
  StringResources,
  TexlStrings,
} from '../../../localization'
import {
  DelegationStatus,
  DelegationTelemetryInfo,
  TrackingProvider,
} from '../../../logging/trackers'
import {
  CallNode,
  DottedNameNode,
  FirstNameNode,
  TexlNode,
} from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DKind } from '../../../types/DKind'
import { IExpandInfo, IsIExpandInfo } from '../../../types/IExpandInfo'
import { CharacterUtils } from '../../../utils/CharacterUtils'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { StringFormat } from '../../../utils/StringFormat'
import { DelegationCapability } from '../DelegationCapability'
import { TexlFunction } from '../../TexlFunction'
import { DelegationMetadata } from '../delegationMetadata/DelegationMetadata'
import { IsICustomDelegationFunction } from '../ICustomDelegationFunction'
import { IDelegationMetadata } from '../IDelegationMetadata'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { IOpDelegationStrategy } from './IOpDelegationStrategy'
import { AsTypeFunction } from '../../../texl/builtins/AsType'
import { FunctionName } from '../../../texl/builtins/FunctionNames'

export interface ICallNodeDelegatableNodeValidationStrategy {
  isValidCallNode(
    node: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ): boolean
}

export interface IDottedNameNodeDelegatableNodeValidationStrategy {
  isValidDottedNameNode(
    node: DottedNameNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata,
    opDelStrategy: IOpDelegationStrategy
  ): boolean
}

export interface IFirstNameNodeDelegatableNodeValidationStrategy {
  isValidFirstNameNode(
    node: FirstNameNode,
    binding: TexlBinding,
    opDelStrategy: IOpDelegationStrategy
  ): boolean
}

export class DelegationValidationStrategy
  implements
    ICallNodeDelegatableNodeValidationStrategy,
    IDottedNameNodeDelegatableNodeValidationStrategy,
    IFirstNameNodeDelegatableNodeValidationStrategy
{
  constructor(fn: TexlFunction) {
    // Contracts.AssertValue(function);

    this.function = fn
  }

  protected function: TexlFunction

  protected addSuggestionMessageToTelemetry(
    telemetryMessage: string,
    node: TexlNode,
    binding: TexlBinding
  ) {
    // Contracts.AssertNonEmpty(telemetryMessage);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    let message = `Function:${this.function.name}, Message:${telemetryMessage}`
    TrackingProvider.Instance.addSuggestionMessage(message, node, binding)
  }

  protected suggestDelegationHintAndAddTelemetryMessage(
    node: TexlNode,
    binding: TexlBinding,
    telemetryMessage: string,
    suggestionKey?: ErrorResourceKey,
    ...args: any[]
  ) {
    // Contracts.Assert(suggestionKey == null || suggestionKey?.Key != '');

    this.suggestDelegationHint(node, binding, suggestionKey, args)
    this.addSuggestionMessageToTelemetry(telemetryMessage, node, binding)
  }

  // Helper used to provide hints when we detect non-delegable parts of the expression due to server restrictions.
  protected suggestDelegationHint(
    node: TexlNode,
    binding: TexlBinding,
    suggestionKey?: ErrorResourceKey,
    ...args: any[]
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.Assert(suggestionKey == null || suggestionKey?.Key != '');

    if (suggestionKey == null) {
      suggestionKey = TexlStrings.SuggestRemoteExecutionHint
    }

    if (args == null || args.length == 0) {
      binding.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        node,
        suggestionKey,
        this.function.name
      )
    } else {
      binding.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        node,
        suggestionKey,
        args
      )
    }
  }

  // protected suggestDelegationHint(node: TexlNode, binding: TexlBinding)
  // {
  //     // Contracts.AssertValue(node);
  //     // Contracts.AssertValue(binding);

  //     this.suggestDelegationHint(node, binding, null);
  // }

  private isValidRowScopedDottedNameNode(
    node: DottedNameNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ): [boolean, boolean] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    let isRowScopedDelegationExempted = false
    if (
      node.left.kind == NodeKind.FirstName &&
      binding.isDelegationExempted(node.left as FirstNameNode) &&
      binding.isLambdaScoped(node.left as FirstNameNode)
    ) {
      isRowScopedDelegationExempted = true

      return [true, isRowScopedDelegationExempted]
    }

    if (node.left.kind == NodeKind.DottedName) {
      return this.isValidRowScopedDottedNameNode(
        node.left.asDottedName(),
        binding,
        metadata
      )
    }

    // if (node.left.kind == NodeKind.Call && binding.getInfo(node.left as CallNode).function instanceof AsTypeFunction) {
    if (
      node.left.kind == NodeKind.Call &&
      binding.getInfo(node.left as CallNode).function?.name ===
        FunctionName.AsType
    ) {
      return [
        this.isValidCallNode(node.left as CallNode, binding, metadata),
        isRowScopedDelegationExempted,
      ]
    }

    // We only allow dotted or firstname node on LHS for now, with exception of AsType.
    return [node.left.kind == NodeKind.FirstName, isRowScopedDelegationExempted]
  }

  private getScopedOperationCapabilityMetadata(
    delegationMetadata: IDelegationMetadata
  ): OperationCapabilityMetadata {
    if (
      this.function.functionDelegationCapability.hasCapability(
        DelegationCapability.Sort
      ) ||
      this.function.functionDelegationCapability.hasCapability(
        DelegationCapability.SortAscendingOnly
      )
    ) {
      return delegationMetadata.sortDelegationMetadata
    }

    return delegationMetadata.filterDelegationMetadata
  }

  public isValidDottedNameNode(
    node: DottedNameNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata,
    opDelStrategy: IOpDelegationStrategy
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValueOrNull(opDelStrategy);

    let isRowScoped = binding.isRowScope(node)
    if (!isRowScoped) {
      return this.isValidNode(node, binding)
    }

    const result = this.isValidRowScopedDottedNameNode(node, binding, metadata)
    const isRowScopedDelegationExempted = result[1]
    if (!result[0]) {
      const telemetryMessage = `Kind:${node.kind}, isRowScoped:${isRowScoped}`

      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        telemetryMessage
      )
      return false
    }

    if (isRowScopedDelegationExempted) {
      binding.setBlockScopedConstantNode(node)
      return true
    }

    const rst = binding.tryGetFullRecordRowScopeAccessInfo(node)
    let firstNameInfo = rst[1]

    if (rst[0]) {
      // This means that this row scoped field is from some parent scope which is non-delegatable. That should deny delegation at that point.
      // For this scope, this means that value will be provided from some other source.
      // For example, AddColumns(CDS As Left, "Column1", LookUp(CDS1, Left.Name in FirstName))
      // CDS - *[Name:s], CDS1 - *[FirstName:s]
      if (this.getCapabilityMetadata(firstNameInfo) == null) {
        return true
      }
    }

    if (!binding.getType(node.left).hasExpandInfo) {
      const rst = BinderUtils.TryConvertNodeToDPath(binding, node)
      const columnPath = rst[1]
      if (
        !rst[0] ||
        !metadata.isDelegationSupportedByColumn(
          columnPath,
          this.function.functionDelegationCapability
        )
      ) {
        let safeColumnName = CharacterUtils.MakeSafeForFormatString(
          columnPath.toDottedSyntax()
        )
        let message = StringFormat(
          StringResources.Get(
            TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn
          ),
          safeColumnName
        )
        this.suggestDelegationHintAndAddTelemetryMessage(
          node,
          binding,
          message,
          TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn,
          safeColumnName
        )
        TrackingProvider.Instance.setDelegationTrackerStatus(
          DelegationStatus.NoDelSupportByColumn,
          node,
          binding,
          this.function,
          DelegationTelemetryInfo.CreateNoDelSupportByColumnTelemetryInfo(
            columnPath.toDottedSyntax()
          )
        )
        return false
      }

      // If there is any operator applied on this node then check if column supports operation.
      return (
        opDelStrategy?.isOpSupportedByColumn(
          metadata,
          node,
          columnPath,
          binding
        ) ?? true
      )
    }

    // If there is an entity reference then we need to do additional verification.
    const info = binding.getType(node.left).expandInfo
    const dataSourceInfo = info.parentDataSource
    const entityMetadataResult =
      dataSourceInfo.dataEntityMetadataProvider.tryGetEntityMetadata(
        info.identity
      )
    const entityMetadata = entityMetadataResult[1]
    if (!entityMetadataResult[0]) {
      const telemetryMessage = `Kind:${
        node.kind
      }, isRowScoped:${isRowScoped}, no metadata found for entity ${CharacterUtils.MakeSafeForFormatString(
        info.identity
      )}`

      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        telemetryMessage
      )
      return false
    }

    const entityCapabilityMetadata = this.getScopedOperationCapabilityMetadata(
      entityMetadata.delegationMetadata
    )
    let columnName = node.right.name
    const fromSecondResult = entityMetadata.displayNameMapping.tryGetFromSecond(
      node.right.name.value
    )
    const maybeLogicalName = fromSecondResult[1]
    if (fromSecondResult[0]) {
      columnName = new DName(maybeLogicalName)
    }

    const entityColumnPath = DPath.Root.append(columnName)

    if (
      !entityCapabilityMetadata.isDelegationSupportedByColumn(
        entityColumnPath,
        this.function.functionDelegationCapability
      )
    ) {
      const safeColumnName = CharacterUtils.MakeSafeForFormatString(
        columnName.value
      )
      const message = StringFormat(
        StringResources.Get(
          TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn
        ),
        safeColumnName
      )
      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        message,
        TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn,
        safeColumnName
      )
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.NoDelSupportByColumn,
        node,
        binding,
        this.function,
        DelegationTelemetryInfo.CreateNoDelSupportByColumnTelemetryInfo(
          columnName.toString()
        )
      )
      return false
    }

    // If there is any operator applied on this node then check if column supports operation.
    return (
      opDelStrategy?.isOpSupportedByColumn(
        entityCapabilityMetadata,
        node,
        entityColumnPath,
        binding
      ) ?? true
    )
  }

  public isValidFirstNameNode(
    node: FirstNameNode,
    binding: TexlBinding,
    opDelStrategy: IOpDelegationStrategy
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValueOrNull(opDelStrategy);

    let isRowScoped = binding.isRowScope(node)
    let isValid = this.isValidNode(node, binding)
    if (isValid && !isRowScoped) {
      return true
    }

    // If invalid node then return immediately.
    if (!isValid) {
      return false
    }

    return this.isDelegatableColumnNode(
      node,
      binding,
      opDelStrategy,
      this.function.functionDelegationCapability
    )
  }

  private getCapabilityMetadata(info: FirstNameInfo): IDelegationMetadata {
    // Contracts.AssertValue(info);

    let metadata: IDelegationMetadata
    if (info.data instanceof DelegationMetadata) {
      return info.data as DelegationMetadata
    }

    if (IsIExpandInfo(info.data)) {
      const entityInfo = info.data as IExpandInfo
      // Contracts.AssertValue(entityInfo.ParentDataSource);
      // Contracts.AssertValue(entityInfo.ParentDataSource.DataEntityMetadataProvider);

      const metadataProvider =
        entityInfo.parentDataSource.dataEntityMetadataProvider

      const result = metadataProvider.tryGetEntityMetadata(entityInfo.identity)
      const entityMetadata = result[1]
      // Contracts.Assert(result);

      metadata = entityMetadata.delegationMetadata
    }

    return metadata
  }

  // Verifies if provided column node supports delegation.
  protected isDelegatableColumnNode(
    node: FirstNameNode,
    binding: TexlBinding,
    opDelStrategy: IOpDelegationStrategy,
    capability: DelegationCapability
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValueOrNull(opDelStrategy);
    // Contracts.Assert(binding.IsRowScope(node));

    const firstNameInfo = binding.getInfo(node.asFirstName())
    if (firstNameInfo == null) {
      return false
    }

    const metadata = this.getCapabilityMetadata(firstNameInfo)

    // This means that this row scoped field is from some parent scope which is non-delegatable. That should deny delegation at that point.
    // For this scope, this means that value will be provided from some other source.
    // For example, AddColumns(CDS, "Column1", LookUp(CDS1, Name in FirstName))
    // CDS - *[Name:s], CDS1 - *[FirstName:s]
    if (metadata == null) {
      return true
    }

    const columnName = firstNameInfo.name
    // Contracts.AssertValid(columnName);

    const columnPath = DPath.Root.append(columnName)

    if (
      !metadata.filterDelegationMetadata.isDelegationSupportedByColumn(
        columnPath,
        capability
      )
    ) {
      const safeColumnName = CharacterUtils.MakeSafeForFormatString(
        columnName.value
      )
      let message = StringFormat(
        StringResources.Get(
          TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn
        ),
        safeColumnName
      )
      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        message,
        TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn,
        safeColumnName
      )
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.NoDelSupportByColumn,
        node,
        binding,
        this.function,
        DelegationTelemetryInfo.CreateNoDelSupportByColumnTelemetryInfo(
          firstNameInfo
        )
      )
      return false
    }

    // If there is any operator applied on this node then check if column supports operation.
    if (
      opDelStrategy != null &&
      !opDelStrategy.isOpSupportedByColumn(
        metadata.filterDelegationMetadata,
        node.asFirstName(),
        columnPath,
        binding
      )
    ) {
      return false
    }

    return true
  }

  public isValidCallNode(
    node: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    if (!this.isValidNode(node, binding)) {
      this.suggestDelegationHint(node, binding)
      return false
    }

    // If the node is not row scoped and it's valid then it can be delegated.
    let isRowScoped = binding.isRowScope(node)
    if (!isRowScoped) {
      return true
    }

    const callInfo = binding.getInfo(node) as CallInfo
    if (
      callInfo?.function != null &&
      callInfo.function.isRowScopedServerDelegatable(node, binding, metadata)
    ) {
      return true
    }

    const telemetryMessage = `Kind:${node.kind}, isRowScoped:${isRowScoped}`
    this.suggestDelegationHintAndAddTelemetryMessage(
      node,
      binding,
      telemetryMessage
    )
    TrackingProvider.Instance.setDelegationTrackerStatus(
      DelegationStatus.UndelegatableFunction,
      node,
      binding,
      this.function,
      DelegationTelemetryInfo.CreateUndelegatableFunctionTelemetryInfo(
        callInfo?.function
      )
    )
    return false
  }

  protected isValidNode(node: TexlNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    const isAsync = binding.isAsync(node)
    const isPure = binding.isPure(node)

    if (
      node instanceof DottedNameNode &&
      ((binding.getType(node.asDottedName().left).kind == DKind.OptionSet &&
        binding.getType(node).kind == DKind.OptionSetValue) ||
        (binding.getType(node.asDottedName().left).kind == DKind.View &&
          binding.getType(node).kind == DKind.ViewValue))
    ) {
      // OptionSet and View Access are delegable despite being async
      return true
    }

    if (
      node instanceof CallNode &&
      // (binding.isBlockScopedConstant(node) || binding.getInfo(node as CallNode).function instanceof AsTypeFunction)
      (binding.isBlockScopedConstant(node) ||
        binding.getInfo(node as CallNode).function?.name ===
          FunctionName.AsType)
    ) {
      // AsType is delegable despite being async
      return true
    }

    // Async predicates and impure nodes are not supported.
    // Let CallNodes for User() be marked as being Valid to allow
    // expressions with User() calls to be delegated
    if (!this.isUserCallNodeDelegable(node, binding) && (isAsync || !isPure)) {
      const telemetryMessage = `Kind:${node.kind}, isAsync:${isAsync}, isPure:${isPure}`
      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        telemetryMessage
      )

      if (isAsync) {
        TrackingProvider.Instance.setDelegationTrackerStatus(
          DelegationStatus.AsyncPredicate,
          node,
          binding,
          this.function
        )
      }

      if (!isPure) {
        TrackingProvider.Instance.setDelegationTrackerStatus(
          DelegationStatus.ImpureNode,
          node,
          binding,
          this.function,
          DelegationTelemetryInfo.CreateImpureNodeTelemetryInfo(node, binding)
        )
      }

      return false
    }

    return true
  }

  private isUserCallNodeDelegable(
    node: TexlNode,
    binding: TexlBinding
  ): boolean {
    const customDelFunc = binding.getInfo(
      node.asDottedName().left.asCall()
    ) as CallInfo
    if (
      node instanceof DottedNameNode &&
      node.asDottedName().left instanceof CallNode
    ) {
      // && (binding.getInfo(node.asDottedName().left.asCall()).function is ICustomDelegationFunction customDelFunc)
      // && customDelFunc.IsUserCallNodeDelegable())
      const customDelFunc = binding.getInfo(
        node.asDottedName().left.asCall()
      ) as CallInfo
      if (customDelFunc && IsICustomDelegationFunction(customDelFunc)) {
        return true
      }
    }

    return false
  }
}
