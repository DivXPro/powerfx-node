import { TexlBinding } from '../../binding'
import { DelegationCapability, IDelegationMetadata } from '../../functions/delegation'
import { FilterOpMetadata } from '../../functions/delegation/delegationMetadata'
import { StringGetter } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { FunctionWithTableInput } from './FunctionWithTableInput'

export abstract class FilterFunctionBase extends FunctionWithTableInput {
  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(DelegationCapability.Filter)
  }

  public get hasEcsExcemptLambdas() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor(
    name: string,
    description: StringGetter,
    fc: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number,
    ...paramTypes: DType[]
  ) {
    super(undefined, name, description, fc, returnType, maskLambdas, arityMin, arityMax, ...paramTypes)
  }

  public tryGetDelegationMetadata(node: CallNode, binding: TexlBinding): [boolean, IDelegationMetadata] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    let metadata: IDelegationMetadata = null
    // Get metadata if it's an entity.
    let entityResult = binding.tryGetEntityInfo(node.args.children[0])
    let entityInfo = entityResult[1]
    if (entityResult[0]) {
      // Contracts.AssertValue(entityInfo.ParentDataSource);
      // Contracts.AssertValue(entityInfo.ParentDataSource.DataEntityMetadataProvider);
      const metadataProvider = entityInfo.parentDataSource.dataEntityMetadataProvider
      let TryGetEntityMetadata = metadataProvider.tryGetEntityMetadata(entityInfo.identity)
      let entityMetadata = TryGetEntityMetadata[1]
      if (!TryGetEntityMetadata[0]) {
        return [false, metadata]
      }

      metadata = entityMetadata.delegationMetadata //.VerifyValue();
      return [true, metadata]
    }

    let result = super.tryGetValidDataSourceForDelegation(node, binding, this.functionDelegationCapability)
    let ds = result[1]
    if (!result[0]) {
      return [false, metadata]
    }

    metadata = ds.delegationMetadata
    return [true, metadata]
  }

  protected isValidDelegatableFilterPredicateNode(
    dsNode: TexlNode,
    binding: TexlBinding,
    filterMetadata: FilterOpMetadata,
  ) {
    // Contracts.AssertValue(dsNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(filterMetadata);

    let firstNameStrategy = super.getFirstNameNodeDelegationStrategy()
    let dottedNameStrategy = super.getDottedNameNodeDelegationStrategy()
    let cNodeStrategy = super.getCallNodeDelegationStrategy()

    let kind: NodeKind
    kind = dsNode.kind

    switch (kind) {
      case NodeKind.BinaryOp: {
        let opNode = dsNode.asBinaryOp()
        let binaryOpNodeValidationStrategy = super.getOpDelegationStrategy(opNode.op, opNode)
        // Contracts.AssertValue(opNode);

        if (!binaryOpNodeValidationStrategy.isSupportedOpNode(opNode, filterMetadata, binding)) {
          return false
        }

        break
      }

      case NodeKind.FirstName: {
        if (!firstNameStrategy.isValidFirstNameNode(dsNode.asFirstName(), binding, null)) {
          return false
        }

        break
      }

      case NodeKind.DottedName: {
        if (!dottedNameStrategy.isValidDottedNameNode(dsNode.asDottedName(), binding, filterMetadata, null)) {
          return false
        }

        break
      }

      case NodeKind.UnaryOp: {
        let opNode = dsNode.asUnaryOpLit()
        let unaryOpNodeValidationStrategy = super.getOpDelegationStrategyOfUnaryOp(opNode.op)
        // Contracts.AssertValue(opNode);

        if (!unaryOpNodeValidationStrategy.isSupportedOpNode(opNode, filterMetadata, binding)) {
          super.suggestDelegationHint(dsNode, binding)
          return false
        }

        break
      }

      case NodeKind.Call: {
        if (!cNodeStrategy.isValidCallNode(dsNode.asCall(), binding, filterMetadata)) {
          return false
        }

        break
      }

      default: {
        if (kind != NodeKind.BoolLit) {
          super.suggestDelegationHint(dsNode, binding, `Not supported node ${kind}.`)
          return false
        }

        break
      }
    }

    return true
  }
}
