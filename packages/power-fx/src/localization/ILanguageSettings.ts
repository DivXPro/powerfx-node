import { INamedLanguageSettings } from './INamedLanguageSettings'

export interface ILanguageSettings extends INamedLanguageSettings {
  locToInvariantFunctionMap: Record<string, string>
  locToInvariantPunctuatorMap: Record<string, string>
  invariantToLocFunctionMap: Record<string, string>
  invariantToLocPunctuatorMap: Record<string, string>
}
