/*!
 *
 * Origin: http://www.fallingcanbedeadly.com/
 * Licensing: MIT
 */

import { Action } from '../FunctionTypes'
import { IReadOnlyList } from './IList'
import IEnumerator, { FiniteIEnumerator } from './Enumeration/IEnumerator'
import IEnumerable from './Enumeration/IEnumerable'
import ReadOnlyCollectionBase from './ReadOnlyCollectionBase'
import ArgumentOutOfRangeException from '../Exceptions/ArgumentOutOfRangeException'
import { FiniteEnumeratorBase } from './Enumeration/EnumeratorBase'
import InvalidOperationException from '../Exceptions/InvalidOperationException'
import Integer from '../Integer'

export default class LazyList<T> extends ReadOnlyCollectionBase<T> implements IReadOnlyList<T> {
  private _enumerator: IEnumerator<T> | null
  private _cached: T[] | null

  constructor(source: IEnumerable<T>) {
    super()
    this._enumerator = source.getEnumerator()
    this._cached = []
  }

  protected _onDispose(): void {
    super._onDispose()
    const e = this._enumerator
    this._enumerator = null
    if (e) e.dispose()

    const c = this._cached
    this._cached = null
    if (c) c.length = 0
  }

  protected _getCount(): number {
    const e = this._enumerator
    if (e && e.isEndless) throw new InvalidOperationException('Cannot count an endless enumerable.')
    while (this.getNext()) {}

    const c = this._cached
    return c ? c.length : 0
  }

  protected _getEnumerator(): FiniteIEnumerator<T> {
    let current: number
    return new FiniteEnumeratorBase<T>(
      () => {
        current = 0
      },
      (yielder) => {
        this.throwIfDisposed()
        const c = this._cached!
        return current < c.length || this.getNext() ? yielder.yieldReturn(c[current++]) : yielder.yieldBreak()
      },
    )
  }

  get(index: number): T {
    this.throwIfDisposed()
    Integer.assertZeroOrGreater(index)

    const c = this._cached!
    while (c.length <= index && this.getNext()) {}

    if (index < c.length) return c[index]

    throw new ArgumentOutOfRangeException('index', 'Greater than total count.')
  }

  indexOf(item: T): number {
    this.throwIfDisposed()
    const c = this._cached!
    let result = c.indexOf(item)
    while (
      result == -1 &&
      this.getNext((value) => {
        if (value == item) result = c.length - 1
      })
    ) {}
    return result
  }

  contains(item: T): boolean {
    return this.indexOf(item) != -1
  }

  private getNext(out?: Action<T>): boolean {
    const e = this._enumerator
    if (!e) return false
    if (e.moveNext()) {
      const value = e.current!
      this._cached!.push(value)
      if (out) out(value)
      return true
    } else {
      e.dispose()
      this._enumerator = <any>null
    }
    return false
  }
}
