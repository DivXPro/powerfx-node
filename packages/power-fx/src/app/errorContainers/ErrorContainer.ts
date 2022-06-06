import { DocumentErrorSeverity, TexlError } from '../../errors'
import { ErrorResourceKey, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { isNullOrEmpty } from '../../utils/CharacterUtils'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { KeyValuePair } from '../../utils/types'
import { IErrorContainer } from './IErrorContainer'

export class ErrorContainer implements IErrorContainer {
  private _errors: Array<TexlError>

  public static DefaultSeverity = DocumentErrorSeverity.Critical

  get DefaultSeverity(): DocumentErrorSeverity {
    return ErrorContainer.DefaultSeverity
  }

  constructor() {}

  public getErrorsArray() {
    return this._errors
  }

  public hasErrors(node?: TexlNode, severity = DocumentErrorSeverity.Suggestion): boolean {
    // Contracts.AssertValue(node);
    if (node == null) {
      return CollectionUtils.Size(this._errors) > 0
    }

    if (CollectionUtils.Size(this._errors) == 0) {
      return false
    }
    for (const err of this._errors) {
      if (err.node == node && err.severity >= severity) return true
    }

    return false
  }

  public hasErrorsInTree(rootNode: TexlNode, severity = DocumentErrorSeverity.Suggestion): boolean {
    // Contracts.AssertValue(rootNode);

    if (CollectionUtils.Size(this._errors) == 0) return false

    for (const err of this._errors) {
      if (err.node.inTree(rootNode) && err.severity >= severity) return true
    }

    return false
  }

  public getErrors(): Array<TexlError>
  public getErrors(rgerr: Array<TexlError>): [boolean, Array<TexlError>]
  public getErrors(rgerr?: Array<TexlError>): Array<TexlError> | [boolean, Array<TexlError>] {
    if (rgerr) {
      if (CollectionUtils.Size(this._errors) == 0) {
        return [false, rgerr]
      }
      rgerr = CollectionUtils.AddItems(rgerr, this._errors)
      return [true, rgerr]
    }
    return this._errors
  }

  public ensureError(node: TexlNode, errKey: ErrorResourceKey, ...args: object[]): TexlError {
    return this.ensureErrorWithSeverity(ErrorContainer.DefaultSeverity, node, errKey, ...args)
  }

  public ensureErrorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(args);

    if (!this.hasErrors(node, severity)) return this.errorWithSeverity(severity, node, errKey, ...args)

    return null
  }

  public error(node: TexlNode, errKey: ErrorResourceKey, ...args: any[]): TexlError {
    return this.errorWithSeverity(ErrorContainer.DefaultSeverity, node, errKey, ...args)
  }

  public errorWithSeverity(
    severity: DocumentErrorSeverity,
    node: TexlNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ): TexlError {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(args);

    const err = new TexlError(node, null, severity, errKey, ...args)
    this._errors = CollectionUtils.Add(this._errors, err)
    return err
  }

  public errors(
    node: TexlNode,
    nodeType: DType,
    schemaDifference: KeyValuePair<string, DType>,
    schemaDifferenceType: DType,
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValid(nodeType);

    this.errorWithSeverity(
      DocumentErrorSeverity.Severe,
      node,
      TexlStrings.ErrBadSchema_ExpectedType,
      nodeType.getKindString(),
    )

    // If there's no schema difference, this was just an invalid type.
    if (isNullOrEmpty(schemaDifference.key)) return

    if (schemaDifferenceType.isValid) {
      this.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrColumnTypeMismatch_ColName_ExpectedType_ActualType,
        schemaDifference.key,
        schemaDifference.value.getKindString(),
        schemaDifferenceType.getKindString(),
      )
    } else {
      this.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrColumnMissing_ColName_ExpectedType,
        schemaDifference.key,
        schemaDifference.value.getKindString(),
      )
    }
  }
}
