/// <summary>
/// A base visitor for when you want a default result for most nodes.

import { TexlNode } from '../nodes'
import { NodeKind } from '../NodeKind'
import { TexlFunctionalVisitor } from './TexlFunctionalVisitor'

/// </summary>
export abstract class DefaultVisitor<Result, Context> extends TexlFunctionalVisitor<Result, Context> {
  private defaultValue: Result

  public get default(): Result {
    return this.defaultValue
  }

  constructor(defaultValue: Result) {
    super()
    this.defaultValue = defaultValue
  }

  public visit(node: TexlNode, context: Context) {
    switch (node.kind) {
      case NodeKind.Error:
        return this.default
      default:
        return this.default
    }
  }
}
