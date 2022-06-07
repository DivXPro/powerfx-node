import { TexlBinding } from '../../binding/Binder'
import { CallInfo } from '../../binding/bindingInfo'
import { CallNode, DottedNameNode, FirstNameNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { IArgValidator } from './IArgValidator'
import { IFlowInfo } from '../../types/IFlowInfo'

export class FlowArgNodeValidator implements IArgValidator<IFlowInfo> {
  public tryGetValidValue(
    argNode: TexlNode,
    binding: TexlBinding
  ): [boolean, IFlowInfo] {
    // Contracts.AssertValue(argNode);
    // Contracts.AssertValue(binding);

    let flowInfo: IFlowInfo
    switch (argNode.kind) {
      case NodeKind.FirstName:
        return this.tryGetFlowInfoForFirstName(argNode.asFirstName(), binding)
      case NodeKind.Call:
        return this.tryGetFlowInfoForCall(argNode.asCall(), binding)
      case NodeKind.DottedName:
        return this.tryGetFlowInfoForDottedName(argNode.asDottedName(), binding)
    }

    return [false, flowInfo]
  }

  private tryGetFlowInfoForCall(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IFlowInfo] {
    // Contracts.AssertValueOrNull(callNode);
    // Contracts.AssertValue(binding);

    let flowInfo: IFlowInfo
    if (callNode == null || !binding.getType(callNode).isTable) {
      return [false, flowInfo]
    }

    const callInfo = binding.getInfo(callNode) as CallInfo
    if (callInfo == null) {
      return [false, flowInfo]
    }

    const fn = callInfo.function
    if (fn == null) {
      return [false, flowInfo]
    }

    return fn.tryGetFlowInfo(callNode, binding)
  }

  private tryGetFlowInfoForFirstName(
    firstName: FirstNameNode,
    binding: TexlBinding
  ): [boolean, IFlowInfo] {
    // Contracts.AssertValueOrNull(firstName);
    // Contracts.AssertValue(binding);

    let flowInfo: IFlowInfo
    if (firstName == null || !binding.getType(firstName).isTable) {
      return [false, flowInfo]
    }

    return binding.tryGetFlowInfo(firstName)
  }

  private tryGetFlowInfoForDottedName(
    dottedNameNode: DottedNameNode,
    binding: TexlBinding
  ): [boolean, IFlowInfo] {
    // Contracts.AssertValueOrNull(dottedNameNode);
    // Contracts.AssertValue(binding);

    let flowInfo: IFlowInfo
    if (dottedNameNode == null || !binding.hasExpandInfo(dottedNameNode)) {
      return [false, flowInfo]
    }

    return binding.tryGetFlowInfo(dottedNameNode)
  }
}
