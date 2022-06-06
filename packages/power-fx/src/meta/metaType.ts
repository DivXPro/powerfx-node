import { IFieldMeta, IMetaBase, MetaValueType, IFieldItems } from '@toy-box/meta-schema'
import { Path, Pattern } from '@formily/path'
import { isStr, isNumberIndex } from '@toy-box/toybox-shared'
import { DName, DPath } from '../utils'
import { DKind, DType, TypedName } from '../types'

export function makeDType(fieldMeta?: IMetaBase): DType {
  if (fieldMeta == null) {
    return DType.Invalid
  }
  switch (fieldMeta.type) {
    case MetaValueType.STRING:
    case MetaValueType.TEXT:
      return DType.String
    case MetaValueType.INTEGER:
    case MetaValueType.NUMBER:
    case MetaValueType.PERCENT:
    case MetaValueType.RATE:
      return DType.Number
    case MetaValueType.BOOLEAN:
      return DType.Boolean
    case MetaValueType.DATE:
      return DType.Date
    case MetaValueType.DATETIME:
    case MetaValueType.TIMESTAMP:
      return DType.DateTime
    case MetaValueType.SINGLE_OPTION:
      return DType.OptionSetValue
    case MetaValueType.OBJECT_ID:
      return DType.Guid
    case MetaValueType.MULTI_OPTION: {
      const type = DType.EmptyTable
      type.add(new DName('Value'), DType.OptionSetValue)
      return type
    }
    case MetaValueType.OBJECT: {
      let type = new DType(DKind.Record)
      for (const key in fieldMeta.properties) {
        const fMeta = fieldMeta.properties[key]
        type = type.add(new TypedName(makeDType(fMeta), new DName(key)))
      }
      return type
    }
    case MetaValueType.ARRAY: {
      let type = new DType(DKind.Table)
      const fieldItems = (fieldMeta as IFieldMeta).items as IFieldItems
      for (const key in fieldItems.properties) {
        const fMeta = fieldItems.properties[key]
        type = type.add(new TypedName(makeDType(fMeta), new DName(key)))
      }
      return type
    }
    default:
      return DType.Invalid
  }
}

export function getMetasIn(pattern: Pattern, source: IFieldMeta | IFieldItems): IMetaBase {
  const segments = Path.parse(pattern).segments
  let meta = source
  for (let i = 0; i < segments.length; i++) {
    const index = segments[i]
    if (isStr(index) && (meta as IFieldMeta).properties?.[index]) {
      meta = (meta as IFieldMeta).properties?.[index] as IFieldMeta
    }
    if (isNumberIndex(index) && meta.type === MetaValueType.ARRAY && (meta as IFieldMeta).items) {
      meta = (meta as IFieldMeta).items as IFieldItems
    }
    if (i !== segments.length - 1 && meta == null) {
      return meta
    }
  }
  return meta
}

export function makeDPath(path: Path) {
  let dPath = DPath.Root
  for (let i = 0; i < path.segments.length; i += 1) {
    dPath = new DPath(dPath, new DName(path.segments[i].toString()))
  }
  return dPath
}
