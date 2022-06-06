import { ErrorResource } from './ErrorResource'
import { ErrorResourceKey } from './ErrorResourceKey'

export interface IExternalStringResources {
  tryGetErrorResource(resourceKey: ErrorResourceKey, locale?: string): [boolean, ErrorResource]
  tryGet(resourceKey: string, locale?: string): [boolean, string]
}
