import { DName } from '../utils/DName'
import { RedBlackNode } from '../utils/RedBlackTree'
import { IEnumerable, IEquatable, KeyValuePair } from '../utils/types'
import { DType } from './DType'

export class TypeTree implements IEquatable<TypeTree>, IEnumerable<KeyValuePair<string, DType>> {
  public readonly root?: RedBlackNode<DType>
  private readonly hashCodeCache: Map<RedBlackNode<DType>, number>

  constructor(root?: RedBlackNode<DType>) {
    this.root = root
    this.hashCodeCache = new Map()
  }

  assertValid() {
    // #if PARANOID_VALIDATION
    if (this.root != null) {
      this.root.assertValid()
    }
  }

  public static Create(items: KeyValuePair<string, DType>[]) {
    // Contracts.AssertValue(items)
    // items.forEach(item => {
    //   Contracts.AssertNonEmpty(item.Key)
    //   Contracts.Assert(item.Value.IsValid)
    // })

    return new TypeTree(RedBlackNode.CreateByPairs(items))
  }

  get isEmpty() {
    return this.root == null
  }

  get count() {
    return this.root == null ? 0 : this.root.count
  }

  public contains(key: string) {
    // Contracts.AssertValue(key)
    return this.tryGetValue(key)[0]
  }

  public tryGetValue(key: string): [boolean, DType | undefined] {
    // Contracts.AssertValue(key)
    const result = RedBlackNode.TryGetValue(this.root as RedBlackNode<DType>, key)
    const fRet = result[0]
    const value = result[1] || DType.Invalid
    // Contracts.Assert(fRet === value?.isValid())
    return [fRet, value]
  }

  public getPairsArray() {
    return RedBlackNode.GetPairsArray(this.root)
  }

  // public *getPairs() {
  //   return RedBlackNode.GetPairs(this.root)
  // }

  public setItem(name: string, type: DType, skipCompare = false) {
    // Contracts.AssertValue(name)
    // Contracts.Assert(type.IsValid)
    return new TypeTree(RedBlackNode.SetItem(this.root as RedBlackNode<DType>, name, type, skipCompare))
  }

  public removeItem(fMissing: boolean, name: string): [TypeTree, boolean] {
    // Contracts.AssertValue(name)
    const result = RedBlackNode.RemoveItem(this.root as RedBlackNode<DType>, name, this.hashCodeCache)
    return [new TypeTree(result[0]), result[1]]
  }

  public removeItems(fAnyMissing: boolean, ...rgname: DName[]): [TypeTree, boolean] {
    // Contracts.AssertNonEmpty(rgname)
    // Contracts.AssertAllValid(rgname)
    let root = this.root
    rgname.forEach((dname) => {
      // Contracts.AssertNonEmpty(name)
      const result = RedBlackNode.RemoveItem(root as RedBlackNode<DType>, dname.toString(), this.hashCodeCache)
      root = result[0]
      fAnyMissing = result[1]
    })
    return [new TypeTree(root), fAnyMissing]
  }

  public static Equals(tree1: TypeTree, tree2: TypeTree) {
    return RedBlackNode.Equals(tree1.root, tree2.root)
  }

  public equals(other: any) {
    if (other instanceof TypeTree) {
      return TypeTree.Equals(this, other)
    }
    return false
  }

  public getHashCode() {
    let hash = 0x450c1e25
    if (this.root != null) {
      if (this.hashCodeCache.has(this.root)) {
        hash = this.hashCodeCache.get(this.root)
      } else {
        hash = this.root.getHashCode()
      }
    }
    return hash
  }

  public getEnumerator() {
    return this.getPairsArray()
  }

  public first() {
    return this.getEnumerator()[0]
  }

  public last() {
    return this.getEnumerator()[this.count]
  }
}
