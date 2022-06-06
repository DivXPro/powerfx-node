import { TexlBinding } from '../../../binding/Binder'
import { TexlNode } from '../../../syntax'
import { DPath } from '../../../utils/DPath'
import { OperationCapabilityMetadata } from '../OperationCapabilityMetadata'

export interface IOpDelegationStrategy {
  isOpSupportedByColumn(
    metadata: OperationCapabilityMetadata,
    column: TexlNode,
    columnPath: DPath,
    binder: TexlBinding,
  ): boolean

  isOpSupportedByTable(metadata: OperationCapabilityMetadata, node: TexlNode, binder: TexlBinding): boolean

  isSupportedOpNode(node: TexlNode, metadata: OperationCapabilityMetadata, binding: TexlBinding): boolean
}
