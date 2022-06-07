export interface Selector<TSource, TResult> {
  (source: TSource): TResult
}

export interface SelectorWithIndex<TSource, TResult> {
  (source: TSource, index: number): TResult
}

export type Action<T> = Selector<T, void>

export type ActionWithIndex<T> = SelectorWithIndex<T, void>

export type Predicate<T> = Selector<T, boolean>

export type PredicateWithIndex<T> = SelectorWithIndex<T, boolean>

export interface Comparison<T> {
  (a: T, b: T): number
  (a: T, b: T, strict: boolean): number
  (a: T, b: T, strict?: boolean): number
}

export interface EqualityComparison<T> {
  (a: T, b: T): boolean
  (a: T, b: T, strict: boolean): boolean
  (a: T, b: T, strict?: boolean): boolean
}

export type HashSelector<T> = Selector<T, string | number | symbol>

export interface Func<TResult> {
  (): TResult
}

export interface Closure {
  (): void
}
