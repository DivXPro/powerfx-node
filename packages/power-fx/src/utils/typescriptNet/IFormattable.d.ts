/*!
 *
 * Based upon .NET source.
 *
 * Source: http://referencesource.microsoft.com/#mscorlib/system/IFormattable.cs
 */

import IFormatProvider from './IFormatProvider'
export default interface IFormattable {
  toString(format?: string, formatProvider?: IFormatProvider): string
}
