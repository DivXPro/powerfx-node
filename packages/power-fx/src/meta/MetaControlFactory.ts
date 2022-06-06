import { ObjectField } from '@formily/core'
import { IFieldMeta } from '@toy-box/meta-schema'
import { Control, ControlTemplate, ControlType } from '../interpreter'
import { ComponentType } from '../app'
import { DName } from '../utils'
import { MetaFieldControl } from './MetaFieldControl'

export class MetaControlFactory {
  static MetaControlTemplate = new ControlTemplate({
    componentType: ComponentType.DataComponent,
    isMetaLoc: true,
  })
  static MetaControlType = new ControlType({
    isMetaField: true,
    controlTemplate: MetaControlFactory.MetaControlTemplate,
  })
  static MetaFormTemplate = new ControlTemplate({
    componentType: ComponentType.DataComponent,
  })

  static MakeControl(name: string, uid: string) {
    return new Control({
      displayName: name,
      entityName: new DName(name),
      type: MetaControlFactory.MetaControlType,
      uniqueId: uid,
      template: MetaControlFactory.MetaFormTemplate,
      isAppGlobalControl: true,
      isDataComponentInstance: true,
    })
  }

  static MakeFieldControl(name: string, fieldMeta: IFieldMeta, field: ObjectField) {
    return new MetaFieldControl({
      field,
      fieldMeta,
      scope: undefined,
    })
  }
}
