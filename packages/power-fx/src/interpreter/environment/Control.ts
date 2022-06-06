import { IExternalControl } from '../../app/controls/IExternalControl'
import { DName } from '../../utils'
import { DType, IExternalControlType } from '../../types'
import { IExternalRule } from '../../app/controls/IExternalRule'
import { ControlTemplate } from './ControlTemplate'

export interface IControlProps {
  displayName: string
  entityName: DName
  template: ControlTemplate
  type?: DType
  uniqueId: string
  top?: Control
  isAppGlobalControl?: boolean
  isAppInfoControl?: boolean
  isCommandComponentInstance?: boolean
  isComponentControl?: boolean
  isComponentDefinition?: boolean
  isComponentInstance?: boolean
  isDataComponentDefinition?: boolean
  isDataComponentInstance?: boolean
  isReplicable?: boolean
}

export class Control implements IExternalControl {
  displayName: string
  entityName: DName
  template: ControlTemplate
  thisItemType: DType
  topParentOrSelf: Control
  uniqueId: string
  isAppGlobalControl: boolean
  isAppInfoControl: boolean
  isCommandComponentInstance: boolean
  isComponentControl: boolean
  isComponentDefinition: boolean
  isComponentInstance: boolean
  isDataComponentDefinition: boolean
  isDataComponentInstance: boolean
  isReplicable: boolean
  isFormComponent: boolean

  constructor(props: IControlProps) {
    this.displayName = props.displayName
    this.entityName = props.entityName
    this.template = props.template
    this.topParentOrSelf = props.top ?? this
    this.thisItemType = this.topParentOrSelf.thisItemType ?? props.type
    this.isAppGlobalControl = props.isAppInfoControl
    this.isCommandComponentInstance = props.isCommandComponentInstance
    this.isComponentControl = props.isComponentControl
    this.isComponentDefinition = props.isComponentDefinition
    this.isComponentInstance = props.isComponentInstance
    this.isDataComponentDefinition = props.isDataComponentDefinition
    this.isReplicable = props.isReplicable
  }

  getControlDType(): IExternalControlType
  getControlDType(calculateAugmentedExpandoType: boolean, isDataLimited: boolean): IExternalControlType
  getControlDType(calculateAugmentedExpandoType?: boolean, isDataLimited?: boolean): IExternalControlType {
    return undefined
  }

  getRule(propertyInvariantName: string): IExternalRule {
    return undefined
  }

  isDescendentOf(controlInfo: IExternalControl): boolean {
    return false
  }

  tryGetRule(dName: string | DName): [boolean, IExternalRule] {
    return [false, undefined]
  }
}
