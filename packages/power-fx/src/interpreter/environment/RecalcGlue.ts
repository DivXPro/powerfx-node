import { Glue2DocumentBinderGlue } from '../../glue/Glue'
import { TexlBinding } from '../../binding'
import { IExternalControl } from '../../app/controls/IExternalControl'

export class RecalcGlue extends Glue2DocumentBinderGlue {
  public canControlBeUsedInComponentProperty(binding: TexlBinding, control: IExternalControl) {
    return true
  }
}
