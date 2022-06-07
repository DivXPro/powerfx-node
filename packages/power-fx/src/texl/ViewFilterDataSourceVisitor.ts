import { TexlBinding } from '../binding'
import { DataSourceKind } from '../entities/DataSourceKind'
import { IExternalCdsDataSource } from '../entities/external/IExternalCdsDataSource'
import { CallNode, FirstNameNode } from '../syntax/nodes'
import { TexlVisitor } from '../syntax/visitors'
import { LeafNodeType, NonLeafNodeType } from '../syntax/visitors/types'
import { DKind } from '../types/DKind'

export class ViewFilterDataSourceVisitor extends TexlVisitor {
  private readonly FilterFunctionName = 'Filter'
  private readonly _txb: TexlBinding

  public CdsDataSourceInfo: IExternalCdsDataSource

  public ContainsViewFilter: boolean

  constructor(binding: TexlBinding) {
    // Contracts.AssertValue(binding);
    super()
    this._txb = binding
  }

  public visit(leafNode: LeafNodeType) {
    if (leafNode instanceof FirstNameNode) {
      let TryGetDataSource =
        this._txb.entityScope.tryGetDataSourceInfo(leafNode)
      let info = TryGetDataSource[1]
      if (TryGetDataSource[0] && info.kind == DataSourceKind.CdsNative) {
        this.CdsDataSourceInfo = info as IExternalCdsDataSource
      }
    }
  }
  public postVisit(node: NonLeafNodeType) {
    if (node instanceof CallNode) {
      // let argType = this._txb.getType(node)
      // if (argType.kind == DKind.ViewValue) {
      //   this.ContainsView = true
      // }

      if (node?.head?.name.value == this.FilterFunctionName) {
        for (let arg of node.args.children) {
          let argType = this._txb.getType(arg)
          if (argType.kind == DKind.ViewValue) {
            this.ContainsViewFilter = true
          }
        }
      }
    }
  }

  // public void Visit(FirstNameNode node) {
  //   if (_txb.EntityScope.TryGetDataSource(node, out let info) && info.Kind == DataSourceKind.CdsNative)
  //   {
  //     CdsDataSourceInfo = info as IExternalCdsDataSource;
  //   }
  // }

  // public void PostVisit(CallNode node) {
  //   // Check if there is a filter node using view.
  //   if (node?.Head?.Name.Value == FilterFunctionName) {
  //     foreach(let arg in node.Args.Children)
  //     {
  //       let argType = _txb.GetType(arg);
  //       if (argType.Kind == DKind.ViewValue) {
  //         ContainsViewFilter = true;
  //       }
  //     }
  //   }
  // }

  // public void PostVisit(DottedNameNode node) {
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
