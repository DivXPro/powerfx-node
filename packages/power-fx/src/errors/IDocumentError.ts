import { DocumentErrorKind } from './DocumentErrorKind'
import { DocumentErrorSeverity } from './DocumentErrorSeverity'
import { ErrorHelpLink } from './ErrorHelpLink'
import { ErrorResourceKey, Span } from '../localization'

export interface IDocumentError {
  innerError: IDocumentError
  errorKind: DocumentErrorKind
  shortMessage: string
  longMessage: string
  messageKey: string
  errorResourceKey: ErrorResourceKey
  messageArgs: any[]
  howToFixMessages: string[]
  whyToFixMessage: string
  links: ErrorHelpLink[]
  entity: string
  entityId: string
  parent: string
  propertyName: string
  textSpan: Span
  sinkTypeErrors: string[]
  severity: DocumentErrorSeverity
  internalException: Error
}
