import { TexlBinding } from '../../../binding/Binder'
import { FirstNameInfo } from '../../../binding/bindingInfo'
import { BindKind } from '../../../binding/BindKind'
import { BinaryOp } from '../../../lexer/BinaryOp'
import { TexlStrings } from '../../../localization'
import { StructuralPrint } from '../../../logging/StructuraPrint'
import { TrackingProvider } from '../../../logging/trackers'
import { BinaryOpNode, FirstNameNode, TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DType } from '../../../types/DType'
import { CharacterUtils } from '../../../utils/CharacterUtils'
import { DName } from '../../../utils/DName'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { TexlFunction } from '../../TexlFunction'
import { DelegationMetadata } from '../delegationMetadata/DelegationMetadata'
import { IDelegationMetadata } from '../IDelegationMetadata'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { BinaryOpDelegationStrategy } from './OpDelegationStrategy'

export class InOpDelegationStrategy extends BinaryOpDelegationStrategy {
  private readonly _binaryOpNode: BinaryOpNode

  constructor(
    node: BinaryOpNode,
    fn: TexlFunction, // : base(BinaryOp.In, function)
  ) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(node.Op == BinaryOp.In);
    super(BinaryOp.In, fn)

    this._binaryOpNode = node
  }

  public isSupportedOpNode(node: TexlNode, metadata: OperationCapabilityMetadata, binding: TexlBinding): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);

    const binaryOpNode = node?.asBinaryOp()
    if (binaryOpNode == null) {
      return false
    }

    const isRHSDelegableTable = this.IsRHSDelegableTable(binding, binaryOpNode, metadata)

    let columnName: DName = null
    let info: FirstNameInfo = null

    const fieldAccessResult = this.CheckForFullyQualifiedFieldAccess(
      isRHSDelegableTable,
      binaryOpNode,
      binding,
      node,
      columnName,
      info,
    )
    columnName = fieldAccessResult[1].columnName
    info = fieldAccessResult[1].info
    const isFullyQualifiedFieldAccess = fieldAccessResult[0]
    // var isFullyQualifiedFieldAccess = CheckForFullyQualifiedFieldAccess(isRHSDelegableTable, binaryOpNode, binding, node, ref columnName, ref info);
    if (!isFullyQualifiedFieldAccess) {
      return false
    }

    var isRowScopedOrLambda = this.IsRowScopedOrLambda(binding, node, info, columnName, metadata)
    if (!isRowScopedOrLambda) {
      return false
    }

    return super.isSupportedOpNode(node, metadata, binding)
  }

  public IsRHSDelegableTable(
    binding: TexlBinding,
    binaryOpNode: BinaryOpNode,
    metadata: OperationCapabilityMetadata,
  ): boolean {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(binaryOpNode);
    // Contracts.AssertValue(metadata);

    const rightNodeType = binding.getType(binaryOpNode.right)

    const hasEnhancedDelegation = binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled
    const isColumn = rightNodeType?.isColumn == true
    const isDelegationSupportedByTable = metadata.isDelegationSupportedByTable(
      new DelegationCapability(DelegationCapability.CdsIn),
    )
    const hasLeftFirstNameNodeOrIsFullRecordRowScopeAccess =
      binaryOpNode.left?.asFirstName() != null || binding.isFullRecordRowScopeAccess(binaryOpNode.left)

    return (
      hasEnhancedDelegation &&
      isColumn &&
      isDelegationSupportedByTable &&
      hasLeftFirstNameNodeOrIsFullRecordRowScopeAccess
    )
  }

  public CheckForFullyQualifiedFieldAccess(
    isRHSDelegableTable: boolean,
    binaryOpNode: BinaryOpNode,
    binding: TexlBinding,
    node: TexlNode,
    columnName: DName,
    info: FirstNameInfo,
  ): [boolean, { columnName: DName; info: FirstNameInfo }] {
    // Contracts.AssertValue(binaryOpNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(node);

    // Check for fully qualified field access
    var firstNameNode = isRHSDelegableTable ? binaryOpNode.left?.asFirstName() : binaryOpNode.right?.asFirstName()
    var dottedNameNode = isRHSDelegableTable ? binaryOpNode.left?.asDottedName() : binaryOpNode.right?.asDottedName()

    if (
      dottedNameNode != null &&
      dottedNameNode.left instanceof FirstNameNode &&
      (info = binding.getInfo(dottedNameNode.left))?.kind == BindKind.LambdaFullRecord
    ) {
      columnName = dottedNameNode.right.name
    } else if (firstNameNode == null) {
      this.suggestDelegationHint(node, binding, TexlStrings.SuggestRemoteExecutionHint_InOpRhs)
      TrackingProvider.Instance.addSuggestionMessage(
        this.formatTelemetryMessage('RHS not valid delegation target'),
        this._binaryOpNode.right,
        binding,
      )
      return [false, { columnName, info }]
    } else {
      info = binding.getInfo(firstNameNode)
      if (info == null) {
        this.suggestDelegationHint(node, binding, TexlStrings.SuggestRemoteExecutionHint_InOpRhs)
        const structure = StructuralPrint.Print(binding.top, binding)
        TrackingProvider.Instance.addSuggestionMessage(
          this.formatTelemetryMessage(`RHS unbound delegation target in rule: ${structure}`),
          this._binaryOpNode.right,
          binding,
        )
        return [false, { columnName, info }]
      }

      columnName = info.name
    }

    return [true, { columnName, info }]
  }

  public IsRowScopedOrLambda(
    binding: TexlBinding,
    node: TexlNode,
    info: FirstNameInfo,
    columnName: DName,
    metadata: OperationCapabilityMetadata,
  ): boolean {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(info);

    // Only rowscoped and lambda scoped nodes are supported on rhs
    // Note: In certain error cases, info may be null.
    const bindKind = info.kind
    if (bindKind != BindKind.LambdaField && bindKind != BindKind.LambdaFullRecord) {
      this.suggestDelegationHint(node, binding, TexlStrings.SuggestRemoteExecutionHint_InOpRhs)
      TrackingProvider.Instance.addSuggestionMessage(
        this.formatTelemetryMessage('RHS not RowScope or LambdaParam'),
        this._binaryOpNode.right,
        binding,
      )
      return false
    }

    let columnMetadata: IDelegationMetadata = info.data as DelegationMetadata

    // For this to be delegable, rhs needs to be a column that belongs to innermost scoped delegable datasource.
    if (columnMetadata == null || info.upCount != 0) {
      this.suggestDelegationHint(node, binding, TexlStrings.SuggestRemoteExecutionHint_InOpInvalidColumn)
      TrackingProvider.Instance.addSuggestionMessage(
        this.formatTelemetryMessage('RHS not delegable node'),
        this._binaryOpNode.right,
        binding,
      )
      return false
    }

    var columnPath = DPath.Root.append(columnName)

    if (
      !columnMetadata.filterDelegationMetadata.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(DelegationCapability.Contains),
      ) &&
      !columnMetadata.filterDelegationMetadata.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(DelegationCapability.IndexOf | DelegationCapability.GreaterThan),
      ) &&
      !columnMetadata.filterDelegationMetadata.isDelegationSupportedByColumn(
        columnPath,
        new DelegationCapability(DelegationCapability.SubStringOf | DelegationCapability.Equal),
      )
    ) {
      this.suggestDelegationHintAndAddTelemetryMessage(
        node,
        binding,
        this.formatTelemetryMessage('Not supported by column.'),
        TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn,
        CharacterUtils.MakeSafeForFormatString(columnName.value),
      )
      return false
    }

    return true
  }

  public IsOpSupportedByColumn(
    metadata: OperationCapabilityMetadata,
    column: TexlNode,
    columnPath: DPath,
    binding: TexlBinding,
  ): boolean {
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);

    if (!metadata.isBinaryOpInDelegationSupported(this.op)) {
      this.suggestDelegationHint(
        column,
        binding,
        TexlStrings.OpNotSupportedByClientSuggestionMessage_OpNotSupportedByClient,
        this.op.toString(),
      )
      return false
    }

    const nodeType = binding.getType(column)
    return DType.String.accepts(nodeType) || nodeType.coercesTo(DType.String)[0]
  }

  public IsOpSupportedByTable(metadata: OperationCapabilityMetadata, node: TexlNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(metadata)
    // Contracts.AssertValue(node)
    // Contracts.AssertValue(binding)

    if (!metadata.isBinaryOpInDelegationSupported(this.op)) {
      this.suggestDelegationHint(
        node,
        binding,
        TexlStrings.OpNotSupportedByClientSuggestionMessage_OpNotSupportedByClient,
        this.op.toString(),
      )
      return false
    }

    // RHS always needs to be firstname node or dottedname lambda access to support delegation.
    if (
      !(
        this._binaryOpNode.right.kind == NodeKind.FirstName ||
        binding.isFullRecordRowScopeAccess(this._binaryOpNode.right) ||
        (metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.CdsIn)) &&
          (this._binaryOpNode.left.kind == NodeKind.FirstName ||
            binding.isFullRecordRowScopeAccess(this._binaryOpNode.left)) &&
          (this._binaryOpNode.right.kind == NodeKind.Table ||
            binding.getType(this._binaryOpNode.right)?.isColumn == true))
      )
    ) {
      return false
    }

    var supported =
      metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.Contains)) ||
      metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.CdsIn)) ||
      metadata.isDelegationSupportedByTable(
        new DelegationCapability(DelegationCapability.IndexOf | DelegationCapability.GreaterThan),
      ) ||
      metadata.isDelegationSupportedByTable(
        new DelegationCapability(DelegationCapability.SubStringOf | DelegationCapability.Equal),
      )

    if (!supported) {
      this.suggestDelegationHint(
        node,
        binding,
        TexlStrings.OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService,
        this.op.toString(),
      )
      return false
    }

    return true
  }
}
