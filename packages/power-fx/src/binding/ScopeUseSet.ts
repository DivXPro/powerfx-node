// A ScopeUseSet is intrinsically associated with a scope S, and
// encodes that scope's "use set", i.e. the set of up-counts relative

import { StringBuilder } from '../utils/StringBuilder'

// to S where the various lambda params used in S are actually declared.
export class ScopeUseSet {
  // Pseudo-level to identify the "globals".
  public static readonly GlobalScopeLevel = -1

  // 64 bits should be more than sufficient, since they encode a
  // maximum algorithmic complexity of O(n^64).
  public static readonly MaxUpCount = 63

  public static readonly GlobalsOnly = new ScopeUseSet(undefined)

  // 0 means only globals are used (default).
  // A value other than zero means lambda parameters are used, as follows:
  //  bit 0: lambda params in the current scope (0) are used.
  //  bit 1: lambda params in the parent scope (1) are used.
  //  bit 2: lambda params in the grandparent scope (2) are used.
  //  ...
  // An expression may use lambda params in any or all of its ancestor scopes.
  private readonly _levels: number

  public get isGlobalOnlyScope() {
    return this._levels === 0
  }

  public get isLambdaScope() {
    return this._levels !== 0
  }

  constructor(singleLevel: number) {
    // Contracts.AssertIndexInclusive(singleLevel, MaxUpCount);
    if (singleLevel == undefined || singleLevel == null) {
      this._levels = 0
    } else {
      this._levels = 1 << singleLevel
    }
  }

  public union(other: ScopeUseSet): ScopeUseSet {
    return new ScopeUseSet(this._levels | other?._levels)
  }

  public translateToParentScope(): ScopeUseSet {
    return new ScopeUseSet(this._levels >> 1)
  }

  public getInnermost(): number {
    if (this._levels == 0) return ScopeUseSet.GlobalScopeLevel

    for (let i = 0; i <= ScopeUseSet.MaxUpCount; i++) {
      if ((this._levels & (1 << i)) != 0) return i
    }

    // Can never get here.
    // Contracts.Assert(false, "We should never get here.");
    return ScopeUseSet.GlobalScopeLevel
  }

  public toString(): string {
    if (this.isGlobalOnlyScope) return '{{Global}}'

    const sb = new StringBuilder('{')
    let sep = ''
    for (let i = 0; i <= ScopeUseSet.MaxUpCount; i++) {
      if ((this._levels & (1 << i)) != 0) {
        sb.append(sep)
        sb.append(i)
        sep = ','
      }
    }

    sb.append('}')
    return sb.toString()
  }
}
