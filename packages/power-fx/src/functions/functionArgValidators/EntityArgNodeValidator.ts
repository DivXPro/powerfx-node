import { TexlBinding } from '../../binding/Binder'
import { CallInfo } from '../../binding/bindingInfo'
import { CallNode, DottedNameNode, FirstNameNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { IExpandInfo } from '../../types/IExpandInfo'
import { IArgValidator } from './IArgValidator'

export class EntityArgNodeValidator implements IArgValidator<IExpandInfo> {
  public tryGetValidValue(argNode: TexlNode, binding: TexlBinding): [boolean, IExpandInfo] {
    // Contracts.AssertValue(argNode);
    // Contracts.AssertValue(binding);

    let entityInfo: IExpandInfo
    switch (argNode.kind) {
      case NodeKind.FirstName:
        return this.tryGetEntityInfoForFirstName(argNode.asFirstName(), binding)
      case NodeKind.Call:
        return this.tryGetEntityInfoForCall(argNode.asCall(), binding)
      case NodeKind.DottedName:
        return this.tryGetEntityInfoForDottedName(argNode.asDottedName(), binding)
    }

    return [false, entityInfo]
  }

  private tryGetEntityInfoForCall(callNode: CallNode, binding: TexlBinding): [boolean, IExpandInfo] {
    // Contracts.AssertValueOrNull(callNode);
    // Contracts.AssertValue(binding);

    let entityInfo: IExpandInfo
    if (callNode == null || !binding.getType(callNode).isTable) {
      return [false, entityInfo]
    }

    const callInfo = binding.getInfo(callNode) as CallInfo
    if (callInfo == null) {
      return [false, entityInfo]
    }

    const fn = callInfo.function
    if (fn == null) {
      return [false, entityInfo]
    }

    return fn.tryGetEntityInfo(callNode, binding)
  }

  private tryGetEntityInfoForFirstName(firstName: FirstNameNode, binding: TexlBinding): [boolean, IExpandInfo] {
    // Contracts.AssertValueOrNull(firstName);
    // Contracts.AssertValue(binding);

    let entityInfo: IExpandInfo
    if (firstName == null || !binding.getType(firstName).isTable) {
      return [false, entityInfo]
    }

    return binding.tryGetEntityInfo(firstName)
  }

  private tryGetEntityInfoForDottedName(dottedNameNode: DottedNameNode, binding: TexlBinding): [boolean, IExpandInfo] {
    // Contracts.AssertValueOrNull(dottedNameNode);
    // Contracts.AssertValue(binding);

    let entityInfo: IExpandInfo
    if (dottedNameNode == null || !binding.hasExpandInfo(dottedNameNode)) {
      return [false, entityInfo]
    }

    return binding.tryGetEntityInfo(dottedNameNode)
  }
}
