import IReadOnlyCollection from './IReadOnlyCollection'
import { FiniteIEnumerator } from './Enumeration/IEnumerator'
import { FiniteIEnumerable } from './Enumeration/IEnumerable'

export interface ICollection<T> extends IReadOnlyCollection<T> {
  add(entry: T): this

  remove(entry: T, max?: number): number // Number of times removed.
  clear(): number

  importEntries(entries: FiniteIEnumerable<T> | ArrayLike<T> | FiniteIEnumerator<T>): number

  toArray(): T[]
}

export default ICollection
