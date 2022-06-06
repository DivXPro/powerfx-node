import { DocumentErrorSeverity, TexlError } from '../../errors'
import { ErrorResourceKey } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { KeyValuePair } from '../../utils/types'

export interface IErrorContainer {
  /// <summary>
  /// The severity to use in the default EnsureError and Error functions. Is not
  /// used in the Errors function.
  /// </summary>
  get DefaultSeverity(): DocumentErrorSeverity

  /// <summary>
  /// Only adds and returns the error if its severity is equal to or higher
  /// than the existing errors for the node in the container.
  ///
  /// Severity is defaulted to critical.
  /// </summary>
  ensureError(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError

  /// <summary>
  /// Adds an error to the container and returns the composed error value
  /// that was inserted.
  ///
  /// Severity is defaulted to critical.
  /// </summary>
  error(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError

  /// <summary>
  /// Only adds and returns the error if its severity is equal to or higher
  /// than the existing errors for the node in the container.
  /// </summary>
  ensureErrorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError

  /// <summary>
  /// Adds an error to the container and returns the composed error value
  /// that was inserted.
  /// </summary>
  errorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError

  /// <summary>
  /// Used to apply errors due to differing type schemas. Use schemaDifferenceType = DType.Invalid to indicate
  /// that the schema difference is due to a missing member.
  /// </summary>
  errors(
    node: TexlNode,
    nodeType: DType,
    schemaDifference: KeyValuePair<string, DType>,
    schemaDifferenceType: DType,
  ): void
}
