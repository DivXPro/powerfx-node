import { DName } from '../../utils/DName'
import { ComponentType } from '../components/ComponentType'
import { IExternalControlProperty } from './IExternalControlProperty'
import { PropertyRuleCategory } from './PropertyRuleCategory'

export interface IExternalControlTemplate {
  componentType: ComponentType
  includesThisItemInSpecificProperty: boolean
  replicatesNestedControls: boolean
  nestedAwareTableOutputs: DName[]
  isComponent: boolean
  hasExpandoProperties: boolean
  expandoProperties: IExternalControlProperty[]
  thisItemInputInvariantName: string
  primaryOutputProperty: IExternalControlProperty
  isMetaLoc: boolean
  isCommandComponent: boolean

  tryGetProperty(name: string): [boolean, IExternalControlProperty]
  tryGetInputProperty(resolverCurrentProperty: string): [boolean, IExternalControlProperty]
  hasProperty(currentPropertyValue: string, category: PropertyRuleCategory): boolean
  tryGetOutputProperty(name: string): [boolean, IExternalControlProperty]
  hasOutput(rightName: DName): boolean
}
