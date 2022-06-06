import { IExternalControl } from '../app/controls/IExternalControl'
import { IExternalControlProperty } from '../app/controls/IExternalControlProperty'
import { TexlBinding } from '../binding/Binder'
import { TexlFunction } from '../functions/TexlFunction'
import { IBinderGlue } from './BinderGlue'

// $$$ Everything in this file should get removed.
export class Glue2DocumentBinderGlue implements IBinderGlue {
  isDataComponentDefinition(lookupInfoData: any): boolean {
    throw new Error('Method not implemented.')
  }
  isComponentDataSource(lookupInfoData: any): boolean {
    throw new Error('Method not implemented.')
  }
  isDataComponentInstance(lookupInfoData: any): boolean {
    throw new Error('Method not implemented.')
  }
  tryGetCdsDataSourceByBind(lhsInfoData: any): [boolean, IExternalControl] {
    throw new Error('Method not implemented.')
  }
  isDynamicDataSourceInfo(lookupInfoData: any): boolean {
    return false // TODO:
  }
  canControlBeUsedInComponentProperty(binding: TexlBinding, control: IExternalControl): boolean {
    throw new Error('Method not implemented.')
  }
  getVariableScopedControlFromTexlBinding(txb: TexlBinding): IExternalControl {
    throw new Error('Method not implemented.')
  }
  isComponentScopedPropertyFunction(infoFunction: TexlFunction): boolean {
    return false
  }
  isPrimaryCommandComponentProperty(externalControlProperty: IExternalControlProperty): boolean {
    throw new Error('Method not implemented.')
  }
  isContextProperty(externalControlProperty: IExternalControlProperty): boolean {
    throw new Error('Method not implemented.')
  }
}
