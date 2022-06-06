import { TexlBinding } from '../../binding'
import { Formula } from '../../syntax/Formula'
import { IIntellisenseResult } from './IIntellisenseResult'
import { IntellisenseContext } from './IntellisenseContext'

export interface IIntellisense {
  /// <summary>
  /// Returns the result depending on the context.
  /// </summary>
  Suggest(context: IntellisenseContext, binding: TexlBinding, formula: Formula): IIntellisenseResult
}
