import { ArrayLikeWritable } from './Array/ArrayLikeWritable'
import { FiniteIEnumerable } from './Enumeration/IEnumerable'

export interface IReadOnlyCollection<T> extends FiniteIEnumerable<T> {
  count: number
  isReadOnly: boolean

  contains(entry: T): boolean
  copyTo<TTarget extends ArrayLikeWritable<any>>(target: TTarget, index?: number): TTarget
  toArray(): T[]
}

export default IReadOnlyCollection
