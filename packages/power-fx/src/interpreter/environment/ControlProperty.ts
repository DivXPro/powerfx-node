import { IExternalControlProperty } from '../../app/controls/IExternalControlProperty'
import { DName } from '../../utils'
import { PropertyRuleCategory } from '../../app/controls/PropertyRuleCategory'
import { TexlFunction } from '../../functions/TexlFunction'
import { DType } from '../../types'

export interface IControlPropertyProps {
  hidden: boolean
  name: DName
  passThroughInput: ControlProperty
  propertyCategory: PropertyRuleCategory
  requiresDefaultablePropertyReferences: boolean
  scopeFunctionPrototype: TexlFunction
  shouldIncludeThisItemInFormula: boolean
  supportsPaging: boolean
  type: DType
  unloadedDefault: string
  useForDataQuerySelects: boolean
  invariantName: DName
  isEnum: boolean
  isImmutableOnInstance: boolean
  isScopeVariable: boolean
  isScopedProperty: boolean
  isTable: boolean
  isTestCaseProperty: boolean
}

export class ControlProperty implements IExternalControlProperty {
  hidden: boolean
  name: DName
  passThroughInput: ControlProperty
  propertyCategory: PropertyRuleCategory
  requiresDefaultablePropertyReferences: boolean
  scopeFunctionPrototype: TexlFunction
  shouldIncludeThisItemInFormula: boolean
  supportsPaging: boolean
  type: DType
  unloadedDefault: string
  useForDataQuerySelects: boolean
  invariantName: DName
  isEnum: boolean
  isImmutableOnInstance: boolean
  isScopeVariable: boolean
  isScopedProperty: boolean
  isTable: boolean
  isTestCaseProperty: boolean

  constructor(props: IControlPropertyProps) {
    this.hidden = props.hidden
    this.name = props.name
    this.passThroughInput = props.passThroughInput
    this.propertyCategory = props.propertyCategory
    this.requiresDefaultablePropertyReferences = props.requiresDefaultablePropertyReferences
    this.scopeFunctionPrototype = props.scopeFunctionPrototype
    this.shouldIncludeThisItemInFormula = props.shouldIncludeThisItemInFormula
    this.supportsPaging = props.supportsPaging
    this.type = props.type
    this.unloadedDefault = props.unloadedDefault
    this.useForDataQuerySelects = props.useForDataQuerySelects
    this.invariantName = props.invariantName
    this.isEnum = props.isEnum
    this.isImmutableOnInstance = props.isImmutableOnInstance
    this.isScopeVariable = props.isScopeVariable
    this.isScopedProperty = props.isScopedProperty
    this.isTable = props.isTable
    this.isTestCaseProperty = props.isScopedProperty
  }

  getOpaqueType(): DType {
    return undefined
  }
}
