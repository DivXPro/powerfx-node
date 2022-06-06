import { TexlNode } from './nodes'
import { TexlError } from '../errors'
import { CommentToken } from '../lexer/tokens'
import { ILanguageSettings } from '../localization'
import { TexlParser, TexlParserFlags } from '../parser/TexlParser'

export class Formula {
  public readonly script: string

  // The language settings used for parsing this script.
  // May be null if the script is to be parsed in the current locale.
  public readonly loc: ILanguageSettings
  private _errors: Array<TexlError>

  // This may be null if the script hasn't yet been parsed.
  // internal TexlNode ParseTree { get; private set; }
  parseTree: TexlNode

  comments: Array<CommentToken>

  constructor(script: string, tree?: TexlNode, loc?: ILanguageSettings) {
    // Contracts.AssertValue(script);
    // Contracts.AssertValueOrNull(loc);

    this.script = script
    this.parseTree = tree
    this.loc = loc
    this.assertValid()
  }

  // [Conditional("DEBUG")]
  private assertValid() {
    // Contracts.AssertValue(Script);
    // Contracts.Assert(_errors == null || _errors.Count > 0);
    // Contracts.Assert(ParseTree != null || _errors == null);
  }

  public hasParseErrors: boolean

  // True if the formula has already been parsed.
  public get isParsed() {
    return this.parseTree != null
  }

  public ensureParsed(flags: TexlParserFlags): boolean {
    this.assertValid()

    if (this.parseTree == null) {
      const result = TexlParser.ParseScript(this.script, this.loc, flags)
      this.parseTree = result.root
      this._errors = result.errors
      this.comments = result.comments
      this.hasParseErrors = result.hasError
      //   Contracts.AssertValue(ParseTree)
      this.assertValid()
    }

    return this._errors == null
  }

  public getParseErrors(): Array<TexlError> {
    this.assertValid()
    // Contracts.Assert(IsParsed, "Should call EnsureParsed() first!");
    return this._errors ?? []
  }

  public toString(): string {
    return this.script
  }
}
