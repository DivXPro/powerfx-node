export interface ICheckable {
  get isValid(): boolean
}

export interface IEquatable<T> {
  equals: (other: T) => boolean
}

export type KeyValuePair<K, V> = {
  key: K
  value: V
}

export interface IEnumerable<T> {
  getEnumerator(): T[]
  first(): T
}

export interface IComparer<T> {
  compare(x: T, y: T): number
}

export interface ICollection<T> extends IEnumerable<T> {
  get count(): number

  get isReadOnly(): boolean

  add(item: T): void

  clear(): void

  contains(item: T): boolean

  copyTo(array: T[], arrayIndex: number): void

  remove(item: T): boolean
}
