import { IDisplayMapped } from '../IDisplpyMapped'

export interface IExternalViewInfo extends IDisplayMapped<string> {
  name: string
  relatedEntityName: string
}
