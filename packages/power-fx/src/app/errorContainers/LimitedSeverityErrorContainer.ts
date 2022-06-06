import { DocumentErrorSeverity, TexlError } from '../../errors'
import { ErrorResourceKey } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { KeyValuePair } from '../../utils/types'
import { IErrorContainer } from './IErrorContainer'

export class LimitedSeverityErrorContainer implements IErrorContainer {
  private _errors: IErrorContainer
  private maximumSeverity: DocumentErrorSeverity

  public get DefaultSeverity() {
    return this._errors.DefaultSeverity
  }

  constructor(errors: IErrorContainer, maximumSeverity: DocumentErrorSeverity) {
    this._errors = errors
    this.maximumSeverity = maximumSeverity
  }

  public ensureError(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    if (this.DefaultSeverity <= this.maximumSeverity) {
      return this._errors.ensureError(node, errKey, args)
    }
    return null
  }

  public ensureErrorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    if (severity <= this.maximumSeverity) {
      return this._errors.ensureErrorWithSeverity(severity, node, errKey, args)
    }
    return null
  }

  public error(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    if (this.DefaultSeverity <= this.maximumSeverity) {
      return this._errors.error(node, errKey, args)
    }
    return null
  }

  public errorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    if (severity <= this.maximumSeverity) {
      return this._errors.errorWithSeverity(severity, node, errKey, args)
    }
    return null
  }

  public errors(
    node: TexlNode,
    nodeType: DType,
    schemaDifference: KeyValuePair<string, DType>,
    schemaDifferenceType: DType,
  ) {
    if (DocumentErrorSeverity.Severe <= this.maximumSeverity) {
      this._errors.errors(node, nodeType, schemaDifference, schemaDifferenceType)
    }
  }
}
