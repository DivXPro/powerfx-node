import { IExternalControlTemplate } from '../app/controls/IExternalControlTemplate'
import { DKind } from './DKind'

export interface IExternalControlType {
  controlTemplate: IExternalControlTemplate
  isDataLimitedControl: boolean
  isMetaField: boolean
}

export function IsIExternalControlType(data: any): data is IExternalControlType {
  return data.type === DKind.Control
}
