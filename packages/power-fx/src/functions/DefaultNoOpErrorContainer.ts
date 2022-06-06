import { IErrorContainer } from '../app/errorContainers/IErrorContainer'
import { DocumentErrorSeverity, TexlError } from '../errors'
import { ErrorResourceKey } from '../localization'
import { TexlNode } from '../syntax'
import { DType } from '../types/DType'
import { KeyValuePair } from '../utils/types'

export class DefaultNoOpErrorContainer implements IErrorContainer {
  public get DefaultSeverity(): DocumentErrorSeverity {
    return DocumentErrorSeverity._Min
  }

  public ensureError(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    return null
  }

  public error(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    return null
  }

  public ensureErrorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    return null
  }

  public errorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    return null
  }

  public errors(
    node: TexlNode,
    nodeType: DType,
    schemaDifference: KeyValuePair<string, DType>,
    schemaDifferenceType: DType,
  ) {
    // Do nothing.
  }
}
