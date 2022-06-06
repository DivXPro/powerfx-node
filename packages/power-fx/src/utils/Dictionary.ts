export class Dictionary<K, V> extends Map<K, V> {
  constructor(entries?: readonly (readonly [K, V])[] | Map<K, V> | null) {
    super(entries)
  }

  public tryGetValue(key: K): [boolean, V] {
    return [this.has(key), this.get(key)]
  }

  public first(fn: (item: [K, V]) => boolean) {
    // const entries = this.entries()
    // const entriy = entries.next().value as [K, V]
    // return
    for (const item of this) {
      if (fn(item)) {
        return item
      }
    }
  }

  public toKeyValuePairs() {
    return Array.from(this.entries()).map((entriy) => ({ key: entriy[0], value: entriy[1] }))
  }
}
