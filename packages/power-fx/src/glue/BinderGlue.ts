import { IExternalControl } from '../app/controls/IExternalControl'
import { IExternalControlProperty } from '../app/controls/IExternalControlProperty'
import { TexlBinding } from '../binding/Binder'
import { TexlFunction } from '../functions/TexlFunction'

export interface IBinderGlue {
  isDataComponentDefinition(lookupInfoData: any): boolean
  isComponentDataSource(lookupInfoData: any): boolean
  isDataComponentInstance(lookupInfoData: any): boolean
  tryGetCdsDataSourceByBind(lhsInfoData: any): [boolean, IExternalControl]
  isDynamicDataSourceInfo(lookupInfoData: any): boolean
  canControlBeUsedInComponentProperty(binding: TexlBinding, control: IExternalControl): boolean
  getVariableScopedControlFromTexlBinding(txb: TexlBinding): IExternalControl
  isComponentScopedPropertyFunction(infoFunction: TexlFunction): boolean
  isPrimaryCommandComponentProperty(externalControlProperty: IExternalControlProperty): boolean
  isContextProperty(externalControlProperty: IExternalControlProperty): boolean
}
