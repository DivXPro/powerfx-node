/// <summary>
/// Allows the accumulation of a large number of individual elements,
/// which can then be combined into a single collection at the end of
/// the operation without the creation of many intermediate large
/// memory blocks.

/// </summary>
export class LazyList<T> {
  private readonly _values: Array<T>

  public static readonly Empty = new LazyList([])

  public get values() {
    return this._values
  }

  constructor(values: T[]) {
    // Contracts.AssertValue(values);
    this._values = values
  }

  /// <summary>
  /// Gives a new list with the given elements after the elements in this list.
  /// </summary>
  public with(values: T[]): LazyList<T> {
    // Contracts.AssertValue(values);
    if (values.length === 0) return this
    return new LazyList<T>(this._values.concat(...values))
  }

  /// <summary>
  /// Create a new LazyList with the given starting set of values.
  /// </summary>
  public static Of<T>(...values: T[]) {
    // Contracts.AssertValue(values);
    return new LazyList(values)
  }
}
