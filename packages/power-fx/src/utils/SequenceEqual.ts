import { IEquatable } from './types'

export function sequenceEqual<T extends IEquatable<any>>(a: Array<T>, b: Array<T>) {
  if (a.length != b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (!b[i].equals(a[i])) {
      return false
    }
  }
  return true
}
