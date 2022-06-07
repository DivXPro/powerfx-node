import { TexlBinding } from '../../binding/Binder'
import { BindKind } from '../../binding/BindKind'
import { TrackingProvider } from '../../logging/trackers'
import {
  DottedNameNode,
  FirstNameNode,
  StrLitNode,
  TexlNode,
} from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DName } from '../../utils/DName'
import { LanguageConstants } from '../../utils/LanguageConstants'
import { IArgValidator } from './IArgValidator'

export class SortOrderValidator implements IArgValidator<string> {
  public tryGetValidValue(
    argNode: TexlNode,
    binding: TexlBinding
  ): [boolean, string] {
    return this.tryGetValidSortOrder(argNode, binding)
  }

  private tryGetValidSortOrder(
    argNode: TexlNode,
    binding: TexlBinding
  ): [boolean, string] {
    // Contracts.AssertValue(argNode);
    // Contracts.AssertValue(binding);

    let validatedOrder = ''
    if (binding.errorContainer.hasErrors(argNode)) {
      return [false, validatedOrder]
    }

    switch (argNode.kind) {
      case NodeKind.FirstName:
        return this.tryGetValidSortOrderNodeForFirstName(
          argNode.asFirstName(),
          binding
        )
      case NodeKind.DottedName:
        return this.tryGetValidSortOrderNodeForDottedName(
          argNode.asDottedName(),
          binding
        )
      case NodeKind.StrLit:
        return this.TryGetValidSortOrderNodeForStrLit(argNode.asStrLit())
      default:
        TrackingProvider.Instance.addSuggestionMessage(
          'Invalid sortorder node type',
          argNode,
          binding
        )
        return [false, validatedOrder]
    }
  }

  private isValidOrderString(order: string): [boolean, string] {
    // Contracts.AssertValue(order);

    let validatedSortOrder = ''
    order = order.toLowerCase()
    if (
      order != LanguageConstants.AscendingSortOrderString &&
      order != LanguageConstants.DescendingSortOrderString
    ) {
      return [false, validatedSortOrder]
    }

    validatedSortOrder = order
    return [true, validatedSortOrder]
  }

  private tryGetValidSortOrderNodeForDottedName(
    node: DottedNameNode,
    binding: TexlBinding
  ): [boolean, string] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    let sortOrder = ''
    const lhsNode = node.left
    const orderEnum = lhsNode.asFirstName()
    if (orderEnum == null) {
      return [false, sortOrder]
    }

    // Verify order enum
    if (!this.verifyFirstNameNodeIsValidSortOrderEnum(orderEnum, binding)) {
      return [false, sortOrder]
    }

    let order = node.right.name.value
    return this.isValidOrderString(order)
  }

  private tryGetValidSortOrderNodeForFirstName(
    node: FirstNameNode,
    binding: TexlBinding
  ): [boolean, string] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    let sortOrder = ''
    const info = binding.getInfo(node)
    if (info.kind != BindKind.Enum) {
      return [false, sortOrder]
    }

    if (typeof info.data !== 'string') {
      return [false, sortOrder]
    }

    const order = info.data

    return this.isValidOrderString(order)
  }

  private TryGetValidSortOrderNodeForStrLit(
    node: StrLitNode
  ): [boolean, string] {
    // Contracts.AssertValue(node);

    const order = node.value
    return this.isValidOrderString(order)
  }

  private verifyFirstNameNodeIsValidSortOrderEnum(
    node: FirstNameNode,
    binding: TexlBinding
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    const firstNameInfo = binding.getInfo(node)
    if (firstNameInfo == null || firstNameInfo.kind != BindKind.Enum) {
      return false
    }

    const result = binding.nameResolver.tryLookupEnum(
      new DName(LanguageConstants.SortOrderEnumStringInvariant)
    )
    const lookupInfo = result[1]
    if (!result[0]) {
      return false
    }

    let type = binding.getType(node)

    return type == lookupInfo.type
  }
}
