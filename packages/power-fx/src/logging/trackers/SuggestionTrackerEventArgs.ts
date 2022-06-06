import { TexlBinding } from '../../binding/Binder'
import { TexlNode } from '../../syntax'

export interface IAddSuggestionMessageEventArgs {
  message: string
  node: TexlNode
  binding: TexlBinding
}

export class AddSuggestionMessageEventArgs implements IAddSuggestionMessageEventArgs {
  public message: string
  public node: TexlNode
  public binding: TexlBinding

  constructor(message: string, node: TexlNode, binding: TexlBinding) {
    // Contracts.AssertValue(message)
    // Contracts.AssertValue(node)
    // Contracts.AssertValue(binding)

    this.message = message
    this.node = node
    this.binding = binding
  }
}
