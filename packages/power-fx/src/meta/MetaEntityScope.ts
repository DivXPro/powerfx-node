import { Form } from '@formily/core'
import { IFieldMeta } from '@toy-box/meta-schema'
import { MetaFieldControl } from './MetaFieldControl'
import { getMetasIn } from './metaType'
import { EntityScope } from '../interpreter'
import { IExternalEntity } from '../entities/external'
import { DPath } from '../utils'

export interface MetaEntityScopeProps {
  form: Form
  metaSchema: IFieldMeta
  entities?: IExternalEntity[]
}

export class MetaEntityScope extends EntityScope {
  protected form: Form
  protected metaSchema: IFieldMeta

  constructor(props: MetaEntityScopeProps) {
    super(props.entities)
    this.form = props.form
    this.metaSchema = props.metaSchema
  }

  public get fields() {
    return this.form.fields
  }

  public get formFields() {
    return Object.values(this.form.fields).filter((field) => field.componentType === 'DataView')
  }

  public tryGetFieldEntity(path: DPath): [boolean, MetaFieldControl] {
    const identifier = path.toDottedSyntax()
    const field = this.form.fields[identifier]
    if (field == null) {
      return [false, undefined]
    }
    const fieldMeta = this.getMeta(field.path.toString())
    return [true, new MetaFieldControl({ field, fieldMeta, scope: this })]
  }

  public findFieldEntity(path: string) {
    const field = this.form.fields[path]
    if (field) {
      const fieldMeta = getMetasIn(field.path.toString(), this.metaSchema)
      return new MetaFieldControl({ field, fieldMeta, scope: this })
    }
  }

  public get formFieldControls() {
    return this.formFields.map((field) => {
      const fieldMeta = getMetasIn(field.path.toString(), this.metaSchema)
      return new MetaFieldControl({ field, fieldMeta, scope: this })
    })
  }

  public findFormControl(uid: string) {
    return this.formFieldControls.find((control) => control.uniqueId === uid)
  }

  public getMeta(path: string) {
    return getMetasIn(path, this.metaSchema)
  }
}
