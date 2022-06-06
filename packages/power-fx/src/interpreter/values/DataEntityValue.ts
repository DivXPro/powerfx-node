import { IRContext } from '../../ir/IRContext'
import { Control } from '../environment'
import { IValueVisitor, PrimitiveValue } from '../../public/values'
import { MetaDataEntityMetadata } from '../../meta/external/MetaDataEntityMetadata'

export class DataEntityValue extends PrimitiveValue<MetaDataEntityMetadata> {
  constructor(irContext: IRContext, value: MetaDataEntityMetadata) {
    super(irContext, value)
  }

  public visit(visitor: IValueVisitor): void {
    visitor.visit(this)
  }
}
