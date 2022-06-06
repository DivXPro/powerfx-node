import { TexlError } from '../errors'
import { TexlNode } from '../syntax/nodes'
import { Dictionary } from '../utils/Dictionary'
import { DName } from '../utils/DName'
import { IdentToken } from '../lexer/tokens'

export class ParseFormulasResult {
  namedFormulas: Dictionary<IdentToken, TexlNode>

  errors: Array<TexlError>

  hasError: boolean

  constructor(namedFormulas: Dictionary<IdentToken, TexlNode>, errors?: Array<TexlError>) {
    // Contracts.AssertValue(namedFormulas)

    if (errors?.length > 0) {
      this.errors = errors
      this.hasError = true
    }

    this.namedFormulas = namedFormulas
  }
}
