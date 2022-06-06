import { Dictionary } from './Dictionary'
import { Stack } from './Stack'

export class CollectionUtils {
  public static Swap<T>(a: T, b: T): [T, T] {
    const c = a
    a = b
    b = c
    return [a, b]
  }

  public static EnsureInstanceCreated<T>(memberVariable: T, creationMethod: () => T): T {
    if (memberVariable == null) {
      memberVariable = creationMethod()
    }
    return memberVariable
  }

  // Getting the size of a collection, when the collection may be null.

  public static Size<T>(rgv: T[] | Stack<T> | Map<any, any> | Set<any>): number {
    // Contracts.AssertValueOrNull(rgv);
    if (Array.isArray(rgv)) {
      return rgv == null ? 0 : rgv.length
    }
    if (rgv instanceof Stack) {
      return rgv == null ? 0 : rgv.size()
    }
    if (rgv instanceof Map) {
      return rgv == null ? 0 : rgv.size
    }
    if (rgv instanceof Set) {
      return rgv == null ? 0 : rgv.size
    }
    return 0
  }

  public static Contains<T>(collection: Array<T> | Set<T>, item: T): boolean {
    if (collection == null) return false
    if (Array.isArray(collection)) {
      return collection.includes(item)
    }
    if (item instanceof Set) {
      return collection.has(item)
    }
  }

  // Getting items from a collection when the collection may be null.

  // TODO: 实现不完整
  public static TryGetValue<K, V>(map: Map<K, V>, key: K): [boolean, V] {
    // Contracts.AssertValueOrNull(map);
    let value: V
    if (map == null) {
      if (typeof value === 'boolean') {
        value = false as unknown as V
        return [false, value]
      }
      if (typeof value === 'number') {
        value = 0 as unknown as V
        return [false, value]
      }
      if (typeof value === 'string') {
        value = '' as unknown as V
        return [false, value]
      }
      return [false, value]
    }
    return [map.has(key), map.get(key)]
  }

  // Adding items to a collection when the collection may be null.

  public static Add<T>(list: Array<T>, item: T) {
    // Contracts.AssertValueOrNull(list);
    if (list == null) {
      list = []
    }
    list.push(item)
    return list
  }

  public static AddItems<T>(listDst: Array<T>, listSrc: Array<T>) {
    // Contracts.AssertValueOrNull(listSrc);
    // Contracts.AssertValueOrNull(listDst);

    if (listSrc == null || listSrc.length == 0) return
    if (listDst == null) listDst = []
    listDst.push(...listSrc)
    return listDst
  }

  public static AddDictionary<K, V>(map: Dictionary<K, V>, key: K, value: V, allowDupes = false) {
    // Contracts.AssertValueOrNull(map);
    if (map == null) {
      map = new Dictionary<K, V>()
    }
    if (allowDupes) {
      {
        map.set(key, value)
      }
    } else {
      map.set(key, value)
    }
    return map
  }

  public static AddSet<T>(list: Set<T>, item: T) {
    // Contracts.AssertValueOrNull(list);
    if (list == null) list = new Set<T>()
    list.add(item)
  }

  public static Push<T>(stack: Stack<T>, item: T) {
    // Contracts.AssertValueOrNull(stack);
    if (stack == null) stack = new Stack<T>()
    stack.push(item)
  }

  // public static T[] ToArray<T>(List<T> list)
  // {
  //     Contracts.AssertValueOrNull(list);
  //     return list == null ? null : list.ToArray();
  // }

  // public static void Sort<T>(List<T> list)
  // {
  //     Contracts.AssertValueOrNull(list);
  //     if (list != null)
  //         list.Sort();
  // }

  public static Append<TItem>(list: Array<TItem> | Set<TItem>, item: TItem): TItem {
    // Contracts.AssertValue(list)
    if (Array.isArray(list)) {
      list.push(item)
    }
    if (list instanceof Set) {
      list.add(item)
    }
    return item
  }

  public static With<Item>(list: Array<Item>, ...item: Array<Item>) {
    if (item == null) {
      return list
    }
    return list.concat(...item)
  }

  public static TryGetProperty<T>(data: Record<string | number, T>, key: string | number): { isGet: boolean; data: T } {
    return { isGet: data.hasOwnProperty(key), data: data[key] }
  }
}
