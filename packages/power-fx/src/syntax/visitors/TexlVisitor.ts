import { LeafNodeType, NonLeafNodeType } from './types'

export abstract class TexlVisitor {
  // Visit methods for leaf node types.
  public abstract visit(leafNode: LeafNodeType): void
  // public abstract visit(node: ErrorNode): void;
  // public abstract visit(node: BlankNode): void;
  // public abstract visit(node: BoolLitNode): void;
  // public abstract visit(node: StrLitNode): void;
  // public abstract visit(node: NumLitNode): void;
  // public abstract visit(node: FirstNameNode): void;
  // public abstract visit(node: ParentNode): void;
  // public abstract visit(node: SelfNode): void;
  // public abstract visit(node: ReplaceableNode): void;

  // Visit methods for non-leaf node types.
  // If PreVisit returns true, the children are visited and PostVisit is called.
  public preVisit(node: NonLeafNodeType): boolean {
    return true
  }
  // public preVisit(nodeL: UnaryOpNode): boolean { return true; }
  // public preVisit(node: BinaryOpNode): boolean { return true; }
  // public preVisit(node: VariadicOpNode): boolean { return true; }
  // public preVisit(node: CallNode): boolean { return true; }
  // public preVisit(node: ListNode): boolean { return true; }
  // public preVisit(node: RecordNode): boolean { return true; }
  // public preVisit(node: TableNode): boolean { return true; }
  // public preVisit(node: AsNode): boolean { return true; }

  public abstract postVisit(node: NonLeafNodeType): void
  // public abstract void postVisit(UnaryOpNode node);
  // public abstract void postVisit(BinaryOpNode node);
  // public abstract void postVisit(VariadicOpNode node);
  // public abstract void postVisit(CallNode node);
  // public abstract void postVisit(ListNode node);
  // public abstract void postVisit(RecordNode node);
  // public abstract void postVisit(TableNode node);
  // public abstract void postVisit(AsNode node);
}
