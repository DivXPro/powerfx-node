import { hashCode } from './Hash'
import { ICheckable, IEquatable } from './types'

export class EquatableObject implements IEquatable<EquatableObject>, ICheckable {
  public readonly object: any
  get isValid() {
    return this.object != null
  }

  constructor(object: any) {
    // Contracts.AssertValueOrNull(object)
    this.object = object
  }

  public equals(other: any) {
    if (other instanceof EquatableObject) {
      return this.getHashCode() === other.getHashCode()
    }
    return false
  }

  public getHashCode() {
    const hash = (0x54a0f261).toString()
    return hashCode(this)
  }

  // TODO:
  public appendTo() {}
}
