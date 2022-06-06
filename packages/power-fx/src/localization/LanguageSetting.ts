import TexlLexer from '../lexer/TexlLexer'
import { ILanguageSettings } from './ILanguageSettings'

export class LanguageSettings implements ILanguageSettings {
  readonly locToInvariantFunctionMap: Record<string, string>
  readonly locToInvariantPunctuatorMap: Record<string, string>
  readonly invariantToLocFunctionMap: Record<string, string>
  readonly invariantToLocPunctuatorMap: Record<string, string>
  readonly cultureName: string
  readonly uICultureName: string

  private cachedInvariantSettings: LanguageSettings | undefined
  private cacheStamp: number

  public addFunction(loc: string, invariant: string) {
    // Contracts.AssertNonEmpty(loc);
    // Contracts.AssertNonEmpty(invariant);

    this.locToInvariantFunctionMap[loc] = invariant
    this.invariantToLocFunctionMap[invariant] = loc

    this.cacheStamp++
  }

  public addPunctuator(loc: string, invariant: string) {
    // Contracts.AssertNonEmpty(loc);
    // Contracts.AssertNonEmpty(invariant);

    this.locToInvariantPunctuatorMap[loc] = invariant
    this.invariantToLocPunctuatorMap[invariant] = loc

    this.cacheStamp++
  }

  public getIdentitySettingsForInvariantLanguage(): ILanguageSettings {
    if (this.cachedInvariantSettings == null || this.needsRefresh(this.cachedInvariantSettings)) {
      this.cachedInvariantSettings = new LanguageSettings('en-US', 'en-US')

      this.cachedInvariantSettings.cacheStamp = this.cacheStamp

      Object.keys(this.locToInvariantFunctionMap).forEach((key) => {
        const value = this.locToInvariantFunctionMap[key]
        this.cachedInvariantSettings?.addFunction(value, value)
      })

      Object.keys(this.locToInvariantPunctuatorMap).forEach((key) => {
        const value = this.locToInvariantPunctuatorMap[key]
        this.cachedInvariantSettings?.addPunctuator(value, value)
      })
    }

    return this.cachedInvariantSettings
  }

  private needsRefresh(cache: LanguageSettings) {
    // Contracts.AssertValue(cache);

    return cache.cacheStamp != this.cacheStamp
  }

  constructor(cultureName: string, uiCultureName: string, addPunctuators = false) {
    // Contracts.AssertNonEmpty(cultureName);

    this.cultureName = cultureName
    this.uICultureName = uiCultureName

    this.locToInvariantFunctionMap = {}
    this.locToInvariantPunctuatorMap = {}
    this.invariantToLocFunctionMap = {}
    this.invariantToLocPunctuatorMap = {}

    this.cacheStamp = 0
    this.cachedInvariantSettings = undefined

    if (addPunctuators) {
      const { dec, comma, chaining } = TexlLexer.ChoosePunctuators(this)
      this.addPunctuator(dec, TexlLexer.PunctuatorDecimalSeparatorInvariant)
      this.addPunctuator(comma, TexlLexer.PunctuatorCommaInvariant)
      this.addPunctuator(chaining, TexlLexer.PunctuatorSemicolonInvariant)
    }
  }
}
