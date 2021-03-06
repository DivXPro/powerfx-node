/*!
 *
 * Licensing: MIT
 */

/**
 * A descriptor is simply a JSON tree that either has an actual value or a type that identifies what the expect type should be at that leaf in the tree.
 *
 * let descriptor = {
 *      a : Object,
 *      b : String,
 *      c : {
 *          d : true ,
 *          e : Array,
 *          f : []
 *      },
 *      g : "literal"
 * }
 */

import Type, { TypeInfo } from './Types'
import { areEqual } from './Compare'

export class TypeInfoHelper extends TypeInfo {
  private _value: any

  constructor(value: any) {
    super(value, (self) => (self._value = value))
  }

  contains<TDescriptor>(descriptor: any): this is TDescriptor {
    let value = this._value

    if (value === descriptor) return true

    switch (descriptor) {
      case Function:
        return this.isFunction
      case Object:
        return this.isObject
      case Array:
        return this.isArray
      case String:
        return this.isString
      case Number:
        return this.isNumber
      case Boolean:
        return this.isBoolean
    }

    if (
      this.type != typeof descriptor ||
      (this.isPrimitive && !areEqual(value, descriptor))
    )
      return false

    // Check array contents and confirm intersections.
    if (this.isArray && Type.isArrayLike(descriptor)) {
      let max = Math.min(descriptor.length, value.length)

      for (let i = 0; i < max; i++) {
        if (areInvalid(value[i], descriptor[i])) return false
      }

      return true
    }

    if (this.isObject) {
      let targetKeys = Object.keys(value)
      let dKeys = Object.keys(descriptor)

      // Quick check...
      if (dKeys.length > targetKeys.length) return false

      // Quick check #2...
      for (let key of dKeys) {
        if (targetKeys.indexOf(key) == -1) return false
      }

      // Final pass with recursive...
      for (let key of dKeys) {
        if (areInvalid(value[key], descriptor[key])) return false
      }
    }

    return true
  }
}

function areInvalid(v: any, d: any) {
  if (!areEqual(v, d)) {
    let memberType = new TypeInfoHelper(v)
    if (!memberType.contains(d)) return true
  }
  return false
}

export default class TypeValidator<T> {
  constructor(private readonly _typeDescriptor: any) {
    Object.freeze(this)
  }

  isSubsetOf(o: any): o is T {
    return new TypeInfoHelper(o).contains(this._typeDescriptor)
  }
}
