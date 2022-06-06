import { TexlVisitor } from './TexlVisitor'
import { LeafNodeType, NonLeafNodeType } from './types'

// Identity visitor
export abstract class IdentityTexlVisitor extends TexlVisitor {
  public visit(node: LeafNodeType) {}
  public postVisit(node: NonLeafNodeType) {}
}
