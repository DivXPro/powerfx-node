﻿/*!
 *
 * Original: http://linqjs.codeplex.com/
 *
 */

import { areEqual } from '../../Compare'
import Type from '../../Types'
import { FiniteEnumeratorBase } from '../Enumeration/EnumeratorBase'
import LinkedNodeList from '../LinkedNodeList'
import ObjectPool from '../../Disposable/ObjectPool'
import { IMap } from './IDictionary'
import KeyValuePair from '../../KeyValuePair'
import getIdentifier from './getIdentifier'
import { FiniteIEnumerator } from '../Enumeration/IEnumerator'
import { ILinkedNode } from '../ILinkedListNode'
import { HashSelector } from '../../FunctionTypes'
import DictionaryBase from './DictionaryBase'

const VOID0 = void 0

export interface IHashEntry<TKey, TValue>
  extends ILinkedNode<IHashEntry<TKey, TValue>>,
    KeyValuePair<TKey, TValue> {}

// LinkedList for Dictionary
class HashEntry<TKey, TValue> implements IHashEntry<TKey, TValue> {
  constructor(
    public key: TKey,
    public value: TValue,
    public previous?: IHashEntry<TKey, TValue>,
    public next?: IHashEntry<TKey, TValue>
  ) {}
}

type HashEntryLinkedList<TKey, TValue> = LinkedNodeList<
  IHashEntry<TKey, IHashEntry<TKey, TValue>>
>

let linkedListPool: ObjectPool<LinkedNodeList<any>>

function linkedNodeList(): LinkedNodeList<any>
function linkedNodeList(recycle?: LinkedNodeList<any>): void
//noinspection JSUnusedLocalSymbols
function linkedNodeList(
  recycle?: LinkedNodeList<any>
): LinkedNodeList<any> | void {
  if (!linkedListPool)
    linkedListPool = ObjectPool.createAutoRecycled(
      () => new LinkedNodeList<any>(),
      20
    )
  if (!recycle) return linkedListPool.take()
  linkedListPool.give(recycle)
}

export class Dictionary<TKey, TValue> extends DictionaryBase<TKey, TValue> {
  // Retains the order...
  private readonly _entries: LinkedNodeList<IHashEntry<TKey, TValue>>
  private readonly _buckets: IMap<
    LinkedNodeList<IHashEntry<TKey, IHashEntry<TKey, TValue>>>
  >

  constructor(private readonly _keyGenerator?: HashSelector<TKey>) {
    super()
    this._entries = linkedNodeList()
    this._buckets = {}
  }

  protected _onDispose() {
    super._onDispose()
    const _ = <any>this
    _._entries = null
    _._buckets = null
    _._hashGenerator = null
  }

  protected getCount(): number {
    return (this._entries && this._entries.unsafeCount) || 0
  }

  private _getBucket(
    hash: string | number | symbol,
    createIfMissing?: boolean
  ): HashEntryLinkedList<TKey, TValue> | undefined {
    if (hash == null || (!createIfMissing && !this.getCount())) return VOID0

    if (!Type.isPrimitiveOrSymbol(hash))
      console.warn(
        'Key type not indexable and could cause Dictionary to be extremely slow.'
      )

    const buckets: any = this._buckets
    let bucket = buckets[hash]

    if (createIfMissing && !bucket) buckets[hash] = bucket = linkedNodeList()

    return bucket
  }

  private _getBucketEntry(
    key: TKey,
    hash?: string | number | symbol,
    bucket?: HashEntryLinkedList<TKey, TValue>
  ): IHashEntry<TKey, IHashEntry<TKey, TValue>> | undefined {
    if (key == null || !this.getCount()) return VOID0

    const _ = this,
      comparer = _._keyGenerator,
      compareKey = comparer ? comparer(key) : key

    if (!bucket) bucket = _._getBucket(hash || getIdentifier(compareKey))

    return (
      bucket &&
      (comparer
        ? bucket.find((e) => comparer!(e.key) === compareKey)
        : bucket.find((e) => e.key === compareKey))
    )
  }

  protected _getEntry(key: TKey): IHashEntry<TKey, TValue> | undefined {
    const e = this._getBucketEntry(key)
    return e && e.value
  }

  getValue(key: TKey): TValue | undefined {
    const e = this._getEntry(key)
    return e ? e.value : VOID0
  }

  protected _setValueInternal(key: TKey, value: TValue | undefined): boolean {
    const _ = this
    const buckets: any = _._buckets,
      entries = _._entries,
      compareKey = _._keyGenerator ? _._keyGenerator(key) : key,
      hash = getIdentifier(compareKey)
    let bucket = _._getBucket(hash)
    const bucketEntry = bucket && _._getBucketEntry(key, hash, bucket)

    // Entry exits? Delete or update
    if (bucketEntry) {
      const b = <HashEntryLinkedList<TKey, TValue>>bucket
      if (value === VOID0) {
        let x = b.removeNode(bucketEntry),
          y = entries.removeNode(bucketEntry.value)

        if (x && !b.count) {
          delete buckets[hash]
          linkedNodeList(b)
        }

        if (x !== y) throw 'Entries and buckets are out of sync.'

        if (x) return true
      } else {
        // We don't expose the internal hash entries so replacing the value is ok.
        const old = bucketEntry.value.value
        bucketEntry.value.value = value
        return !areEqual(value, old)
      }
    } else if (value !== VOID0) {
      if (!bucket) bucket = _._getBucket(hash, true)
      if (!bucket)
        throw new Error(`"${hash.toString()}" cannot be added to lookup table.`)
      let entry = new HashEntry(key, value)
      entries.addNode(entry)
      bucket.addNode(new HashEntry(key, entry))
      return true
    }

    return false
  }

  protected _clearInternal(): number {
    const _ = this
    const buckets = _._buckets

    // Ensure reset and clean...
    for (let key in buckets) {
      if (buckets.hasOwnProperty(key)) {
        let bucket = buckets[key]
        delete buckets[key]
        linkedNodeList(bucket)
      }
    }

    return _._entries.clear()
  }

  /*
   * Note: super.getEnumerator() works perfectly well,
   * but enumerating the internal linked node list is much more efficient.
   */
  getEnumerator(): FiniteIEnumerator<KeyValuePair<TKey, TValue>> {
    const _ = this
    _.throwIfDisposed()

    let ver: number, currentEntry: IHashEntry<TKey, TValue> | undefined
    return new FiniteEnumeratorBase<KeyValuePair<TKey, TValue>>(
      () => {
        _.throwIfDisposed()
        ver = _._version
        currentEntry = _._entries.first
      },
      (yielder) => {
        if (currentEntry) {
          _.throwIfDisposed()
          _.assertVersion(ver)
          const result = { key: currentEntry.key, value: currentEntry.value }
          currentEntry = currentEntry.next
          return yielder.yieldReturn(result)
        }
        return yielder.yieldBreak()
      }
    )
  }

  protected getKeys(): TKey[] {
    const _ = this
    const result: TKey[] = []
    let e: any = _._entries && _._entries.first
    while (e) {
      result.push(e.key)
      e = e.next
    }
    return result
  }

  protected getValues(): TValue[] {
    const _ = this
    const result: TValue[] = []
    let e: any = _._entries && _._entries.first
    while (e) {
      result.push(e.value)
      e = e.next
    }
    return result
  }
}

export default Dictionary
