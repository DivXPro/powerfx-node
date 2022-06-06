import { DKind, IDTypeProps, IExternalControlType, TypedName } from '../../types'
import { DType } from '../../types/DType'
import { IExternalControlTemplate } from '../../app/controls/IExternalControlTemplate'
import { DName, DPath } from '../../utils'

export interface IControlTypeProps extends IDTypeProps {
  isDataLimitedControl?: boolean
  isMetaField?: boolean
  controlTemplate?: IExternalControlTemplate
}

export class ControlType extends DType implements IExternalControlType {
  public controlTemplate: IExternalControlTemplate
  public isDataLimitedControl: boolean
  public isMetaField: boolean

  constructor(props?: IControlTypeProps) {
    super(DKind.Control, props)
    this.isDataLimitedControl = props?.isDataLimitedControl
    this.isMetaField = props?.isMetaField
    this.controlTemplate = props?.controlTemplate
  }

  // Return a new type based on this, with an additional named member field (name) of a specified type.
  public add(typedName: TypedName): DType
  public add(name: DName, type: DType): DType
  public add(name: DName | TypedName, type?: DType): DType {
    if (name instanceof TypedName) {
      return this.addTypeName(name)
    }
    const tree = this.typeTree.setItem(name.toString(), type)
    const newType = new ControlType({
      typeTree: tree,
      controlTemplate: this.controlTemplate,
      isMetaField: this.isMetaField,
      isDataLimitedControl: this.isDataLimitedControl,
      associatedDataSources: this.associatedDataSources,
      displayNameProvider: this.displayNameProvider,
    })

    return newType
  }

  public tryGetType(name: DName | DPath): [boolean, DType] {
    if (this.isMetaField) {
      const rst = super.tryGetType(new DName(DType.MetaFieldName))
      if (rst[0]) {
        const field = rst[1]
        return field.tryGetType(name)
      }
      return [false, DType.Invalid]
    }
    return super.tryGetType(name)
  }
}
