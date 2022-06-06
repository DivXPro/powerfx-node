import { IExternalControlTemplate } from '../../app/controls/IExternalControlTemplate'
import { ComponentType } from '../../app/components/ComponentType'
import { DName } from '../../utils'
import { PropertyRuleCategory } from '../../app/controls/PropertyRuleCategory'
import { ControlProperty } from './ControlProperty'
import { IExternalControlProperty } from '../../app/controls/IExternalControlProperty'

export interface IControlTemplateProps {
  componentType?: ComponentType
  expandoProperties?: ControlProperty[]
  nestedAwareTableOutputs?: DName[]
  primaryOutputProperty?: ControlProperty
  thisItemInputInvariantName?: string
  hasExpandoProperties?: boolean
  includesThisItemInSpecificProperty?: boolean
  isCommandComponent?: boolean
  isComponent?: boolean
  isMetaLoc?: boolean
  replicatesNestedControls?: boolean
}

export class ControlTemplate implements IExternalControlTemplate {
  componentType: ComponentType
  expandoProperties: ControlProperty[]
  includesThisItemInSpecificProperty: boolean
  isMetaLoc: boolean
  nestedAwareTableOutputs: DName[]
  primaryOutputProperty: ControlProperty
  replicatesNestedControls: boolean
  thisItemInputInvariantName: string

  constructor(props: IControlTemplateProps) {
    this.componentType = props.componentType
    this.expandoProperties = props.expandoProperties ?? []
    this.includesThisItemInSpecificProperty = props.includesThisItemInSpecificProperty
    this.isMetaLoc = props.isMetaLoc
    this.nestedAwareTableOutputs = props.nestedAwareTableOutputs ?? []
    this.replicatesNestedControls = props.replicatesNestedControls
    this.thisItemInputInvariantName = props.thisItemInputInvariantName
  }

  public get isCommandComponent() {
    return this.componentType === ComponentType.CommandComponent
  }

  public get hasExpandoProperties() {
    return this.expandoProperties?.length > 0
  }

  public get isComponent() {
    return this.componentType != null
  }

  hasOutput(rightName: DName): boolean {
    return this.nestedAwareTableOutputs.some((output) => output.equals(rightName))
  }

  hasProperty(currentPropertyValue: string, category: PropertyRuleCategory): boolean {
    return this.expandoProperties.some(
      (property) => property.name.value === currentPropertyValue && property.propertyCategory === category,
    )
  }

  tryGetInputProperty(resolverCurrentProperty: string): [boolean, IExternalControlProperty] {
    return [false, undefined]
  }

  tryGetOutputProperty(name: string): [boolean, IExternalControlProperty] {
    return [false, undefined]
  }

  tryGetProperty(name: string): [boolean, IExternalControlProperty] {
    return [false, undefined]
  }
}
