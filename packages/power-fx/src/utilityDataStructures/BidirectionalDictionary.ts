import { Dictionary } from '../utils/Dictionary'

export class BidirectionalDictionary<TFirst, TSecond> {
  private _firstToSecond: Dictionary<TFirst, TSecond> = new Dictionary<TFirst, TSecond>()
  private _secondToFirst: Dictionary<TSecond, TFirst> = new Dictionary<TSecond, TFirst>()

  constructor() {}

  public add(first: TFirst, second: TSecond) {
    if (this._firstToSecond.has(first) || this._secondToFirst.has(second)) {
      return false
    }
    this._firstToSecond.set(first, second)
    this._secondToFirst.set(second, first)
    return true
  }

  public containsFirstKey(first: TFirst) {
    return this._firstToSecond.has(first)
  }

  public containsSecondKey(second: TSecond) {
    return this._secondToFirst.has(second)
  }

  public tryGetFromFirst(first: TFirst): [boolean, TSecond | undefined] {
    return [this._firstToSecond.has(first), this._firstToSecond.get(first)]
  }

  public tryGetFromSecond(second: TSecond): [boolean, TFirst | undefined] {
    return [this._secondToFirst.has(second), this._secondToFirst.get(second)]
  }

  public tryRemoveFromFirst(first: TFirst): boolean {
    let second: TSecond
    if (this._firstToSecond.has(first)) {
      second = this._firstToSecond.get(first) as TSecond
      return this._firstToSecond.delete(first) && this._secondToFirst.delete(second)
    }
    return false
  }

  public tryRemoveFromSecond(second: TSecond): boolean {
    let first: TFirst
    if (this._secondToFirst.has(second)) {
      first = this._secondToFirst.get(second) as TFirst
      return this._firstToSecond.delete(first) && this._secondToFirst.delete(second)
    }
    return false
  }

  public getEnumerator() {
    return this._firstToSecond
  }
}
