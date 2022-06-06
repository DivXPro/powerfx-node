import { ILanguageSettings } from '../localization'
import { Dictionary, KeyValuePair } from '../utils'
import { IdentToken } from '../lexer/tokens'
import { TexlNode } from './nodes'
import { TexlError } from '../errors'
import { TexlParser } from '../parser'
import { Formula } from './Formula'

export class NamedFormulas {
  /// <summary>
  /// A script containing one or more named formulas.
  /// </summary>
  public readonly script: string

  // The language settings used for parsing this script.
  // May be null if the script is to be parsed in the current locale.
  public readonly loc: ILanguageSettings

  public get isParsed() {
    return this._formulasResult != null
  }

  public hasParseErrors: boolean

  private _formulasResult: Dictionary<IdentToken, TexlNode>

  private _errors: Array<TexlError>

  /// <summary>
  /// Initializes a new instance of the <see cref="NamedFormulas"/> class.
  /// </summary>
  /// <param name="script"></param>
  /// <param name="loc"></param>
  constructor(script: string, loc?: ILanguageSettings) {
    // Contracts.AssertValue(script);
    // Contracts.AssertValueOrNull(loc);

    this.script = script
    this.loc = loc
  }

  /// <summary>
  /// Ensures that the named formulas have been parsed and if not, parses them.
  /// </summary>
  /// <returns>Tuple of IdentToken and formula.</returns>
  public ensureParsed() // : Array<(IdentToken token, Formula formula)>
  {
    if (this._formulasResult == null) {
      // Contracts.AssertValue(Script);
      // Contracts.AssertValueOrNull(Loc);
      const result = TexlParser.ParseFormulasScript(this.script, this.loc)
      this._formulasResult = result.namedFormulas
      this._errors = result.errors
      this.hasParseErrors = result.hasError
      // Contracts.AssertValue(_formulasResult)
    }

    return this.getNamedFormulas()
  }

  /// <summary>
  /// Returns any parse errors.
  /// </summary>
  /// <returns></returns>
  public getParseErrors(): Array<TexlError> {
    // Contracts.AssertValue(Script);
    // Contracts.Assert(IsParsed, "Should call EnsureParsed() first!");
    return this._errors ?? []
  }

  private getNamedFormulas() // : Array<(IdentToken token, Formula formula)>
  {
    const formulas = []
    if (this._formulasResult != null) {
      for (const kvp of this._formulasResult) {
        formulas.push([kvp[0], this.getFormula(kvp[1])])
      }
    }

    return formulas
  }

  private getFormula(node: TexlNode): Formula {
    return new Formula(node.getCompleteSpan().getFragment(this.script), node)
  }
}
