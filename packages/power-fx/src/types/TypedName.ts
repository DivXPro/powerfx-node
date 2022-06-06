import { DName } from '../utils/DName'
import { ICheckable, IEquatable } from '../utils/types'
import { DType } from './DType'

export class TypedName implements IEquatable<TypedName>, ICheckable {
  public readonly name: DName
  public readonly type: DType

  constructor(type: DType, name: DName) {
    this.name = name
    this.type = type
  }

  get isValid() {
    return this.name.isValid && this.type.isValid
  }

  equals(other: TypedName | any): boolean {
    // Contracts.AssertValueOrNull(other)
    if (other instanceof TypedName) {
      return this.name === other.name && this.type == other.type
    }
    return false
  }

  toString() {
    return `${this.name.toString()}: ${this.type.toString()}`
  }

  getHashCode() {}
}
