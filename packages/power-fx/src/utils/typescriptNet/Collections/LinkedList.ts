/*!
 *
 * Based Upon: http://msdn.microsoft.com/en-us/library/he2s3bh7%28v=vs.110%29.aspx
 *
 */

import { areEqual } from '../Compare'
import LinkedNodeList from './LinkedNodeList'
import InvalidOperationException from '../Exceptions/InvalidOperationException'
import ArgumentNullException from '../Exceptions/ArgumentNullException'
import CollectionBase from './CollectionBase'
import { ILinkedListNode, ILinkedNode, INodeWithValue } from './ILinkedListNode'
import { FiniteIEnumerator } from './Enumeration/IEnumerator'
import { ActionWithIndex, EqualityComparison, PredicateWithIndex } from '../FunctionTypes'
import ILinkedList from './ILinkedList'
import IDisposable from '../Disposable/IDisposable'
import FiniteEnumerableOrArrayLike from './FiniteEnumerableOrArrayLike'

const VOID0: undefined = void 0

/*****************************
 * IMPORTANT NOTES ABOUT PERFORMANCE:
 * http://jsperf.com/simulating-a-queue
 *
 * Adding to an array is very fast, but modifying is slow.
 * LinkedList wins when modifying contents.
 * http://stackoverflow.com/questions/166884/array-versus-linked-list
 *****************************/

/*
 * An internal node is used to manage the order without exposing underlying link chain to the consumer.
 */
class InternalNode<T> implements ILinkedNode<InternalNode<T>>, INodeWithValue<T> {
  constructor(public value: T, public previous?: InternalNode<T>, public next?: InternalNode<T>) {}

  external?: ILinkedListNode<T>

  assertDetached(): true | never {
    if (this.next || this.previous) throw new InvalidOperationException('Adding a node that is already placed.')
    return true
  }
}

function ensureExternal<T>(node: InternalNode<T> | undefined, list: LinkedList<T>): ILinkedListNode<T> | undefined {
  if (!node) return VOID0
  if (!list) throw new ArgumentNullException('list')

  let external = node.external
  if (!external) node.external = external = new LinkedListNode<T>(list, node)

  return external
}

function getInternal<T>(node: ILinkedListNode<T>, list: LinkedList<T>): InternalNode<T> {
  if (!node) throw new ArgumentNullException('node')
  if (!list) throw new ArgumentNullException('list')

  if (node.list != list) throw new InvalidOperationException('Provided node does not belong to this list.')

  let n: InternalNode<T> = (<any>node)._nodeInternal
  if (!n) throw new InvalidOperationException('Provided node is not valid.')

  return n
}

function detachExternal(node: InternalNode<any>): void {
  if (node) {
    const e: any = node.external
    if (e) {
      e._list = VOID0
      e._nodeInternal = VOID0
    }
    node.external = VOID0
  }
}

export class LinkedList<T> extends CollectionBase<T> implements ILinkedList<T> {
  private readonly _listInternal: LinkedNodeList<InternalNode<T>>

  constructor(source?: FiniteEnumerableOrArrayLike<T>, equalityComparer: EqualityComparison<T> = areEqual) {
    super(VOID0, equalityComparer)
    this._listInternal = new LinkedNodeList<InternalNode<T>>()
    this._importEntries(source)
  }

  protected assertVersion(version: number): true | never {
    if (this._listInternal) return this._listInternal.assertVersion(version)
    // In case it's been disposed.
    else return super.assertVersion(version)
  }

  protected _onDispose(): void {
    super._onDispose()
    const l = this._listInternal
    ;(<any>this)._listInternal = null
    l.dispose()
  }

  protected getCount(): number {
    const li = this._listInternal
    return li ? li.unsafeCount : 0
  }

  protected _addInternal(entry: T): boolean {
    this._listInternal.addNode(new InternalNode(entry))
    return true
  }

  protected _removeInternal(entry: T, max: number = Infinity): number {
    const _ = this,
      equals = _._equalityComparer,
      list = _._listInternal
    let removedCount = 0

    list.forEach((node) => {
      if (node && equals(entry, node.value) && _._removeNodeInternal(node)) removedCount++

      return removedCount < max
    }, true /* override versioning check */)

    return removedCount
  }

  protected _clearInternal(): number {
    const list = this._listInternal
    list.forEach((node) => detachExternal(node))
    return list.clear()
  }

  forEach(action: ActionWithIndex<T>, useCopy?: boolean): number
  forEach(action: PredicateWithIndex<T>, useCopy?: boolean): number
  forEach(action: ActionWithIndex<T> | PredicateWithIndex<T>, useCopy: boolean = false): number {
    this.throwIfDisposed()
    return useCopy
      ? super.forEach(action, useCopy)
      : this._listInternal.forEach((node, i) => action(<any>node.value, i))
  }

  // #endregion

  // #region IEnumerable<T>
  getEnumerator(): FiniteIEnumerator<T> {
    this.throwIfDisposed()
    return LinkedNodeList.valueEnumeratorFrom<T>(<any>this._listInternal)
  }

  // #endregion

  private _findFirst(entry: T): InternalNode<T> | undefined {
    //noinspection UnnecessaryLocalVariableJS
    const _ = this,
      equals = _._equalityComparer

    let next: any = _._listInternal && _._listInternal.first
    while (next) {
      if (equals(entry, next.value)) return next
      next = next.next
    }
    return VOID0
  }

  private _findLast(entry: T): InternalNode<T> | undefined {
    //noinspection UnnecessaryLocalVariableJS
    const _ = this,
      equals = _._equalityComparer

    let prev: any = _._listInternal && _._listInternal.last
    while (prev) {
      if (equals(entry, prev.value)) return prev
      prev = prev.previous
    }
    return VOID0
  }

  removeOnce(entry: T): boolean {
    return this.remove(entry, 1) !== 0
  }

  get first(): ILinkedListNode<T> | undefined {
    const li = this._listInternal
    return li && ensureExternal(li.first, this)
  }

  get firstValue(): T | undefined {
    const li = this._listInternal,
      node = li && li.first
    return node ? node.value : VOID0
  }

  get last(): ILinkedListNode<T> | undefined {
    const li = this._listInternal
    return ensureExternal(li.last, this)
  }

  get lastValue(): T | undefined {
    const li = this._listInternal,
      node = li && li.last
    return node ? node.value : VOID0
  }

  // get methods are available for convenience but is an n*index operation.

  getValueAt(index: number): T | undefined {
    const li = this._listInternal,
      node = li && li.getNodeAt(index)
    return node ? node.value : VOID0
  }

  getNodeAt(index: number): ILinkedListNode<T> | undefined {
    const li = this._listInternal
    return li && ensureExternal(li.getNodeAt(index), this)
  }

  find(entry: T): ILinkedListNode<T> | undefined {
    const li = this._listInternal
    return li && ensureExternal(this._findFirst(entry), this)
  }

  findLast(entry: T): ILinkedListNode<T> | undefined {
    const li = this._listInternal
    return li && ensureExternal(this._findLast(entry), this)
  }

  addFirst(entry: T): this {
    this.assertModifiable()
    this._listInternal.addNodeBefore(new InternalNode(entry))
    this._signalModification(true)
    return this
  }

  addLast(entry: T): this {
    return this.add(entry)
  }

  private _removeNodeInternal(node: InternalNode<T> | undefined): boolean {
    const _ = this
    if (node && _._listInternal.removeNode(node)) {
      detachExternal(node)
      _._signalModification(true)
      return true
    }
    return false
  }

  takeFirstValue(): T | undefined {
    const _ = this
    const n = _._listInternal.first
    return _._removeNodeInternal(n) ? n?.value : VOID0
  }

  removeFirst(): boolean {
    const _ = this
    _.assertModifiable()
    return _._removeNodeInternal(_._listInternal.first)
  }

  takeLastValue(): T | undefined {
    const _ = this
    const n = _._listInternal.last
    return _._removeNodeInternal(n) ? n?.value : VOID0
  }

  removeLast(): boolean {
    const _ = this
    _.assertModifiable()
    return _._removeNodeInternal(_._listInternal.last)
  }

  removeAt(index: number): boolean {
    const _ = this
    _.assertModifiable()
    return _._removeNodeInternal(_._listInternal.getNodeAt(index))
  }

  // Returns true if successful and false if not found (already removed).
  removeNode(node: ILinkedListNode<T>): boolean {
    const _ = this
    _.assertModifiable()
    return _._removeNodeInternal(getInternal(node, _))
  }

  addBefore(before: ILinkedListNode<T>, entry: T): this {
    const _ = this
    _.assertModifiable()
    _._listInternal.addNodeBefore(new InternalNode(entry), getInternal(before, _))

    _._signalModification(true)
    return this
  }

  addAfter(after: ILinkedListNode<T>, entry: T): this {
    const _ = this
    _.assertModifiable()
    _._listInternal.addNodeAfter(new InternalNode(entry), getInternal(after, _))

    _._signalModification(true)
    return this
  }
}

// Use an internal node class to prevent mucking up the LinkedList.
class LinkedListNode<T> implements ILinkedListNode<T>, IDisposable {
  constructor(private _list: LinkedList<T>, private _nodeInternal: InternalNode<T>) {}

  private throwIfDetached(): void {
    if (!this._list) throw new Error('This node has been detached from its list and is no longer valid.')
  }

  get list(): LinkedList<T> {
    return this._list
  }

  get previous(): ILinkedListNode<T> | undefined {
    this.throwIfDetached()
    return ensureExternal(this._nodeInternal.previous, this._list)
  }

  get next(): ILinkedListNode<T> | undefined {
    this.throwIfDetached()
    return ensureExternal(this._nodeInternal.next, this._list)
  }

  get value(): T {
    this.throwIfDetached()
    return this._nodeInternal.value
  }

  set value(v: T) {
    this.throwIfDetached()
    this._nodeInternal.value = v
  }

  addBefore(entry: T): this {
    this.throwIfDetached()
    this._list.addBefore(this, entry)
    return this
  }

  addAfter(entry: T): this {
    this.throwIfDetached()
    this._list.addAfter(this, entry)
    return this
  }

  remove(): void {
    const _: any = this
    const list = _._list
    if (list) list.removeNode(this)
    _._list = VOID0
    _._nodeInternal = VOID0
  }

  dispose(): void {
    this.remove()
  }
}

export default LinkedList
