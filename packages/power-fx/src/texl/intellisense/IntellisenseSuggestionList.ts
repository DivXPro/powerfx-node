// Specialized IntellisenseSuggestion list that allows for some effient operations on the list.
// For example, checking if the list contains a suggestion with a particular display name is

import ArrayLikeWritable from '../../utils/typescriptNet/Collections/Array/ArrayLikeWritable'
import Dictionary from '../../utils/typescriptNet/Collections/Dictionaries/Dictionary'
import { FiniteIEnumerable } from '../../utils/typescriptNet/Collections/Enumeration/IEnumerable'
import { FiniteIEnumerator } from '../../utils/typescriptNet/Collections/Enumeration/IEnumerator'
import { IList } from '../../utils/typescriptNet/Collections/IList'
import { List } from '../../utils/typescriptNet/Collections/List'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { UIString } from './UIString'

// O(1) for this class instead of an O(N) search.
export class IntellisenseSuggestionList
  implements IList<IntellisenseSuggestion>
{
  private _displayNameToCount: Map<string, number>
  private _textToSuggestions: Map<string, IntellisenseSuggestion[]>
  private _backingList: IntellisenseSuggestion[]

  constructor() {
    this._displayNameToCount = new Map<string, number>()
    this._textToSuggestions = new Map<string, IntellisenseSuggestion[]>()
    this._backingList = [] // new List<IntellisenseSuggestion>();
  }

  get count(): number {
    return this._backingList.length
  }
  isReadOnly: boolean
  isEndless: false

  copyTo<TTarget extends ArrayLikeWritable<any>>(
    target: TTarget,
    index?: number
  ): TTarget {
    throw new Error('Method not implemented.')
  }
  getEnumerator(): FiniteIEnumerator<IntellisenseSuggestion> {
    throw new Error('Method not implemented.')
  }

  set(index: number, value: IntellisenseSuggestion): boolean {
    throw new Error('Method not implemented.')
  }

  importEntries(
    entries:
      | FiniteIEnumerable<IntellisenseSuggestion>
      | ArrayLike<IntellisenseSuggestion>
      | FiniteIEnumerator<IntellisenseSuggestion>
  ): number {
    throw new Error('Method not implemented.')
  }

  // get(index: number): IntellisenseSuggestion {
  //   throw new Error("Method not implemented.");
  // }
  indexOf(item: IntellisenseSuggestion): number {
    return this._backingList.indexOf(item)
  }

  //   public IntellisenseSuggestion this[number index]
  // {
  //             get { return _backingList[index]; }
  //   set
  //   {
  //     DecrementDictionaries(this[index]);
  //     _backingList[index] = value;
  //     IncrementDictionaries(value);
  //   }
  // }
  get(index: number): IntellisenseSuggestion {
    return this._backingList[index]
  }

  get list(): IntellisenseSuggestion[] {
    return this._backingList
  }

  toArray(): IntellisenseSuggestion[] {
    return this._backingList
  }

  public Count(): number {
    return this._backingList.length
  }

  // add(entry: IntellisenseSuggestion): this {
  //   throw new Error('Method not implemented.')
  // }

  public add(item: IntellisenseSuggestion) {
    this.IncrementDictionaries(item)
    this._backingList.push(item)
    return this
  }

  public addRange(items: IntellisenseSuggestion[]): void {
    for (let item of items) {
      this.IncrementDictionaries(item)
    }

    this._backingList = this._backingList.concat(items)
  }

  // remove(entry: IntellisenseSuggestion, max?: number): number {
  //   throw new Error('Method not implemented.')
  // }

  public remove(item: IntellisenseSuggestion, max?: number): number {
    // let result = _backingList.Remove(item);
    const idx = this._backingList.indexOf(item)
    if (idx > -1) {
      this._backingList.splice(idx, 1) //.Remove(a);

      this.DecrementDictionaries(item)
      return 1
    }
    return 0
    // if (result)
    //   DecrementDictionaries(item);

    // return result;
  }

  public removeRange(index: number, count: number) {
    for (let i = index; i < index + count; i++) {
      // DecrementDictionaries(this[i]);
      this.DecrementDictionaries(this.get(i))
    }

    // this._backingList.RemoveRange(index, count);
    // const idx = this._backingList.indexOf(item);
    // if (idx > -1) {
    this._backingList.splice(index, count) //.Remove(a);
  }

  // removeAt(index: number): boolean {
  //   throw new Error('Method not implemented.')
  // }

  public removeAt(index: number): boolean {
    // DecrementDictionaries(this[index]);
    this.DecrementDictionaries(this.get(index))
    this._backingList.splice(index, 1)
    return true
  }

  //   public RemoveAll(Predicate <IntellisenseSuggestion > pred): number
  // {
  //   foreach(let item of this)
  //   {
  //     if (pred(item))
  //       DecrementDictionaries(item);
  //   }

  //   return _backingList.RemoveAll(pred);
  // }

  public clear(): number {
    this._backingList = [] //.Clear();
    this._displayNameToCount.clear()
    this._textToSuggestions.clear()
    return 1
  }

  public insert(index: number, item: IntellisenseSuggestion): void {
    this.IncrementDictionaries(item)
    // this._backingList.Insert(index, item);
    this._backingList.splice(index, 0, item)
  }

  public insertRange(
    index: number,
    collection: IntellisenseSuggestion[]
  ): void {
    for (let item of collection) {
      this.IncrementDictionaries(item)
    }

    // _backingList.InsertRange(index, collection);
    this._backingList.splice(index, 0, ...collection)
  }

  contains(entry: IntellisenseSuggestion): boolean {
    return this._backingList.indexOf(entry) > 0
  }

  public containsSuggestion(displayText: string): boolean {
    return this._displayNameToCount.has(displayText)
  }

  public suggestionsForText(text: string): IntellisenseSuggestion[] {
    let list = this._textToSuggestions.get(text)
    return this._textToSuggestions.has(text) ? [...list] : []
    // new List<IntellisenseSuggestion>() :
    //  new List<IntellisenseSuggestion>();
  }

  public updateDisplayText(index: number, newText: UIString): void {
    this.DecrementDictionaries(this.get(index))
    // this[index].DisplayText = newText;
    this.get(index).DisplayText = newText
    this.IncrementDictionaries(this.get(index))
  }

  private IncrementDictionaries(item: IntellisenseSuggestion): void {
    let displayText: string = item.DisplayText.text
    if (!this._displayNameToCount.has(displayText)) {
      this._displayNameToCount.set(displayText, 0)
    }
    let newVal = this._displayNameToCount.get(displayText) + 1
    this._displayNameToCount.set(displayText, newVal)

    let sugText: string = item.Text
    if (!this._textToSuggestions.has(sugText)) {
      this._textToSuggestions.set(sugText, []) //[sugText] = new List<IntellisenseSuggestion>();
    }

    this._textToSuggestions.get(sugText).push(item) //.Add(item);
  }

  private DecrementDictionaries(item: IntellisenseSuggestion): void {
    // Contracts.Assert(_displayNameToCount.ContainsKey(item.DisplayText.Text));
    // Contracts.Assert(_textToSuggestions.ContainsKey(item.Text));

    let displayText: string = item.DisplayText.text

    let displayNameToCountNum = this._displayNameToCount.get(displayText) - 1
    this._displayNameToCount.set(displayText, displayNameToCountNum)
    if (this._displayNameToCount.get(displayText) == 0) {
      this._displayNameToCount.delete(displayText)
    }

    let sugText: string = item.Text
    let textToSuggestionsList = this._textToSuggestions.get(sugText) //.Remove(item);
    let textToSuggestionsIdx = textToSuggestionsList.indexOf(item)
    textToSuggestionsList.splice(textToSuggestionsIdx, 1)

    if (this._textToSuggestions.get(sugText).length == 0) {
      this._textToSuggestions.delete(sugText)
    }
  }

  public IndexOf(item: IntellisenseSuggestion): number {
    // return ((IList<IntellisenseSuggestion>)_backingList).IndexOf(item);
    return this._backingList.indexOf(item)
  }

  public Contains(item: IntellisenseSuggestion): boolean {
    // return ((IList<IntellisenseSuggestion>)_backingList).Contains(item);
    return this._backingList.indexOf(item) > -1
  }

  // public CopyTo(array: IntellisenseSuggestion[], arrayIndex: number) {
  //   ((IList<IntellisenseSuggestion>)_backingList).CopyTo(array, arrayIndex);
  // }

  // public GetEnumerator(): IntellisenseSuggestion[] {
  //   return ((IList<IntellisenseSuggestion>)_backingList).GetEnumerator();
  // }

  //       IEnumerator IEnumerable.GetEnumerator() {
  //   return ((IList<IntellisenseSuggestion>)_backingList).GetEnumerator();
  // }

  public Sort(): void {
    this._backingList.sort()
  }

  //   public FindIndex(Predicate <IntellisenseSuggestion > pred): number
  // {
  //   return _backingList.FindIndex(pred);
  // }

  public FindIndex(
    predicate: (value: IntellisenseSuggestion) => boolean
  ): number {
    return this._backingList.findIndex(predicate)
  }
}
