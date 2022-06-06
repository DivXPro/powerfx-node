// import { DataFormat } from '../app/DataFormat'
// import { DataColumnMetadata } from '../entities/DataColumnMetadata'
// import { DataTableMetadata } from '../entities/DataTableMetadata'
// import { IExternalColumnMetadata } from '../entities/IExternalColumnMetadata'
// import { IExternalTableMetadata } from '../entities/IExternalTableMetadata'
// import { IExternalTabularDataSource } from '../entities/IExternalTabularDataSource'
// import { TexlStrings } from '../localization'
// import { DottedNameNode, FirstNameNode } from '../syntax'
// import { NodeKind } from '../syntax/NodeKind'
// import { DType } from '../types/DType'
// import { DName } from '../utils/DName'
// import { TexlBinding, Visitor } from './Binder'
// import { DottedNameInfo, FirstNameInfo } from './bindingInfo'
// import { INameResolver } from './INameResolver'

// export class BinderNodesMetadataArgTypeVisitor extends Visitor {
//   constructor(binding: TexlBinding, resolver: INameResolver, topScope: DType, useThisRecordForRuleScope: boolean) {
//     // Contracts.AssertValue(binding);
//     super(binding, resolver, topScope, useThisRecordForRuleScope)
//     this._txb = binding
//   }

//   private isColumnMultiChoice(columnMetadata: IExternalColumnMetadata): boolean {
//     // Contracts.AssertValue(columnMetadata);

//     return columnMetadata?.dataFormat == DataFormat.Lookup
//   }

//   public postVisit(node: DottedNameNode) {
//     // Contracts.AssertValue(node);

//     let lhsType: DType = this._txb.getType(node.left)
//     let typeRhs: DType = DType.Invalid
//     let nameRhs: DName = node.right.name
//     let firstNameInfo: FirstNameInfo
//     let firstNameNode: FirstNameNode
//     let tableMetadata: IExternalTableMetadata
//     let nodeType: DType = DType.Unknown

//     if (node.left.kind != NodeKind.FirstName && node.left.kind != NodeKind.DottedName) {
//       this.setDottedNameError(node, TexlStrings.ErrInvalidName)
//       return
//     }

//     nameRhs = this.getLogicalNodeNameAndUpdateDisplayNames(lhsType, node.right)

//     const result = lhsType.tryGetType(nameRhs)
//     typeRhs = result[1]

//     if (!result[0]) {
//       this.setDottedNameError(node, TexlStrings.ErrInvalidName)
//       return
//     }

//     // There are two cases:
//     // 1. RHS could be an option set.
//     // 2. RHS could be a data entity.
//     // 3. RHS could be a column name and LHS would be a datasource.
//     if (typeRhs.isOptionSet) {
//       nodeType = typeRhs
//     } else if (typeRhs.isExpandEntity) {
//       const entityInfo = typeRhs.expandInfo
//       // Contracts.AssertValue(entityInfo);

//       let entityPath: string = ''
//       if (lhsType.hasExpandInfo) entityPath = lhsType.expandInfo.expandPath.toString()

//       let expandedEntityType: DType = this.getExpandedEntityType(typeRhs, entityPath)

//       let parentDataSource = entityInfo.parentDataSource
//       let metadata = new DataTableMetadata(parentDataSource.name, parentDataSource.name)
//       nodeType = DType.CreateMetadataType(
//         new DataColumnMetadata({ name: typeRhs.expandInfo.name, type: expandedEntityType, tableMetadata: metadata }),
//       )
//     } else if (
//       (firstNameNode = node.left.asFirstName()) != null &&
//       (firstNameInfo = this._txb.getInfo(firstNameNode)) != null
//     ) {
//       const tabularDataSourceInfo = firstNameInfo.data as IExternalTabularDataSource
//       tableMetadata = tabularDataSourceInfo?.tableMetadata
//       if (tableMetadata == null) {
//         this.setDottedNameError(node, TexlStrings.ErrInvalidName)
//         return
//       }
//       const rst = tableMetadata.tryGetColumn(nameRhs.value)
//       const columnMetadata = rst[1]
//       if (!rst[0] || !this.isColumnMultiChoice(columnMetadata)) {
//         this.setDottedNameError(node, TexlStrings.ErrInvalidName)
//         return
//       }

//       const metadata = new DataTableMetadata(tabularDataSourceInfo.name, tableMetadata.displayName)
//       nodeType = DType.CreateMetadataType(new DataColumnMetadata({ columnMetadata, tableMetadata: metadata }))
//     } else {
//       this.setDottedNameError(node, TexlStrings.ErrInvalidName)
//       return
//     }

//     // Contracts.AssertValid(nodeType)

//     this._txb.setType(node, nodeType)
//     this._txb.setInfoDottedName(node, new DottedNameInfo(node))
//   }
// }

export { BinderNodesMetadataArgTypeVisitor } from './Binder'
