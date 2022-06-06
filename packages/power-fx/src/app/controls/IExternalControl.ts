import { IExternalEntity } from '../../entities/external/IExternalEntity'
import { DType } from '../../types/DType'
import { IExternalControlType } from '../../types/IExternalControlType'
import { DName } from '../../utils/DName'
import { IExternalControlTemplate } from './IExternalControlTemplate'
import { IExternalRule } from './IExternalRule'
import { Control } from '../../interpreter/environment/Control'
import { MetaFieldControl } from '../../meta/MetaFieldControl'

export interface IExternalControl extends IExternalEntity {
  isDataComponentDefinition: boolean
  isDataComponentInstance: boolean
  template: IExternalControlTemplate
  isComponentControl: boolean
  topParentOrSelf: IExternalControl
  displayName: string
  isReplicable: boolean
  isAppInfoControl: boolean
  thisItemType: DType
  isAppGlobalControl: boolean
  uniqueId: string
  isComponentInstance: boolean
  isComponentDefinition: boolean
  isCommandComponentInstance: boolean
  isFormComponent: boolean
  getControlDType(): IExternalControlType
  getControlDType(calculateAugmentedExpandoType: boolean, isDataLimited: boolean): IExternalControlType
  isDescendentOf(controlInfo: IExternalControl): boolean
  getRule(propertyInvariantName: string): IExternalRule
  tryGetRule(dName: string | DName): [boolean, IExternalRule]
}

export function IsIExternalControl(data: any): data is IExternalControl {
  return data instanceof MetaFieldControl || data instanceof Control
}
