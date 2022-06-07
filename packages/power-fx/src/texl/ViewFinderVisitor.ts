import { TexlBinding } from '../binding'
import { DottedNameNode } from '../syntax'
import { TexlVisitor } from '../syntax/visitors'
import { LeafNodeType, NonLeafNodeType } from '../syntax/visitors/types'
import { DKind } from '../types/DKind'

export class ViewFinderVisitor extends TexlVisitor {
  private readonly _txb: TexlBinding
  public ContainsView: boolean // { get; private set; }

  constructor(binding: TexlBinding) {
    super()
    // Contracts.AssertValue(binding);
    this._txb = binding
  }

  public visit(leafNode: LeafNodeType) {}
  public postVisit(node: NonLeafNodeType) {
    if (node instanceof DottedNameNode) {
      let argType = this._txb.getType(node)
      if (argType.kind == DKind.ViewValue) {
        this.ContainsView = true
      }
    }
  }

  // public void PostVisit(DottedNameNode node) {
  //   let argType = _txb.GetType(node);
  //   if (argType.Kind == DKind.ViewValue) {
  //     ContainsView = true;
  //   }
  // }

  // public void Visit(FirstNameNode node) {
  // }

  // public void PostVisit(CallNode node) {
  // }

  // public void PostVisit(VariadicOpNode node) {
  // }

  // public void PostVisit(RecordNode node) {
  // }

  // public void PostVisit(ListNode node) {
  // }

  // public void PostVisit(BinaryOpNode node) {
  // }

  // public void PostVisit(UnaryOpNode node) {
  // }

  // public void PostVisit(TableNode node) {
  // }

  // public void PostVisit(AsNode node) {
  // }

  // public void Visit(ParentNode node) {
  // }

  // public void Visit(NumLitNode node) {
  // }

  // public void Visit(ReplaceableNode node) {
  // }

  // public void Visit(StrLitNode node) {
  // }

  // public void Visit(BoolLitNode node) {
  // }

  // public void Visit(BlankNode node) {
  // }

  // public void Visit(ErrorNode node) {
  // }

  // public void Visit(SelfNode node) {
  // }
}
