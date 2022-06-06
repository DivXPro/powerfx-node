/*!
 *
 * Based upon .NET source.
 *
 */

export default interface IComparer<T> {
  compare(a: T, b: T): number
}
