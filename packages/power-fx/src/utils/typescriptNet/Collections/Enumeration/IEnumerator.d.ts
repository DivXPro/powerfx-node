﻿import IDisposable from '../../Disposable/IDisposable'
import { IIterator } from './IIterator'

// IIterator is added for future compatibility.
export interface IEnumerator<T> extends IIterator<T>, IDisposable {
  /**
   * The current value within the enumeration.
   */
  readonly current: T | undefined

  /**
   * Will indicate if moveNext is safe.
   */
  readonly canMoveNext?: boolean

  /**
   * Safely moves to the next entry and returns true if there is one.
   */
  moveNext(value?: any): boolean

  /**
   * Moves to the next entry and emits the value through the out callback.
   */
  tryMoveNext(out: (value: T) => void): boolean

  /**
   * Restarts the enumeration.
   */
  reset(): void

  /**
   * Interrupts/completes the enumeration.
   */
  end(): void

  /**
   * Calls .moveNext() and returns .current
   */
  nextValue(value?: any): T | undefined

  /**
   * Provides a way of flagging endless enumerations that may cause issues.
   */
  readonly isEndless?: boolean
}

export interface EndlessIEnumerator<T> extends IEnumerator<T> {
  readonly isEndless: true
}

export interface FiniteIEnumerator<T> extends IEnumerator<T> {
  readonly isEndless: false
}

export default IEnumerator
