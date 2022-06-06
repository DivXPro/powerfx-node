import { GeneralField, isVoidField, isObjectField } from '@formily/core'
import { IFieldMeta, IMetaBase, MetaValueType } from '@toy-box/meta-schema'
import { DName } from '../utils'
import { ControlTemplate } from '../interpreter/environment'
import { ComponentType } from '../app/components/ComponentType'
import { DType, IExternalControlType } from '../types'
import { IExternalControl } from '../app/controls/IExternalControl'
import { IExternalRule } from '../app/controls/IExternalRule'
import { makeDType } from './metaType'
import { MetaEntityScope } from './MetaEntityScope'

export interface IMetaFieldControlProps {
  field: GeneralField
  scope: MetaEntityScope
  fieldMeta?: IMetaBase
}

export class MetaFieldControl implements IExternalControl {
  scope: MetaEntityScope
  field: GeneralField
  fieldMeta: IMetaBase
  displayName: string
  entityName: DName
  template: ControlTemplate
  thisItemType: DType
  // topParentOrSelf: MetaFieldControl
  isAppGlobalControl: boolean
  isAppInfoControl: boolean
  isCommandComponentInstance: boolean
  isComponentDefinition: boolean
  isComponentInstance: boolean
  isReplicable: boolean
  uniqueId: string

  constructor(props: IMetaFieldControlProps) {
    const { field, scope, fieldMeta } = props
    this.scope = scope
    this.field = field
    this.fieldMeta = fieldMeta
    this.displayName = field.address.toString()
    this.entityName = new DName(field.address.toString())
    this.template = new ControlTemplate({
      componentType: field.displayName === 'VoidField' ? ComponentType.CanvasComponent : ComponentType.DataComponent,
    })
    this.uniqueId = field.componentProps['uid']

    // TODO: thisItem.type
    if (field.parent) {
      const parent = field.parent
      const parentMeta = this.scope.getMeta(parent.path.toString())
      this.thisItemType = makeDType(
        parentMeta.type === MetaValueType.ARRAY ? (parentMeta as IFieldMeta).items : parentMeta,
      )
    }
  }

  public get isFormComponent() {
    return this.field.componentType === 'DataView' && isObjectField(this.field)
  }

  public get parent(): GeneralField {
    return this.field.parent
  }

  public get isComponentControl() {
    return this.field.displayName === 'VoidField'
  }

  public get isDataComponentInstance(): boolean {
    return this.field.displayName !== 'VoidField'
  }

  public get isDataComponentDefinition(): boolean {
    return false
  }

  public get topParentOrSelf(): MetaFieldControl {
    let topParent = this.field
    while (topParent.parent != null) {
      topParent = topParent.parent
      if (!isVoidField(topParent)) {
        break
      }
    }
    return isVoidField(topParent) ? this : this.scope.findFieldEntity(topParent.address.toString())
  }

  public get schema() {
    return makeDType(this.fieldMeta)
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
