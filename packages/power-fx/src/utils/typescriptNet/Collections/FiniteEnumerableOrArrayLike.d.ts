import { FiniteIEnumerable } from './Enumeration/IEnumerable'

declare type FiniteEnumerableOrArrayLike<T> = FiniteIEnumerable<T> | ArrayLike<T>

export default FiniteEnumerableOrArrayLike
