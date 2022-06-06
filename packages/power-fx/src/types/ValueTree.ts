import { DName } from '../utils/DName'
import { EquatableObject } from '../utils/EquatableObject'
import { Hashing } from '../utils/Hash'
import { RedBlackNode } from '../utils/RedBlackTree'
import { IEquatable, KeyValuePair } from '../utils/types'

export class ValueTree implements IEquatable<ValueTree> {
  private readonly root?: RedBlackNode<EquatableObject>
  private readonly hashCodeCache: Map<RedBlackNode<EquatableObject>, number>

  constructor(root?: RedBlackNode<EquatableObject>) {
    this.root = root
    this.hashCodeCache = new Map()
  }
  assertValid() {
    // #if PARANOID_VALIDATION
    if (this.root != null) {
      this.root.assertValid()
    }
  }

  public static Create(items: KeyValuePair<string, EquatableObject>[]) {
    // Contracts.AssertValue(items)
    // items.forEach(item => {
    //   // Contracts.AssertNonEmpty(item.Key)
    //   // Contracts.Assert(item.Value.IsValid)
    // })
    return new ValueTree(RedBlackNode.CreateByPairs(items))
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

  public tryGetValue(key: string): [boolean, EquatableObject] {
    // Contracts.AssertValue(key)
    const result = RedBlackNode.TryGetValue(this.root as RedBlackNode<EquatableObject>, key)
    const fRet = result[0]
    const value = result[1]
    // Contracts.Assert(fRet == (value.Object != null))
    return [fRet, value]
  }

  public getPairsArray() {
    return RedBlackNode.GetPairsArray(this.root)
  }

  public setItem(name: string, value: EquatableObject) {
    // Contracts.AssertValue(name);
    // Contracts.AssertValue(value.Object);
    return new ValueTree(RedBlackNode.SetItem(this.root as RedBlackNode<EquatableObject>, name, value))
  }

  public removeItem(name: string) {
    // Contracts.AssertValue(name)
    return new ValueTree(
      RedBlackNode.RemoveItem(this.root as RedBlackNode<EquatableObject>, name, this.hashCodeCache)[0],
    )
  }

  public removeItems(...rgname: DName[]) {
    // Contracts.AssertNonEmpty(rgname)
    // Contracts.AssertAllValid(rgname)
    let fAnyMissing: boolean
    let root = this.root
    rgname.forEach((dname) => {
      // Contracts.AssertNonEmpty(name)
      const result = RedBlackNode.RemoveItem(
        root as RedBlackNode<EquatableObject>,
        dname.toString(),
        this.hashCodeCache,
      )
      root = result[0]
      fAnyMissing = result[1]
    })
    return new ValueTree(root)
  }

  public static Equals(tree1: ValueTree, tree2: ValueTree) {
    return RedBlackNode.Equals(tree1.root, tree2.root)
  }

  public equals(other: any) {
    if (other instanceof ValueTree) {
      return ValueTree.Equals(this, other)
    }
    return false
  }

  public getHashCode() {
    let hash = 0x79b70f13
    if (this.root != null) {
      if (this.hashCodeCache.has(this.root)) {
        hash = this.hashCodeCache.get(this.root)
      } else {
        hash = Hashing.CombineHash(hash, this.root.getHashCode())
      }
    }
    return hash
  }
}
