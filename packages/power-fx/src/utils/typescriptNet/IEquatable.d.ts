/*!
 *
 * Based upon .NET source.
 *
 * Source: http://referencesource.microsoft.com/#mscorlib/system/IEquatable.cs
 */

export default interface IEquatable<T> {
  equals(other: T): boolean
}
