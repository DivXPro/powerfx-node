import { isNullOrEmpty, isSpace } from './CharacterUtils'
import { Hashing } from './Hash'
import { ICheckable } from './types'

declare type MakeValidResult = [DName, boolean]

export class DName implements ICheckable {
  private static StrUnderscore = '_'
  private static ChSpace = ' '

  private readonly _value: string = ''

  static Default() {
    return new DName()
  }

  constructor(value?: string) {
    this._value = value || this._value
  }

  public get value() {
    return this._value || ''
  }

  public getValue() {
    return this._value || ''
  }

  public get isValid() {
    return this._value != null
  }

  public toString() {
    return this._value
  }

  public getHashCode() {
    return Hashing.HashString(this.value)
  }

  public equals(name: string): boolean
  public equals(name: DName): boolean
  public equals(name: DName | string) {
    if (name instanceof DName) {
      return this._value === name.getValue()
    }
    if (typeof name === 'string') {
      return this._value === name
    }
    return false
  }

  public static Equals(name1: DName | string, name2: DName | string) {
    const nameStr1 = typeof name1 === 'string' ? name1 : name1.getValue()
    const nameStr2 = typeof name2 === 'string' ? name1 : name2.getValue()
    return nameStr1 == nameStr2
  }

  // Returns whether the given name is a valid DName as defined above.
  public static IsValidDName(strName: string) {
    // Contracts.AssertValueOrNull(strName);

    if (isNullOrEmpty(strName)) return false

    for (let i = 0; i < strName.length; i++) {
      const ch = strName[i]
      if (!isSpace(ch)) return true
    }

    return false
  }

  public static MakeValid(strName?: string): MakeValidResult {
    if (isNullOrEmpty(strName)) {
      return [new DName(DName.StrUnderscore), true]
    }
    let fAllSpace = true
    if (strName != null) {
      for (let i = 0; i < strName.length; i++) {
        fAllSpace = fAllSpace && strName[i] === DName.ChSpace
      }
      if (!fAllSpace) {
        return [new DName(strName), false]
      }
    }
    return [new DName(this.StrUnderscore + strName), true]
  }
}
