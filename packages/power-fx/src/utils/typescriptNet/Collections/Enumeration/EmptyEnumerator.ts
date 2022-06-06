import { FiniteIEnumerator } from './IEnumerator'
import IteratorResult from './IteratorResult'
import Functions from '../../Functions'

/**
 * A simplified stripped down enumerable that is always complete and has no results.
 * Frozen and exported as 'empty' to allow for reuse.
 */

export const EmptyEnumerator: FiniteIEnumerator<any> = <any>Object.freeze({
  current: void 0,
  moveNext: Functions.False,
  tryMoveNext: Functions.False,
  nextValue: Functions.Blank,
  next: IteratorResult.GetDone,
  return: IteratorResult.GetDone,
  end: Functions.Blank,
  reset: Functions.Blank,
  dispose: Functions.Blank,
  isEndless: false,
})

/**
 * Simplified reusable factor for empty Enumerator.
 */
export function getEmptyEnumerator() {
  return EmptyEnumerator
}

export default EmptyEnumerator
