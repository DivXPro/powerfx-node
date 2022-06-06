import {
  BinaryOpNode,
  BoolLitNode,
  NumLitNode,
  StrLitNode,
  TexlNode,
  UnaryOpNode,
  VariadicOpNode,
  ParentNode,
  SelfNode,
  StrInterpNode,
} from '../syntax/nodes'
import { IdentityTexlVisitor } from '../syntax/visitors'
import { NodeKind } from '../syntax/NodeKind'

export class BinderNodesVisitor extends IdentityTexlVisitor {
  private readonly _binaryOperators: Array<BinaryOpNode>
  public get binaryOperators() {
    return this._binaryOperators
  }

  private readonly _variadicOperators: Array<VariadicOpNode>
  public get variadicOperators() {
    return this._variadicOperators
  }

  private readonly _stringInterpolations: Array<StrInterpNode>
  public get stringInterpolations() {
    return this._stringInterpolations
  }

  private readonly _booleanLiterals: Array<BoolLitNode>
  public get booleanLiterals() {
    return this._booleanLiterals
  }

  private readonly _numericLiterals: Array<NumLitNode>
  public get numericLiterals() {
    return this._numericLiterals
  }

  private readonly _stringLiterals: Array<StrLitNode>
  public get stringLiterals() {
    return this._stringLiterals
  }

  private readonly _keywords: Set<NodeKind>
  // Parent, Self, and ThisItem keywords.
  public get keywords() {
    return this._keywords
  }

  private readonly _unaryOperators: Array<UnaryOpNode>
  public get unaryOperators() {
    return this._unaryOperators
  }

  constructor(node: TexlNode) {
    // Contracts.AssertValue(node);
    super()
    this._binaryOperators = []
    this._variadicOperators = []
    this._booleanLiterals = []
    this._numericLiterals = []
    this._stringLiterals = []
    this._keywords = new Set()
    this._unaryOperators = []
    this._stringInterpolations = []
  }

  public postVisit(node: BinaryOpNode | VariadicOpNode | UnaryOpNode) {
    // Contracts.AssertValue(node);
    if (node instanceof BinaryOpNode) {
      this._binaryOperators.push(node)
    } else if (node instanceof VariadicOpNode) {
      this._variadicOperators.push(node)
    } else if (node instanceof UnaryOpNode) {
      this._unaryOperators.push(node)
    }
  }

  public visit(node: BoolLitNode | NumLitNode | StrLitNode | ParentNode | SelfNode) {
    // Contracts.AssertValue(node);
    if (node instanceof BoolLitNode) {
      this._booleanLiterals.push(node)
    } else if (node instanceof NumLitNode) {
      this._numericLiterals.push(node)
    } else if (node instanceof StrLitNode) {
      this._stringLiterals.push(node)
    } else if (node instanceof ParentNode) {
      this._keywords.add(node.kind)
    } else if (node instanceof SelfNode) {
      this._keywords.add(node.kind)
    }
  }

  public static Run(node: TexlNode): BinderNodesVisitor {
    // Contracts.AssertValue(node)

    const instance = new BinderNodesVisitor(node)
    node.accept(instance)

    return instance
  }
}
