import { TexlFunction } from '../../functions/TexlFunction'
import { DType } from '../../types/DType'
import { DName } from '../../utils/DName'
import { PropertyRuleCategory } from './PropertyRuleCategory'

export interface IExternalControlProperty {
  isImmutableOnInstance: boolean
  supportsPaging: boolean
  requiresDefaultablePropertyReferences: boolean
  shouldIncludeThisItemInFormula: boolean
  name: DName
  isTestCaseProperty: boolean
  useForDataQuerySelects: boolean
  propertyCategory: PropertyRuleCategory
  isScopeVariable: boolean
  unloadedDefault: string
  passThroughInput: IExternalControlProperty
  invariantName: DName
  isScopedProperty: boolean
  scopeFunctionPrototype: TexlFunction
  type: DType
  isTable: boolean
  isEnum: boolean
  hidden: boolean
  getOpaqueType(): DType
}
