// Logical negation function.
//  Not(value:b) : b

import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import {
  DefaultBinaryOpDelegationStrategy,
  InOpDelegationStrategy,
  IOpDelegationStrategy,
} from '../../functions/delegation/delegationStrategies'
import { BinaryOp, UnaryOp } from '../../lexer'
import { TexlStrings } from '../../localization'
import { BinaryOpNode, CallNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { BuiltinFunctionsCore } from '../BuiltinFunctionsCore'

// Equivalent Excel function: Not.
export class NotFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Not',
      undefined,
      TexlStrings.AboutNot,
      FunctionCategories.Logical,
      DType.Boolean,
      0,
      1,
      1,
      DType.Boolean,
    )
  }

  public getSignatures() {
    return [[TexlStrings.LogicalFuncParam]]
  }

  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(DelegationCapability.Not | DelegationCapability.Filter)
  }

  // For binary op node args, we need to use filter delegation strategy. Hence we override this method here.
  public getOpDelegationStrategy(op: BinaryOp, opNode: BinaryOpNode): IOpDelegationStrategy {
    // Contracts.AssertValueOrNull(opNode);

    if (op == BinaryOp.In) {
      // Contracts.AssertValue(opNode);
      // Contracts.Assert(opNode.Op == op);
      // TODO:
      return new InOpDelegationStrategy(opNode, BuiltinFunctionsCore.Filter)
      // return new InOpDelegationStrategy(opNode, BuiltinFunctionsCore.Abs)
    }
    return new DefaultBinaryOpDelegationStrategy(op, BuiltinFunctionsCore.Filter)
    // return new DefaultBinaryOpDelegationStrategy(op, BuiltinFunctionsCore.Abs)
  }

  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata,
  ): boolean {
    // Contracts.AssertValue(callNode)
    // Contracts.AssertValue(binding)
    // Contracts.AssertValue(metadata)

    if (
      binding.errorContainer.hasErrors(callNode) ||
      !this.checkArgsCount(callNode, binding) ||
      !binding.isRowScope(callNode)
    ) {
      return false
    }

    const args = callNode.args.children
    const argKind = args[0].kind

    const opStrategy = this.getOpDelegationStrategyOfUnaryOp(UnaryOp.Not)
    const firstNameStrategy = this.getFirstNameNodeDelegationStrategy()
    const dottedStrategy = this.getDottedNameNodeDelegationStrategy()
    const cNodeStrategy = this.getCallNodeDelegationStrategy()

    switch (argKind) {
      case NodeKind.FirstName:
        return firstNameStrategy.isValidFirstNameNode(args[0].asFirstName(), binding, opStrategy)

      case NodeKind.Call: {
        if (!opStrategy.isOpSupportedByTable(metadata, callNode, binding)) {
          return false
        }

        return cNodeStrategy.isValidCallNode(args[0].asCall(), binding, metadata)
      }
      case NodeKind.BinaryOp: {
        if (!opStrategy.isOpSupportedByTable(metadata, callNode, binding)) {
          return false
        }

        const opNode = args[0].asBinaryOp()
        const binaryOpNodeValidationStrategy = this.getOpDelegationStrategy(opNode.op, opNode)
        return binaryOpNodeValidationStrategy.isSupportedOpNode(opNode, metadata, binding)
      }
      case NodeKind.UnaryOp: {
        if (!opStrategy.isOpSupportedByTable(metadata, callNode, binding)) {
          return false
        }

        const opNode = args[0].asUnaryOpLit()
        const unaryOpNodeValidationStrategy = this.getOpDelegationStrategyOfUnaryOp(opNode.op)
        return unaryOpNodeValidationStrategy.isSupportedOpNode(opNode, metadata, binding)
      }
      case NodeKind.DottedName:
        return dottedStrategy.isValidDottedNameNode(args[0].asDottedName(), binding, metadata, opStrategy)

      default:
        return argKind == NodeKind.BoolLit
    }
  }
}
