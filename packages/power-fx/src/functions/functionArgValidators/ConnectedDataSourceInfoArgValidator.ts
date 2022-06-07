import { TexlBinding } from '../../binding/Binder'
import { CallInfo } from '../../binding/bindingInfo'
import { BindKind } from '../../binding/BindKind'
import { IExternalDataSource } from '../../entities/external/IExternalDataSource'
import { CallNode, DottedNameNode, FirstNameNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { IArgValidator } from './IArgValidator'

export class DelegatableDataSourceInfoValidator
  implements IArgValidator<IExternalDataSource>
{
  public tryGetValidValue(
    argNode: TexlNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValue(argNode);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    switch (argNode.kind) {
      case NodeKind.FirstName:
        return this.tryGetDsInfoForFirstName(argNode.asFirstName(), binding)
      case NodeKind.Call:
        return this.tryGetDsInfoForCall(argNode.asCall(), binding)
      case NodeKind.DottedName:
        return this.tryGetDsInfoForDottedName(argNode.asDottedName(), binding)
      case NodeKind.As:
        return this.tryGetValidValue(argNode.asAsNode().left, binding)
    }

    return [false, dsInfo]
  }

  private tryGetDsInfoForCall(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValueOrNull(callNode);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    if (
      callNode == null ||
      !binding.isDelegatable(callNode) ||
      !binding.getType(callNode).isTable
    ) {
      return [false, dsInfo]
    }

    const callInfo = binding.getInfo(callNode) as CallInfo
    if (callInfo == null) {
      return [false, dsInfo]
    }

    const fn = callInfo.function
    if (fn == null) {
      return [false, dsInfo]
    }

    const success = fn.tryGetDataSource(callNode, binding)
    // dsInfo = (IExternalDataSource)external;
    return success
  }

  private tryGetDsInfoForFirstName(
    firstName: FirstNameNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValueOrNull(firstName);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    if (firstName == null || !binding.getType(firstName).isTable) {
      return [false, dsInfo]
    }

    let firstNameInfo = binding.getInfo(firstName)
    if (firstNameInfo == null || firstNameInfo.kind != BindKind.Data) {
      return [false, dsInfo]
    }

    return (
      binding.entityScope != null &&
      binding.entityScope.tryGetEntity<IExternalDataSource>(firstNameInfo.name)
    )
  }

  private tryGetDsInfoForDottedName(
    dottedNameNode: DottedNameNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValueOrNull(dottedNameNode);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    if (dottedNameNode == null || !binding.hasExpandInfo(dottedNameNode)) {
      return [false, dsInfo]
    }

    const result = binding.tryGetEntityInfo(dottedNameNode)
    const info = result[1]
    dsInfo = info.parentDataSource
    return [true, dsInfo]
  }
}
