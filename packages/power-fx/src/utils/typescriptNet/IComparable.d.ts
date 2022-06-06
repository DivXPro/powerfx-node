/*!
 *
 * Based upon .NET source.
 *
 */

import Primitive from './Primitive'

export default interface IComparable<T> {
  compareTo(other: T): number
}

export declare type Comparable = Primitive | IComparable<any>
