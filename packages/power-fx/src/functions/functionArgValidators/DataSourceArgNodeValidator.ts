import { TexlBinding } from '../../binding/Binder'
import { BindKind } from '../../binding/BindKind'
import { CallNode, DottedNameNode, FirstNameNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { IArgValidator } from './IArgValidator'

export class DataSourceArgNodeValidator
  implements IArgValidator<Array<FirstNameNode>>
{
  public tryGetValidValue(
    argNode: TexlNode,
    binding: TexlBinding
  ): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValue(argNode);
    // Contracts.AssertValue(binding);

    let dsNodes: Array<FirstNameNode> = []
    switch (argNode.kind) {
      case NodeKind.FirstName:
        const result = this.tryGetDsNodeForFirstName(
          argNode.asFirstName(),
          binding
        )
        const dsNode = result[1]
        if (result[0]) {
          dsNodes.push(dsNode)
        }
        break
      case NodeKind.Call:
        return this.tryGetDsNodes(argNode.asCall(), binding)
      case NodeKind.DottedName:
        return this.tryGetDsNodeForDottedName(argNode.asDottedName(), binding)
    }

    return [dsNodes.length > 0, dsNodes]
  }

  private tryGetDsNodes(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValueOrNull(callNode);
    // Contracts.AssertValue(binding);

    let dsInfos: Array<FirstNameNode> = []
    if (callNode == null || !binding.getType(callNode).isAggregate) {
      return [false, dsInfos]
    }

    const callInfo = binding.getInfo(callNode)
    if (callInfo == null) {
      return [false, dsInfos]
    }

    const fn = callInfo.function
    if (fn == null) {
      return [false, dsInfos]
    }

    return fn.tryGetDataSourceNodes(callNode, binding)
  }

  private tryGetDsNodeForFirstName(
    firstName: FirstNameNode,
    binding: TexlBinding
  ): [boolean, FirstNameNode] {
    // Contracts.AssertValueOrNull(firstName);
    // Contracts.AssertValue(binding);

    let dsNode: FirstNameNode
    if (firstName == null || !binding.getType(firstName).isTable) {
      return [false, dsNode]
    }

    let firstNameInfo = binding.getInfo(firstName)
    if (firstNameInfo == null || firstNameInfo.kind != BindKind.Data) {
      return [false, dsNode]
    }

    if (
      binding.entityScope == null ||
      !binding.entityScope.tryGetEntity(firstNameInfo.name)[0]
    ) {
      return [false, dsNode]
    }

    dsNode = firstName
    return [true, dsNode]
  }

  private tryGetDsNodeForDottedName(
    dottedNameNode: DottedNameNode,
    binding: TexlBinding
  ): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValueOrNull(dottedNameNode);
    // Contracts.AssertValue(binding);

    let dsNode: Array<FirstNameNode>
    if (dottedNameNode == null || !binding.hasExpandInfo(dottedNameNode)) {
      return [false, dsNode]
    }

    return this.tryGetValidValue(dottedNameNode.left, binding)
  }
}
