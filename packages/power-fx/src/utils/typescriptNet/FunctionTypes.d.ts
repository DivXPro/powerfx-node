export interface Selector<TSource, TResult> {
  (source: TSource): TResult
}

export interface SelectorWithIndex<TSource, TResult> {
  (source: TSource, index: number): TResult
}

export interface Action<T> extends Selector<T, void> {}

export interface ActionWithIndex<T> extends SelectorWithIndex<T, void> {}

export interface Predicate<T> extends Selector<T, boolean> {}

export interface PredicateWithIndex<T> extends SelectorWithIndex<T, boolean> {}

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

export interface HashSelector<T> extends Selector<T, string | number | symbol> {}

export interface Func<TResult> {
  (): TResult
}

export interface Closure {
  (): void
}
