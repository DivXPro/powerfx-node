import {
  DottedNameNode,
  UnaryOpNode,
  BinaryOpNode,
  VariadicOpNode,
  CallNode,
  ListNode,
  RecordNode,
  TableNode,
  AsNode,
} from '../nodes'
import { DefaultVisitor } from './DefaultVisitor'
import { NonLeafNodeType } from './types'

/// <summary>
/// A base visitor for returning results that can be easily aggregated (lists, booleans, sums).
/// </summary>
export abstract class AggregateVisitor<TResult, TContext> extends DefaultVisitor<TResult, TContext> {
  constructor(defaultValue: TResult) {
    super(defaultValue)
  }

  protected abstract aggregate(results: Array<TResult | (() => TResult)>): TResult

  // private *lazily(...actions: Array<() => TResult>) {
  //   for (const action of actions) {
  //     yield action()
  //   }
  // }

  public visit(node: NonLeafNodeType, context: TContext): TResult {
    if (node instanceof DottedNameNode) {
      return node.left.acceptResult(this, context)
    }
    if (node instanceof UnaryOpNode) {
      return node.child.acceptResult(this, context)
    }
    if (node instanceof BinaryOpNode) {
      return this.aggregate([() => node.left.acceptResult(this, context), () => node.right.acceptResult(this, context)])
    }
    if (node instanceof VariadicOpNode) {
      return this.aggregate(node.children.map((child) => child.acceptResult(this, context)))
    }
    if (node instanceof CallNode) {
      return node.args.acceptResult(this, context)
    }
    if (node instanceof ListNode) {
      return this.aggregate(node.children.map((child) => child.acceptResult(this, context)))
    }
    if (node instanceof RecordNode) {
      return this.aggregate(node.children.map((child) => child.acceptResult(this, context)))
    }
    if (node instanceof TableNode) {
      return this.aggregate(node.children.map((child) => child.acceptResult(this, context)))
    }
    if (node instanceof AsNode) {
      return node.left.acceptResult(this, context)
    }
  }
}
