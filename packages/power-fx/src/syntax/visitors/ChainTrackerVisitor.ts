import { TexlNode, VariadicOpNode } from '../nodes'
import { VariadicOp } from '../../lexer/VariadicOp'
import { IdentityTexlVisitor } from './IdentityTexlVisitor'

export class ChainTrackerVisitor extends IdentityTexlVisitor {
  private usesChains: boolean

  constructor() {
    super()
    this.usesChains = false
  }

  public static Run(node: TexlNode): boolean {
    const visitor = new ChainTrackerVisitor()
    node.accept(visitor)
    return visitor.usesChains
  }

  public visit(node: TexlNode) {
    super.visit(node)
  }

  public preVisitnode(node: VariadicOpNode): boolean {
    if (node.op === VariadicOp.Chain) {
      this.usesChains = true
      return false
    }
    return true
  }
}
