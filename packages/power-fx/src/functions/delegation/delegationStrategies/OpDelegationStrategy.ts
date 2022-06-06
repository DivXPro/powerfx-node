import { TexlBinding } from '../../../binding/Binder'
import { BinaryOp } from '../../../lexer/BinaryOp'
import { TexlStrings } from '../../../localization'
import { DelegationStatus, DelegationTelemetryInfo, TrackingProvider } from '../../../logging/trackers'
import { BinaryOpNode, DottedNameNode, FirstNameNode, TexlNode } from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DKind } from '../../../types/DKind'
import { CharacterUtils } from '../../../utils/CharacterUtils'
import { DPath } from '../../../utils/DPath'
import { DelegationCapability } from '../DelegationCapability'
import { TexlFunction } from '../../TexlFunction'
import { ODataFunctionMappings } from '../ODataFunctionMapping'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'
import { DelegationValidationStrategy } from './DelegationValidationStrategy'
import { IOpDelegationStrategy } from './IOpDelegationStrategy'

export abstract class BinaryOpDelegationStrategy extends DelegationValidationStrategy implements IOpDelegationStrategy {
  private readonly _function: TexlFunction
  private _op: BinaryOp

  constructor(op: BinaryOp, fn: TexlFunction) {
    // Contracts.AssertValue(function);
    super(fn)
    this._op = op
    this._function = fn
  }

  public get op() {
    return this._op
  }

  protected formatTelemetryMessage(message: string): string {
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

    const result = metadata.isBinaryOpInDelegationSupportedByColumn(this.op, columnPath)
    if (!result) {
      TrackingProvider.Instance.addSuggestionMessage(
        this.formatTelemetryMessage('Operator not supported by column.'),
        column,
        binder,
      )
      this.suggestDelegationHint(
        column,
        binder,
        TexlStrings.OpNotSupportedByColumnSuggestionMessage_OpNotSupportedByColumn,
        CharacterUtils.MakeSafeForFormatString(columnPath.toString()),
      )
    }

    return result
  }

  public isOpSupportedByTable(metadata: OperationCapabilityMetadata, node: TexlNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    if (!metadata.isBinaryOpInDelegationSupported(this.op)) {
      this.suggestDelegationHint(
        node,
        binding,
        TexlStrings.OpNotSupportedByClientSuggestionMessage_OpNotSupportedByClient,
        this.op.toString(),
      )
      return false
    }

    if (!metadata.isBinaryOpSupportedByTable(this.op)) {
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

  // Verifies if given kind of node is supported by function delegation.
  private isSupportedNode(
    node: TexlNode,
    metadata: OperationCapabilityMetadata,
    binding: TexlBinding,
    opDelStrategy: IOpDelegationStrategy,
    isRHSNode: boolean,
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(opDelStrategy);

    if (!binding.isRowScope(node)) {
      // Check whether this is -
      //  1) in operator delegation and
      //  2) it is verifying if RHS node is supported and
      //  3) it is not an async node and
      //  4) it is a single column table and
      //  5) metadata belongs to cds datasource that supports delegation of CdsIn
      // If this check fails, verify if it is simply a valid node..
      // Eg of valid delegation functions -
      // Filter(Accounts, 'Account Name' in ["Foo", Bar"]) - Direct table use
      // Set(Names, ["Foo", Bar"]); Filter(Accounts, 'Account Name' in Names) - Using variable of type table
      // ClearCollect(Names, Accounts); Filter(Accounts, 'Account Name' in Names.'Account Name') - using column from collection.
      // This won't be delegated - Filter(Accounts, 'Account Name' in Accounts.'Account Name') as Accounts.'Account Name' is async.
      if (
        (binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled &&
          isRHSNode &&
          (opDelStrategy as unknown as BinaryOpDelegationStrategy)?.op == BinaryOp.In &&
          !binding.isAsync(node) &&
          binding.getType(node).isTable &&
          binding.getType(node).isColumn &&
          metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.CdsIn))) ||
        this.isValidNode(node, binding)
      ) {
        return true
      }
    }

    switch (node.kind) {
      case NodeKind.DottedName: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        var dottedNodeValStrategy = this._function.getDottedNameNodeDelegationStrategy()
        return dottedNodeValStrategy.isValidDottedNameNode(node.asDottedName(), binding, metadata, opDelStrategy)
      }

      case NodeKind.Call: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        var cNodeValStrategy = this._function.getCallNodeDelegationStrategy()
        return cNodeValStrategy.isValidCallNode(node.asCall(), binding, metadata)
      }

      case NodeKind.FirstName: {
        var firstNameNodeValStrategy = this._function.getFirstNameNodeDelegationStrategy()
        return firstNameNodeValStrategy.isValidFirstNameNode(node.asFirstName(), binding, opDelStrategy)
      }

      case NodeKind.UnaryOp: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const unaryopNode = node.asUnaryOpLit()
        const unaryOpNodeDelegationStrategy = this._function.getOpDelegationStrategyOfUnaryOp(unaryopNode.op)
        return unaryOpNodeDelegationStrategy.isSupportedOpNode(unaryopNode, metadata, binding)
      }

      case NodeKind.BinaryOp: {
        if (!opDelStrategy.isOpSupportedByTable(metadata, node, binding)) {
          return false
        }

        const binaryOpNode = node.asBinaryOp()
        opDelStrategy = this._function.getOpDelegationStrategy(binaryOpNode.op, binaryOpNode)

        const binaryOpDelStrategy = opDelStrategy as unknown as BinaryOpDelegationStrategy
        // Contracts.Assert(binaryOpNode.op == binaryOpDelStrategy.op);

        if (!opDelStrategy.isSupportedOpNode(node, metadata, binding)) {
          this.suggestDelegationHint(binaryOpNode, binding)
          return false
        }

        break
      }

      default: {
        const kind = node.kind
        if (kind != NodeKind.BoolLit && kind != NodeKind.StrLit && kind != NodeKind.NumLit) {
          const telemetryMessage = `NodeKind ${kind} unsupported.`
          this.suggestDelegationHintAndAddTelemetryMessage(node, binding, telemetryMessage)
          return false
        }

        break
      }
    }

    return true
  }

  private isColumnNode(node: TexlNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    return node.kind == NodeKind.FirstName && binding.isRowScope(node)
  }

  private doCoercionCheck(
    binaryOpNode: BinaryOpNode,
    metadata: OperationCapabilityMetadata,
    binding: TexlBinding,
  ): boolean {
    // Contracts.AssertValue(binaryOpNode);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);

    const leftType = binding.getType(binaryOpNode.left)
    const rightType = binding.getType(binaryOpNode.right)

    switch (leftType.kind) {
      case DKind.Date:
        if (rightType.kind == DKind.DateTime) {
          // If rhs is a column of type DateTime and lhs is row scoped then we will need to apply the coercion on rhs. So check if coercion function date is supported or not.
          if (this.isColumnNode(binaryOpNode.right, binding) && binding.isRowScope(binaryOpNode.left)) {
            return this.isDelegatableColumnNode(
              binaryOpNode.right.asFirstName(),
              binding,
              null,
              new DelegationCapability(DelegationCapability.Date),
            )
          }

          // If lhs is rowscoped but not a field reference and rhs is rowscoped then we need to check if it's supported at table level.
          if (binding.isRowScope(binaryOpNode.left) && binding.isRowScope(binaryOpNode.right)) {
            return metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.Date))
          }

          return true
        }

        break
      case DKind.DateTime:
        if (rightType.kind == DKind.Date) {
          // If lhs is a column of type DateTime and RHS is also row scoped then check if coercion function date is supported or not.
          if (this.isColumnNode(binaryOpNode.left, binding) && binding.isRowScope(binaryOpNode.right)) {
            return this.isDelegatableColumnNode(
              binaryOpNode.left.asFirstName(),
              binding,
              null,
              new DelegationCapability(DelegationCapability.Date),
            )
          }

          // If lhs is rowscoped but not a field reference and rhs is rowscoped then we need to check if it's supported at table level.
          if (binding.isRowScope(binaryOpNode.left) && binding.isRowScope(binaryOpNode.right)) {
            return metadata.isDelegationSupportedByTable(new DelegationCapability(DelegationCapability.Date))
          }

          return true
        }
        break
      default:
        break
    }

    return true
  }

  public isSupportedOpNode(node: TexlNode, metadata: OperationCapabilityMetadata, binding: TexlBinding): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(metadata);
    // Contracts.AssertValue(binding);

    const binaryOpNode = node.asBinaryOp()
    if (binaryOpNode == null) {
      return false
    }

    const opDelStrategy = this._function.getOpDelegationStrategy(binaryOpNode.op, binaryOpNode)
    const binaryOpDelStrategy = opDelStrategy as unknown as BinaryOpDelegationStrategy
    // Contracts.Assert(binaryOpNode.Op == binaryOpDelStrategy.Op);

    // Check if binaryOp is supported by datasource in the context of filter operation.
    // If this is not allowed then there is no point in checking lhs and rhs
    // It's only safe to do so if lhs and rhs is first/dotted name node as columns (FirstName/DottedName node) can have additional capabilities defined.
    if (
      !(binaryOpNode.left instanceof FirstNameNode || binaryOpNode.left instanceof DottedNameNode) &&
      !(binaryOpNode.right instanceof FirstNameNode || binaryOpNode.right instanceof DottedNameNode) &&
      !opDelStrategy.isOpSupportedByTable(metadata, node, binding)
    ) {
      const telemetryMessage = `${binaryOpNode.op.toString()} operator not supported at table level`
      this.suggestDelegationHintAndAddTelemetryMessage(node, binding, telemetryMessage)
      TrackingProvider.Instance.setDelegationTrackerStatus(
        DelegationStatus.BinaryOpNoSupported,
        node,
        binding,
        this._function,
        DelegationTelemetryInfo.CreateBinaryOpNoSupportedInfoTelemetryInfo(binaryOpNode.op),
      )
      return false
    }

    if (!ODataFunctionMappings.BinaryOpToOperatorMap.value.has(binaryOpNode.op)) {
      this.suggestDelegationHint(node, binding)
      return false
    }

    if (!this.isSupportedNode(binaryOpNode.left, metadata, binding, opDelStrategy, false)) {
      this.suggestDelegationHint(node, binding)
      return false
    }

    if (!this.isSupportedNode(binaryOpNode.right, metadata, binding, opDelStrategy, true)) {
      this.suggestDelegationHint(node, binding)
      return false
    }

    const leftType = binding.getType(binaryOpNode.left)
    const rightType = binding.getType(binaryOpNode.right)
    if ((leftType.isPolymorphic && rightType.isRecord) || (leftType.isRecord && rightType.isPolymorphic)) {
      return true
    }

    if (!this.doCoercionCheck(binaryOpNode, metadata, binding)) {
      this.suggestDelegationHint(node, binding)
      return false
    }

    return true
  }
}
