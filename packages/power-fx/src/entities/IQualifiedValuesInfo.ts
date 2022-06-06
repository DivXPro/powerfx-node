import { DType } from '../types/DType'
import { IExternalEntity } from './external/IExternalEntity'

export interface IQualifiedValuesInfo extends IExternalEntity {
  isAsyncAccess: boolean
  kind: string
  schema: DType
  values: Record<string, string>
  valueType: DType
}
