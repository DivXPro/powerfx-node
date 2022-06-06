import { TexlBinding } from '../../../binding/Binder'
import { UnaryOp } from '../../../lexer/UnaryOp'
import { TexlStrings } from '../../../localization'
import { DelegationStatus, DelegationTelemetryInfo, TrackingProvider } from '../../../logging/trackers'
import { TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DPath } from '../../../utils/DPath'
import { TexlFunction } from '../../TexlFunction'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { DelegationValidationStrategy } from './DelegationValidationStrategy'
import { IOpDelegationStrategy } from './IOpDelegationStrategy'

export abstract class UnaryOpDelegationStrategy extends DelegationValidationStrategy implements IOpDelegationStrategy {
  private readonly _function: TexlFunction
  private _op: UnaryOp

  constructor(op: UnaryOp, fn: TexlFunction) {
    // Contracts.AssertValue(function);
    super(fn)
    this._op = op
    this._function = fn
  }

  public get op() {
    return this._op
  }

  protected FormatTelemetryMessage(message: string): string {
    // Contracts.AssertNonEmpty(message);

    return `Op:${this.op}, {message}`
  }

  public isOpSupportedByColumn(
    metadata: OperationCapabilityMetadata,
    column: TexlNode,
    columnPath: DPath,
    binder: TexlBinding,
  ): boolean {
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(column);
    // Contracts.AssertValue(binder);

    const result = metadata.isUnaryOpInDelegationSupportedByColumn(this.op, columnPath)
    if (!result) {
      TrackingProvider.Instance.addSuggestionMessage(
        this.FormatTelemetryMessage('Operator not supported by column.'),
        column,
        binder,
      )
    }

    return result
  }

  public isOpSupportedByTable(metadata: OperationCapabilityMetadata, node: TexlNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    if (!metadata.isUnaryOpInDelegationSupported(this.op)) {
      this.suggestDelegationHint(
        node,
        binding,
        TexlStrings.OpNotSupportedByClientSuggestionMessage_OpNotSupportedByClient,
        this.op.toString(),
      )
      return false
    }

    if (!metadata.isUnaryOpSupportedByTable(this.op)) {
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

  private IsSupportedNode(
    node: TexlNode,
    metadata: OperationCapabilityMetadata,
    binding: TexlBinding,
    opDelStrategy: IOpDelegationStrategy,
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(opDelStrategy);

    if (!binding.isRowScope(node)) {
      return true
    }

    switch (node.kind) {
      case NodeKind.DottedName: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const dottedNodeValStrategy = this._function.getDottedNameNodeDelegationStrategy()
        return dottedNodeValStrategy.isValidDottedNameNode(node.asDottedName(), binding, metadata, opDelStrategy)
      }

      case NodeKind.Call: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const cNodeValStrategy = this._function.getCallNodeDelegationStrategy()
        return cNodeValStrategy.isValidCallNode(node.asCall(), binding, metadata)
      }

      case NodeKind.FirstName: {
        const firstNameNodeValStrategy = this._function.getFirstNameNodeDelegationStrategy()
        return firstNameNodeValStrategy.isValidFirstNameNode(node.asFirstName(), binding, opDelStrategy)
      }

      case NodeKind.UnaryOp: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const unaryOpNode = node.asUnaryOpLit()
        opDelStrategy = this._function.getOpDelegationStrategyOfUnaryOp(unaryOpNode.op)

        const unaryOpDelStrategy = opDelStrategy as unknown as UnaryOpDelegationStrategy
        // Contracts.Assert(unaryOpDelStrategy.Op == unaryOpNode.Op);

        if (!opDelStrategy.isSupportedOpNode(node, metadata, binding)) {
          this.suggestDelegationHint(node, binding)
          return false
        }

        return true
      }

      case NodeKind.BinaryOp: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const binaryOpNode = node.asBinaryOp()
        const binaryOpNodeDelValidationStrategy = this._function.getOpDelegationStrategy(binaryOpNode.op, binaryOpNode)
        return binaryOpNodeDelValidationStrategy.isSupportedOpNode(node.asBinaryOp(), metadata, binding)
      }
    }

    this.suggestDelegationHint(node, binding)
    return false
  }

  public isSupportedOpNode(node: TexlNode, metadata: OperationCapabilityMetadata, binding: TexlBinding): boolean {
    // Contracts.AssertValue(node)
    // Contracts.AssertValue(metadata)
    // Contracts.AssertValue(binding)

    const unaryOpNode = node.asUnaryOpLit()
    if (unaryOpNode == null) {
      return false
    }

    if (!this.isValidNode(node, binding)) {
      return false
    }

    const opDelStrategy = this._function.getOpDelegationStrategyOfUnaryOp(unaryOpNode.op)
    const unaryOpDelStrategy = opDelStrategy as unknown as UnaryOpDelegationStrategy
    // Contracts.Assert(unaryOpDelStrategy.Op == unaryOpNode.Op)

    if (unaryOpNode.child.kind != NodeKind.FirstName && !opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
      const telemetryMessage = `${unaryOpNode.op.toString()} operator not supported at table level`
      this.suggestDelegationHintAndAddTelemetryMessage(node, binding, telemetryMessage)
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.UnaryOpNotSupportedByTable,
        node,
        binding,
        this._function,
        DelegationTelemetryInfo.CreateUnaryOpNoSupportedInfoTelemetryInfo(unaryOpNode.op),
      )
      return false
    }

    return this.IsSupportedNode(unaryOpNode.child, metadata, binding, opDelStrategy)
  }
}
