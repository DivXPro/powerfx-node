import { TexlBinding } from '../binding/Binder'
import { IDocumentError } from '../errors'
import { Formula } from '../syntax/Formula'
import { DType } from '../types/DType'
import { GetTokensUtils } from '../utils/GetTokenUtils'
import { ExpressionError } from './ExpressionError'
import { GetTokensFlags } from './GetTokensFlags'
import { IExpression } from './IExpression'
import { FormulaType } from './types'

export class CheckResult {
  public returnType?: FormulaType
  public topLevelIdentifiers?: Set<string>
  public errors?: ExpressionError[]
  public expression: IExpression
  public _binding: TexlBinding
  public _formula: Formula

  public get isSuccess(): boolean {
    return this.errors == null
  }

  constructor(errors?: IDocumentError[], binding?: TexlBinding) {
    if (errors) {
      this.setErrors(errors)
    }
    this._binding = binding
  }

  public throwOnErrors(): void {
    if (!this.isSuccess) {
      const msg = this.errors.map((x) => x.toString()).join('\r\n')
      throw new Error('Errors: ' + msg)
    }
  }

  getTokens(flags: GetTokensFlags) {
    return GetTokensUtils.GetTokens(this._binding, flags)
  }

  setErrors(errors: IDocumentError[]): CheckResult {
    this.errors = errors.map((err) => new ExpressionError(err.shortMessage, err.textSpan, undefined, err.severity))
    if (errors.length === 0) {
      this.errors = undefined
    }
    return this
  }
}
