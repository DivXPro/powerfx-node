import { IComparer } from '../utils/types'

export class StringDistanceComparer implements IComparer<string> {
  private readonly original: string
  private readonly maxLength: number

  private readonly cache = new Map<string, number>()

  constructor(original: string, maxLength = 2147483647) {
    this.original = original
    this.maxLength = maxLength
  }

  public distance(other: string) {
    if (this.original.length > this.maxLength || other.length > this.maxLength) return Number.MAX_VALUE

    if (this.cache.has(other)) {
      return this.cache.get(other)
    }

    // Common prefixes will be frequent, skip them.
    let start: number
    for (start = 0; start < other.length && start < this.original.length; ++start) {
      if (other[start] != this.original[start]) break
    }

    // One string is a prefix of the other, so we just have to give the length of the trailing portion
    if (start == other.length - 1 || start == this.original.length - 1) {
      this.cache.set(other, Math.abs(other.length - this.original.length))
      return this.cache.get(other)
    }

    // Need to leave one extra character for transpositions.
    start = Math.max(start - 1, 0)

    this.cache.set(other, StringDistanceComparer.CoreDistance(this.original.substr(start), other.substr(start)))
    return this.cache.get(other)
  }

  private static CoreDistance(left: string, right: string) {
    let distances: number[][] = []

    for (let i = 1; i < left.length + 1; ++i) distances[i][0] = i

    for (let j = 1; j < right.length + 1; ++j) distances[0][j] = j

    for (let j = 1; j < right.length + 1; ++j) {
      for (let i = 1; i < left.length + 1; ++i) {
        let substitute = distances[i - 1][j - 1]
        if (left[i - 1] != right[j - 1]) {
          substitute += left[i - 1].toLocaleLowerCase() != right[j - 1].toLocaleLowerCase() ? 1 : 0.1
        }

        const del = distances[i - 1][j] + 1
        const insert = distances[i][j - 1] + 1

        distances[i][j] = Math.min(del, Math.min(insert, substitute))
        if (i > 1 && j > 1 && left[i - 1] == right[j - 2] && left[i - 2] == right[j - 1]) {
          distances[i][j] = Math.min(distances[i][j], distances[i - 2][j - 2] + 1)
        }
      }
    }

    return distances[left.length][right.length]
  }

  public compare(x: string, y: string) {
    const disX = this.distance(x)
    const disY = this.distance(y)
    if (disX == undefined || disY == undefined) {
      return -1
    }
    return disX - disY
  }
}
