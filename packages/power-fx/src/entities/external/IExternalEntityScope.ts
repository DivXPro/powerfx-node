import { FirstNameNode, TexlNode } from '../../syntax/nodes'
import { DType } from '../../types/DType'
import { DName } from '../../utils/DName'
import { IExternalCdsDataSource } from './IExternalCdsDataSource'
import { IExternalDataSource } from './IExternalDataSource'
import { IExternalEntity } from './IExternalEntity'
import { IExternalTabularDataSource } from './IExternalTabularDataSource'

export interface IExternalEntityScope {
  tryGetDataSourceInfo(node: TexlNode): [boolean, IExternalDataSource]
  tryGetNamedEnum: (identName: DName) => [boolean, DType]
  tryGetCdsDataSourceWithLogicalName: (
    datasetName: string,
    expandInfoIdentity: string,
  ) => [boolean, IExternalCdsDataSource]
  getTabularDataSource(identName: string): IExternalTabularDataSource
  tryGetEntity<T>(currentEntityEntityName: DName): [boolean, T]
}

export class IExternalEntityScopeExtensions {
  // from FunctionUtils.TryGetDataSource
  public static TryGetDataSource(entityScope: IExternalEntityScope, node: TexlNode): [boolean, IExternalCdsDataSource] {
    // Contracts.AssertValue(entityScope);
    // Contracts.AssertValue(node);

    let firstNameNode: FirstNameNode
    if ((firstNameNode = node.asFirstName()) == null) {
      return [false, undefined]
    }

    return entityScope.tryGetEntity(firstNameNode.ident.name)
  }
}
