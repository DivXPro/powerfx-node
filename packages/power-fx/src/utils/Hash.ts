import hash from 'object-hash'

export function hashCode(obj: any) {
  return hash(obj)
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class Hashing {
  public static CombineHash(u1: number, u2: number) {
    return ((u1 << 7) | (u1 >> 25)) ^ u2
  }

  public static CombineHash5(u1: number, u2: number, u3: number, u4: number, u5: number) {
    return ((u1 << 7) | (u1 >> 25)) ^ u2 ^ (((u3 << 15) | (u3 >> 17)) ^ u4) ^ (u5 << 5)
  }

  public static CombineHash4(u1: number, u2: number, u3: number, u4: number) {
    return Hashing.CombineHash(Hashing.CombineHash(u1, u2), Hashing.CombineHash(u2, u4))
  }

  public static CombineHash7(u1: number, u2: number, u3: number, u4: number, u5: number, u6: number, u7: number) {
    return Hashing.CombineHash(Hashing.CombineHash5(u1, u2, u3, u4, u5), Hashing.CombineHash(u6, u7))
  }

  /// <summary>
  /// Hash the characters in a string.
  /// </summary>
  /// <param name="str">The string instance to hash.</param>
  public static HashString(str: string) {
    // Contracts.AssertValue(str);

    let hash1 = 5381
    const hash2 = hash1

    for (let ich = str.length; ich > 0; ) {
      hash1 = ((hash1 << 5) + hash1) ^ str.charCodeAt(--ich)
      if (ich <= 0) {
        break
      }
    }

    return Hashing.HashUint(hash1 + hash2 * 1566083941)
  }

  public static Hash(obj: any) {
    if (typeof obj.getHashCode === 'function') {
      return obj.getHashCode()
    }
    if (typeof obj === 'number') {
      return Hashing.HashInt(obj)
    }
    if (typeof obj === 'string') {
      return Hashing.HashString(obj)
    }
    return Hashing.HashString(hashCode(obj))
  }

  public static HashUint(u: number) {
    const uu = u * 0x7ff19519 // this number is prime.
    return uu
  }

  public static HashInt(i: number) {
    const ii = i * 0x7ff19519 // this number is prime.
    return ii
  }
}
