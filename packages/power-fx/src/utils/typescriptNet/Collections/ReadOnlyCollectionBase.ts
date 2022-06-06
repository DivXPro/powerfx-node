import CollectionBase from './CollectionBase'
import { FiniteIEnumerator } from './Enumeration/IEnumerator'

export abstract class ReadOnlyCollectionBase<T> extends CollectionBase<T> {
  protected abstract _getCount(): number

  protected getCount(): number {
    return this._getCount()
  }

  protected getIsReadOnly(): boolean {
    return true
  }

  //noinspection JSUnusedLocalSymbols
  protected _addInternal(entry: T): boolean {
    return false
  }

  //noinspection JSUnusedLocalSymbols
  protected _removeInternal(entry: T, max?: number): number {
    return 0
  }

  protected _clearInternal(): number {
    return 0
  }

  protected abstract _getEnumerator(): FiniteIEnumerator<T>

  getEnumerator(): FiniteIEnumerator<T> {
    return this._getEnumerator()
  }
}

export default ReadOnlyCollectionBase
