import { IRContext } from '../../ir/IRContext'
import { Control } from '../environment'
import { IValueVisitor, PrimitiveValue } from '../../public/values'
import { MetaDataEntityMetadata } from '../../meta/external/MetaDataEntityMetadata'
import { MetaFlowMetadata } from '../../meta/external/MetaFlowMetadata'

export class FlowValue extends PrimitiveValue<MetaFlowMetadata> {
  constructor(irContext: IRContext, value: MetaFlowMetadata) {
    super(irContext, value)
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
