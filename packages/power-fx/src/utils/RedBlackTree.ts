import { hashCode, Hashing } from './Hash'
import { Sorting } from './Sorting'
import { Stack } from './Stack'
import { IEquatable, KeyValuePair } from './types'

enum Color {
  Red,
  Black,
}

enum AddCoreResult {
  // The item was already in the tree, no change.
  ItemPresent,
  // The key was already in the tree, and was updated with a new value.
  // A new tree is being built, but no colors need to change.
  ItemUpdated,
  // The key was not in the tree.
  // A new tree is being built, but no colors need to change.
  ItemAdded,
  // The key was not in the tree.
  // A new tree is being built, the returned node should be red.
  NewNodeIsRed,
  // The key was not in the tree.
  // A new tree is being built, the returned node is red
  // and its left child is also red, the caller needs to fix this violation
  DoubleRedLeftChild,
  // The key was not in the tree.
  // A new tree is being built, the returned node is red
  // and its right child is also red, the caller needs to fix this violation
  DoubleRedRightChild,
}

enum RemoveCoreResult {
  // The key was not in the tree, no change.
  ItemNotFound,
  // The key was in the tree.
  // A new tree is being built, but no colors need to change.
  ItemRemoved,
  // The key was in the tree.
  // A new tree is being built, the returned node should be black.
  NewNodeIsBlack,
  // The key was in the tree.
  // A new tree is being built, the returned node is 'double black'
  // which is a violation that needs to be fixed by the caller.
  NewNodeIsDoubleBlack,
}

export abstract class RedBlackNode<V> implements IEquatable<RedBlackNode<V>> {
  public abstract count: number
  protected readonly key: string
  protected readonly value: V

  protected abstract left?: RedBlackNode<V>
  protected abstract right?: RedBlackNode<V>
  protected abstract leftColor?: Color
  protected abstract rightColor?: Color

  protected abstract cloneStructure(value: V): RedBlackNode<V>

  public assertValid() {
    // #if PARANOID_VALIDATION
    // Assume this is a root node and use black.
    // If we get a parent later, it will call AssertValidCore with our actual color.
    this.assertValidCore(Color.Black)
  }

  private assertValidCore(colorSelf?: Color) {
    let leftBlackHeight = 0
    let rightBlackHeight = 0
    let count = 1

    if (this.left != null) {
      // Tree should be sorted
      // Contracts.Assert(Compare(Left.Key, Key) < 0);
      leftBlackHeight = this.left.assertValidCore(this.leftColor)
      count += this.left.count
    } else {
      // Contracts.Assert(LeftColor == Color.Black);
      leftBlackHeight = 1
    }

    if (this.right != null) {
      // Tree should be sorted
      // Contracts.Assert(Compare(Right.Key, Key) > 0);
      rightBlackHeight = this.right.assertValidCore(this.rightColor)
      count += this.right.count
    } else {
      // Contracts.Assert(RightColor == Color.Black);
      rightBlackHeight = 1
    }
    // Contracts.Assert(Count == count);

    // Red nodes can't have red children.
    // Contracts.Assert(colorSelf == Color.Black || (LeftColor == Color.Black && RightColor == Color.Black));
    // All paths to the root must have the same black height.
    // Contracts.Assert(leftBlackHeight == rightBlackHeight);

    if (colorSelf == Color.Black) return leftBlackHeight + 1

    return leftBlackHeight
  }

  public static CreateByPairs<V>(items: KeyValuePair<string, V>[]) {
    // Contracts.AssertValue(items)

    let count = items.length
    switch (count) {
      case 0:
        return undefined
      case 1:
        return new LeafNode(items[0].key, items[0].value)
    }
    const rgikvp = []
    for (let i = 0; i < count; ++i) {
      rgikvp[i] = i
    }
    rgikvp.sort((ikvp1, ikvp2) => {
      if (ikvp1 === ikvp2) {
        return 0
      }
      const cmp = RedBlackNode.Compare(items[ikvp1].key, items[ikvp2].key)
      if (cmp != 0) {
        return cmp
      }
      return ikvp2 - ikvp1
    })

    Sorting.Sort(rgikvp, (ikvp1, ikvp2) => {
      if (ikvp1 == ikvp2) {
        return 0
      }
      const cmp = RedBlackNode.Compare(items[ikvp1].key, items[ikvp2].key)
      if (cmp != 0) {
        return cmp
      }
      return ikvp2 - ikvp1
    })

    count = Sorting.RemoveDupsFromSorted(rgikvp, 0, count, (ikvp1, ikvp2) => items[ikvp1].key === items[ikvp2].key)

    return RedBlackNode.CreateFromArraySorted(items, rgikvp, 0, count)
  }

  private static Create<V>(
    key: string,
    value: V,
    left: RedBlackNode<V> | undefined,
    right: RedBlackNode<V> | undefined,
    leftColor: Color | undefined,
    rightColor: Color | undefined,
  ): RedBlackNode<V> {
    // Contracts.AssertNonEmpty(key)
    // Contracts.AssertValueOrNull(left)
    // Contracts.AssertValueOrNull(right)

    if (left != null || right != null) return new InteriorNode(key, value, left, right, leftColor, rightColor)
    return new LeafNode(key, value)
  }

  public static Compare(str0: string, str1: string) {
    if (str0 === str1) {
      return 0
    }
    if (str0 < str1) {
      return -1
    }
    return 1
  }

  public static CreateFromArraySorted<V>(
    rgkvp: KeyValuePair<string, V>[],
    rgikvp: number[],
    iikvpMin: number,
    iikvpLim: number,
  ): RedBlackNode<V> | undefined {
    //  Contracts.AssertValue(rgkvp)
    //  Contracts.AssertValue(rgikvp)
    //  Contracts.Assert(0 <= iikvpMin && iikvpMin <= rgkvp.Length && iikvpLim <= rgkvp.Length && iikvpMin <= iikvpLim)
    //  Contracts.Assert(iikvpMin <= rgikvp.Length && iikvpLim <= rgikvp.Length)
    const nodeCount = iikvpLim - iikvpMin
    let half = 0
    let left: RedBlackNode<V> | undefined | null
    let right: RedBlackNode<V> | undefined | null
    let leftColor = Color.Black
    switch (nodeCount) {
      case 0:
        return undefined
      case 1:
        return new LeafNode(rgkvp[rgikvp[iikvpMin]].key, rgkvp[rgikvp[iikvpMin]].value)
      case 2:
        left = new LeafNode(rgkvp[rgikvp[iikvpMin]].key, rgkvp[rgikvp[iikvpMin]].value)
        return new InteriorNode(
          rgkvp[rgikvp[iikvpMin + 1]].key,
          rgkvp[rgikvp[iikvpMin + 1]].value,
          left,
          undefined,
          Color.Red,
          Color.Black,
        )
      default:
        if ((nodeCount & 1) === 1) {
          half = nodeCount / 2
        } else {
          half = (nodeCount + 1) / 2
          if (((nodeCount + 2) & (nodeCount + 1)) === 0) {
            leftColor = Color.Red
          }
          left = RedBlackNode.CreateFromArraySorted(rgkvp, rgikvp, iikvpMin, iikvpMin + half)
          right = RedBlackNode.CreateFromArraySorted(rgkvp, rgikvp, iikvpMin + half + 1, iikvpLim)
          return new InteriorNode(
            rgkvp[rgikvp[iikvpMin + half]].key,
            rgkvp[rgikvp[iikvpMin + half]].value,
            left,
            right,
            leftColor,
            Color.Black,
          )
        }
    }
  }

  // Standard key/value lookup method.
  public static TryGetValue<V>(root: RedBlackNode<V>, key: string): [boolean, V | undefined] {
    // Contracts.AssertValueOrNull(root)
    // Contracts.AssertValue(key)

    if (root != null) {
      const findNodeResult = RedBlackNode.TryFindNode(root, key)
      if (findNodeResult[0]) {
        return [true, findNodeResult[1].value]
      }
    }
    return [false, undefined]
  }

  public static GetPairsArray<V>(root: RedBlackNode<V>, arr: KeyValuePair<string, V>[] = []) {
    // Contracts.AssertValueOrNull(root);
    return RedBlackNode.PreTraver(root).map((node) => ({ key: node.key, value: node.value }))
  }

  private static PreTraver<V>(node: RedBlackNode<V>, arr: Array<RedBlackNode<V>> = []) {
    if (node == null) {
      return arr
    }
    if (node.left) {
      arr = RedBlackNode.PreTraver(node.left, arr)
    }
    arr.push(node)
    if (node.right) {
      arr = RedBlackNode.PreTraver(node.right, arr)
    }
    return arr
  }

  public static SetItem<V>(root: RedBlackNode<V>, name: string, value: V, skipCompare = false) {
    // Contracts.AssertValueOrNull(root)
    // Contracts.AssertValue(name)
    if (root == null) {
      return new LeafNode(name, value)
    }
    const result = RedBlackNode.AddItemCore(root, Color.Black, name, value, skipCompare)
    return result[1]
  }

  public static RemoveItem<V>(
    root: RedBlackNode<V>,
    name: string,
    hashCodeCache: Map<RedBlackNode<V>, number>,
  ): [RedBlackNode<V> | undefined, boolean] {
    // Contracts.AssertValueOrNull(root);
    // Contracts.AssertValue(name);

    const removeResult = RedBlackNode.RemoveItemCore(root, Color.Black, name, hashCodeCache)
    return [removeResult[1], removeResult[0] == RemoveCoreResult.ItemNotFound]
  }

  private static TryFindNode<V>(root: RedBlackNode<V>, key: string): [boolean, RedBlackNode<V> | undefined] {
    //  Contracts.AssertValueOrNull(root)
    //  Contracts.AssertValue(key)

    let node: RedBlackNode<V> | undefined = root
    while (node != null) {
      const cmp = RedBlackNode.Compare(key, node.key)
      if (cmp === 0) {
        return [true, node]
      }
      node = cmp < 0 ? node.left : node.right
    }
    return [false, node]
  }

  private static AddItemCore<V>(
    root: RedBlackNode<V>,
    rootColor: Color | undefined,
    key: string,
    value: V,
    skipCompare = false,
  ): [AddCoreResult, RedBlackNode<V>] {
    // Contracts.AssertValue(root)
    // Contracts.AssertValue(key)

    const cmp = this.Compare(key, root.key)
    if (cmp === 0) {
      //  TODO: value 采用equals实现比较
      if (!skipCompare && value === root.value) {
        return [AddCoreResult.ItemPresent, root] // Don't build a new tree.
      }
      root = root.cloneStructure(value)
      return [AddCoreResult.ItemUpdated, root] // Build a new tree, don't change the count.
    }
    let left: RedBlackNode<V> | undefined
    let right: RedBlackNode<V> | undefined
    let result: AddCoreResult
    if (cmp < 0) {
      // Add to the left side of the tree.
      right = root.right

      if (root.left == null) {
        root = new InteriorNode(root.key, root.value, new LeafNode(key, value), right, Color.Red, right?.rightColor)
        return rootColor === Color.Red ? [AddCoreResult.DoubleRedLeftChild, root] : [AddCoreResult.ItemAdded, root]
      }
      // // DIAGRAM LEGEND:
      // // [] - black node
      // // numbers - color doesn't matter, may be null in some cases
      let newLeft: RedBlackNode<V> | undefined
      let newRight: RedBlackNode<V> | undefined
      left = root.left
      const addReturn = RedBlackNode.AddItemCore(left, root.leftColor, key, value, skipCompare)
      result = addReturn[0]
      left = addReturn[1]
      switch (result) {
        case AddCoreResult.ItemUpdated:
        case AddCoreResult.ItemAdded:
          root = new InteriorNode(root.key, root.value, left, right, root.leftColor)
          return [result, root]
        case AddCoreResult.NewNodeIsRed:
          root = new InteriorNode(root.key, root.value, left, right, Color.Red, root.rightColor)
          // Check for double red violation and warn the caller.
          return rootColor == Color.Red ? [AddCoreResult.DoubleRedLeftChild, root] : [AddCoreResult.ItemAdded, root]
        case AddCoreResult.DoubleRedLeftChild:
          //     [Z]
          //     / \
          //    Y   4           Y
          //   /\              /  \
          //  X  3     =>   [X]   [Z]
          //  /\            /  \  /  \
          // 1 2           1   2 3   4

          // Contracts.Assert(rootColor == Color.Black)

          newLeft = left.left
          newRight = RedBlackNode.Create(root.key, root.value, left.right, root.right, left.rightColor, root.rightColor)
          root = new InteriorNode(left.key, left.value, newLeft, newRight, Color.Black, Color.Black)
          return [AddCoreResult.NewNodeIsRed, root]
        case AddCoreResult.DoubleRedRightChild:
          //    [Z]
          //    / \
          //   X   4           Y
          //  /\              /  \
          // 1  Y     =>   [X]   [Z]
          //    /\         /  \  /  \
          //   2 3        1   2 3   4

          // Contracts.Assert(rootColor == Color.Black)

          const leftRight = left.right as RedBlackNode<V>
          newLeft = RedBlackNode.Create(
            left.key,
            left.value,
            left.left,
            leftRight?.left,
            left.leftColor,
            leftRight.leftColor,
          )
          newRight = RedBlackNode.Create(
            root.key,
            root.value,
            leftRight?.right,
            right,
            leftRight.rightColor,
            root.rightColor,
          )
          root = new InteriorNode(leftRight.key, leftRight.value, newLeft, newRight, Color.Black, Color.Black)
          return [AddCoreResult.NewNodeIsRed, root]
        default:
          // Contracts.Assert(result == AddCoreResult.ItemPresent);
          return [AddCoreResult.ItemPresent, root]
      }
    } else {
      // Add to the right side of the tree.
      left = root.left
      if (root.right == null) {
        // Make a new right child, set its color to red.
        root = new InteriorNode(root.key, root.value, left, new LeafNode(key, value), root.leftColor, Color.Red)
        // Check for double red violation and warn the caller.
        return rootColor == Color.Red ? [AddCoreResult.DoubleRedRightChild, root] : [AddCoreResult.ItemAdded, root]
      }
      let newLeft: RedBlackNode<V> | undefined
      let newRight: RedBlackNode<V> | undefined
      right = root.right
      const addResult = RedBlackNode.AddItemCore(right, root.rightColor, key, value, skipCompare)
      result = addResult[0]
      right = addResult[1]
      switch (result) {
        case AddCoreResult.ItemUpdated:
        case AddCoreResult.ItemAdded:
          root = new InteriorNode(root.key, root.value, left, right, root.leftColor, root.rightColor)
          return [result, root]
        case AddCoreResult.NewNodeIsRed:
          root = new InteriorNode(root.key, root.value, left, right, root.leftColor, root.rightColor)
          // Check for double red violation and warn the caller.
          return rootColor == Color.Red ? [AddCoreResult.DoubleRedRightChild, root] : [AddCoreResult.ItemAdded, root]
        case AddCoreResult.DoubleRedRightChild:
          //    [X]
          //    / \
          //   1   Y              Y
          //      / \           /   \
          //     2  Z    =>   [X]   [Z]
          //        /\        / \   / \
          //       3 4       1   2 3   4

          // Contracts.Assert(rootColor == Color.Black)

          newLeft = RedBlackNode.Create(root.key, root.value, root.left, right.left, root.leftColor, right.leftColor)
          newRight = right.right
          root = new InteriorNode(right.key, right.value, newLeft, newRight, Color.Black, Color.Black)
          return [AddCoreResult.NewNodeIsRed, root]
        case AddCoreResult.DoubleRedLeftChild:
          //    [X]
          //    / \
          //   1   Z              Y
          //      / \           /   \
          //     Y  4    =>   [X]   [Z]
          //     /\           / \   / \
          //     2 3         1   2 3   4

          // Contracts.Assert(rootColor == Color.Black)

          const rightleft = right.left as RedBlackNode<V>
          newLeft = RedBlackNode.Create(
            root.key,
            root.value,
            root.left,
            rightleft.left,
            root.leftColor,
            rightleft.leftColor,
          )
          newRight = RedBlackNode.Create(
            right.key,
            right.value,
            rightleft.right,
            right.right,
            rightleft.rightColor,
            right.rightColor,
          )
          root = new InteriorNode(rightleft.key, rightleft.value, newLeft, newRight, Color.Black, Color.Black)
          return [AddCoreResult.NewNodeIsRed, root]
        default:
          // Contracts.Assert(result == AddCoreResult.ItemPresent);
          return [AddCoreResult.ItemPresent, root]
      }
    }
  }

  private static RemoveItemCore<V>(
    root: RedBlackNode<V> | undefined,
    rootColor: Color | undefined,
    key: string,
    hashCodeCache: Map<RedBlackNode<V>, number>,
  ): [RemoveCoreResult, RedBlackNode<V> | undefined] {
    // Contracts.AssertValueOrNull(root)
    // Contracts.AssertValue(key)

    if (root == null) {
      return [RemoveCoreResult.ItemNotFound, root]
    }
    const cmp = RedBlackNode.Compare(key, root.key)
    if (cmp === 0) {
      if (root.left == null) {
        const rightColor = root.rightColor
        root = root.right
        // If the removed node or its only child is red, just color it black
        // and we are done, no black height violations.
        if (rootColor == Color.Red || rightColor == Color.Red) {
          return [RemoveCoreResult.NewNodeIsBlack, root]
        }
        // Mark the new node as a fake 'double black' to maintain the black height,
        // callers will do fixup.
        return [RemoveCoreResult.NewNodeIsDoubleBlack, root]
      }
      if (root.right == null) {
        const leftColor = root.leftColor
        root = root.left
        // If the removed node or its only child is red, just color it black
        // and we are done, no black height violations.
        if (rootColor === Color.Red || leftColor === Color.Red) {
          return [RemoveCoreResult.NewNodeIsBlack, root]
        }
        // Mark the new node as a fake 'double black' to maintain the black height,
        // callers will do fixup.
        return [RemoveCoreResult.NewNodeIsDoubleBlack, root]
      }
    }

    if (cmp < 0) {
      // Check the left side of the tree.
      let left = root.left
      const removeResult = RedBlackNode.RemoveItemCore(left, root.leftColor, key, hashCodeCache)
      const result = removeResult[0]
      left = removeResult[1] as RedBlackNode<V>
      switch (result) {
        case RemoveCoreResult.ItemRemoved:
          root = RedBlackNode.Create(root.key, root.value, left, root.right, root.leftColor, root.rightColor)
          return [RemoveCoreResult.ItemRemoved, root]
        case RemoveCoreResult.NewNodeIsBlack:
          root = RedBlackNode.Create(root.key, root.value, left, root.right, Color.Black, root.rightColor)
          return [RemoveCoreResult.ItemRemoved, root]
        case RemoveCoreResult.NewNodeIsDoubleBlack:
          return RedBlackNode.RemoveFixupLeft(root, rootColor as Color, left)
        default:
          // Contracts.Assert(result == RemoveCoreResult.ItemNotFound)
          return [RemoveCoreResult.ItemNotFound, root]
      }
    } else {
      // Check the right side of the tree.
      let right = root.right
      const removeResult = RedBlackNode.RemoveItemCore(right, root.rightColor, key, hashCodeCache)
      const result = removeResult[0]
      right = removeResult[1] as RedBlackNode<V>
      switch (result) {
        case RemoveCoreResult.ItemRemoved:
          root = RedBlackNode.Create(root.key, root.value, root.left, right, root.leftColor, root.rightColor)
          return [RemoveCoreResult.ItemRemoved, root]
        case RemoveCoreResult.NewNodeIsBlack:
          root = RedBlackNode.Create(root.key, root.value, root.left, right, root.leftColor, Color.Black)
          return [RemoveCoreResult.ItemRemoved, root]
        case RemoveCoreResult.NewNodeIsDoubleBlack:
          return RedBlackNode.RemoveFixupRight(root, root, rootColor as Color, right)
        default:
          // Contracts.Assert(result == RemoveCoreResult.ItemNotFound);
          return [RemoveCoreResult.ItemNotFound, root]
      }
    }
  }

  private static RemoveLeftMost<V>(
    root: RedBlackNode<V>,
    rootColor: Color,
    hashCodeCache: Map<RedBlackNode<V>, number>,
  ): [RemoveCoreResult, RedBlackNode<V>, RedBlackNode<V>] {
    // Contracts.AssertValue(root);
    let removedNode: RedBlackNode<V>
    if (root.left == null) {
      // We've reached the left most node, remove it and clear its hash code from the cache
      const rightColor = root.rightColor
      removedNode = root
      root = root.right as RedBlackNode<V>

      hashCodeCache.delete(removedNode)

      // If the removed node or its only child is red, just color it black
      // and we are done, no black height violations.
      if (rootColor == Color.Red || rightColor == Color.Red) {
        return [RemoveCoreResult.NewNodeIsBlack, root, removedNode]
      }
      // Mark the new node as a fake 'double black' to maintain the black height,
      // callers will do fixup.
      return [RemoveCoreResult.NewNodeIsDoubleBlack, root, removedNode]
    }

    let left = root.left
    const removeLeftMostResult = RedBlackNode.RemoveLeftMost(left, root.leftColor as Color, hashCodeCache)
    const result = removeLeftMostResult[0]
    left = removeLeftMostResult[1]
    removedNode = removeLeftMostResult[2]
    // Contracts.Assert(result != RemoveCoreResult.ItemNotFound);

    switch (result) {
      case RemoveCoreResult.ItemRemoved:
        root = RedBlackNode.Create(root.key, root.value, left, root.right, root.leftColor, root.rightColor)
        return [RemoveCoreResult.ItemRemoved, root, removedNode]
      case RemoveCoreResult.NewNodeIsBlack:
        root = RedBlackNode.Create(root.key, root.value, left, root.right, Color.Black, root.rightColor)
        return [RemoveCoreResult.ItemRemoved, root, removedNode]
      default:
        // Contracts.Assert(result == RemoveCoreResult.NewNodeIsDoubleBlack);
        return [...RedBlackNode.RemoveFixupLeft(root, rootColor, left), removedNode]
    }
  }

  // Performs red-black tree fixup for the root whose new left child (left)
  // is a 'double black' node.
  private static RemoveFixupLeft<V>(
    root: RedBlackNode<V>,
    rootColor: Color,
    left: RedBlackNode<V>,
  ): [RemoveCoreResult, RedBlackNode<V>] {
    // Contracts.AssertValue(root);
    // Contracts.AssertValue(root.Right);
    // Contracts.AssertValueOrNull(left);
    const rootRight = root.right as RedBlackNode<V>

    // There are 4 main cases, order matters to avoid introducing red-red violations.
    // DIAGRAM LEGEND:
    // [] - black node
    // [[]] - double black node
    // {} - red or black node
    // numbers - color doesn't matter, may be null in some cases

    // CASE 1: The 'double black' node's furthest nephew is red.
    // Perform a left rotation and recolor. Tree is valid after this step.

    if (rootRight?.rightColor == Color.Red) {
      //        {B}                              {D}
      //     /       \                        /       \
      // [[A]]        [D]                 [B]         [E]
      //  / \         / \      =>        /   \        / \
      // 1   2     {C}   E            [A]     {C}    5   6
      //           / \  / \           / \     / \
      //          3   4 5 6          1   2   3   4
      // Contracts.Assert(root.RightColor == Color.Black);
      const newLeft = RedBlackNode.Create(root.key, root.value, left, rootRight.left, Color.Black, rootRight.leftColor)
      const newRight = rootRight.right
      root = new InteriorNode(rootRight.key, rootRight.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.ItemRemoved, root]
    }

    // // CASE 2: The 'double black' node's nearest nephew is red.
    // // Performing a right rotation and recolor on the root's right child transforms this to case 1.
    // // Then performing a left rotation and recolor on the root makes a valid tree.
    // // Both rotations and recolorings are performed in one step to save on node creation.
    if (rootRight?.leftColor === Color.Red) {
      //        {B}                    {B}                        {C}
      //     /       \               /     \                    /    \
      // [[A]]        [D]        [[A]]      [C]              [B]      [D]
      //  / \         / \    =>   /  \      /  \             / \      / \
      // 1   2      C   [E]      1   2    3     D     =>  [A]   3    4   [E]
      //           / \  / \                    / \        / \            / \
      //          3   4 5 6                   4  [E]     1   2          5   6
      //                                         / \
      //                                        5   6
      // Contracts.Assert(root.RightColor == Color.Black);
      // Contracts.Assert(rootRight.RightColor == Color.Black);
      const rootRightLeft = rootRight.left as RedBlackNode<V>
      // Contracts.AssertValue(rootRightLeft);
      const newLeft = RedBlackNode.Create(
        root.key,
        root.value,
        left,
        rootRightLeft?.left,
        Color.Black,
        rootRightLeft?.leftColor,
      )
      const newRight = RedBlackNode.Create(
        rootRight.key,
        rootRight.value,
        rootRightLeft?.right,
        rootRight.right,
        rootRightLeft?.rightColor,
        Color.Black,
      )
      root = new InteriorNode(rootRightLeft.key, rootRightLeft.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.ItemRemoved, root]
    }

    // // CASE 3: The 'double black' node's sibling is red.
    // // Performing a left rotation and recolor on the root transforms this into EITHER case 1, 2 OR 4,
    // // depending on the values of root.Right.Left.LeftColor and root.Right.Left.RightColor
    // // All rotations and recolorings are performed in one step to save on node creation.
    // // In all cases, the tree is valid after this step.

    if (root.rightColor === Color.Red) {
      //     Contracts.Assert(rootColor == Color.Black);
      //     Contracts.Assert(rootRight.LeftColor == Color.Black);
      //     Contracts.Assert(rootRight.RightColor == Color.Black);
      let newLeft: RedBlackNode<V> | undefined
      let newRight: RedBlackNode<V> | undefined
      const rootRightLeft = rootRight.left as RedBlackNode<V>
      // Contracts.AssertValue(rootRightLeft)
      // Case 3 -> Case 1
      if (rootRightLeft.rightColor == Color.Red) {
        //        [B]                           [D]                            [D]
        //     /       \                     /       \                       /     \
        // [[A]]          D                B          [E]                  C        [E]
        //  / \         /   \    =>     /     \       / \   =>          /     \     /  \
        // 1   2     [C]    [E]      [[A]]   [C]     6   7           [B]     [CZ]  6   7
        //           / \    / \       /\     /  \                   /  \     / \
        //          3   CZ  6 7      1  2   3   CZ                [A]   3  4    5
        //              / \                    /  \              /  \
        //             4   5                  4    5            1    2
        const newLeftLeft = RedBlackNode.Create(
          root.key,
          root.value,
          left,
          rootRightLeft.left,
          Color.Black,
          rootRightLeft.leftColor,
        )
        const newLeftRight = rootRightLeft.right
        newLeft = new InteriorNode(
          rootRightLeft.key,
          rootRightLeft.value,
          newLeftLeft,
          newLeftRight,
          Color.Black,
          Color.Black,
        )
        newRight = rootRight.right as RedBlackNode<V>
        root = new InteriorNode(rootRight.key, rootRight.value, newLeft, newRight, Color.Red, Color.Black)
        return [RemoveCoreResult.ItemRemoved, root]
      }

      // Case 3 -> Case 2 -> Case 1
      if (rootRightLeft.leftColor == Color.Red) {
        //        [B]                           [D]        <See Case 2                    [D]
        //     /       \                     /       \      for 2 stage rotation       /        \
        // [[A]]          D                B          [E]   using B as root>         CA          [E]
        //  / \         /   \    =>     /     \       / \        =>                /    \       /  \
        // 1   2     [C]    [E]      [[A]]   [C]     7   8                      [B]       [C]  7    8
        //           / \    / \       /\     /  \                              /  \     /    \
        //          CA [CZ] 7  8     1  2   CA [CZ]                          [A]   3    4   [CZ]
        //         / \  / \                 /\  /\                          /  \            /  \
        //        3  4 5   6               3  4 5 6                        1    2          5    6
        const rootRightLeftLeft = rootRightLeft.left as RedBlackNode<V>
        // Contracts.AssertValue(rootRightLeftLeft);
        const newLeftLeft = RedBlackNode.Create(
          root.key,
          root.value,
          left,
          rootRightLeftLeft.left,
          Color.Black,
          rootRightLeftLeft.leftColor,
        )
        const newLeftRight = RedBlackNode.Create(
          rootRightLeft.key,
          rootRightLeft.value,
          rootRightLeftLeft.right,
          rootRightLeft.right,
          rootRightLeftLeft.rightColor,
          Color.Black,
        )
        newLeft = new InteriorNode(
          rootRightLeftLeft.key,
          rootRightLeftLeft.value,
          newLeftLeft,
          newLeftRight,
          Color.Black,
          Color.Black,
        )
        newRight = rootRight.right
        root = new InteriorNode(rootRight.key, rootRight.value, newLeft, newRight, Color.Red, Color.Black)
        return [RemoveCoreResult.ItemRemoved, root]
      }
      // Case 3 -> Case 4
      //        [B]                           [D]                        [D]
      //     /       \                     /       \                  /       \
      // [[A]]          D                B          [E]            [B]         [E]
      //  / \         /   \    =>     /     \       / \   =>     /     \       / \
      // 1   2     [C]    [E]      [[A]]   [C]     3   4       [A]     C      3   4
      //           / \    / \       /\     /  \                /\     /  \
      //         [CA][CZ] 3 4      1  2   [CA][CZ]            1  2   [CA][CZ]
      newLeft = RedBlackNode.Create(root.key, root.value, left, rootRightLeft, Color.Black, Color.Red)
      newRight = rootRight.right
      root = new InteriorNode(rootRight.key, rootRight.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.NewNodeIsBlack, root]
    }

    // CASE 4: The 'double black' node's parent is red.
    // Move the parent's red to the sibling and color the parent black and the tree becomes valid.
    if (rootColor == Color.Red) {
      // Contracts.Assert(root.RightColor == Color.Black);
      root = new InteriorNode(root.key, root.value, left, rootRight, Color.Black, Color.Red)
      return [RemoveCoreResult.NewNodeIsBlack, root]
    }

    // CASE 5: All of the 'double black' node's relations are black (parent, sibling, both nephews)
    // Color the sibling red and make the root the new 'double black' node.
    // Contracts.Assert(rootColor == Color.Black);
    // Contracts.Assert(root.RightColor == Color.Black);
    // Contracts.Assert(rootRight.LeftColor == Color.Black);
    // Contracts.Assert(rootRight.RightColor == Color.Black);
    root = new InteriorNode(root.key, root.value, left, rootRight, Color.Black, Color.Red)
    return [RemoveCoreResult.NewNodeIsDoubleBlack, root]
  }

  // Performs red-black tree fixup for the root whose new right child (right)
  // is a 'double black' node.
  // Takes two 'root' parameters (root, rootData) instead of one like RemoveFixupLeft
  // because the data for the new root might be coming from the result of a RemoveLeftMost
  private static RemoveFixupRight<V>(
    root: RedBlackNode<V>,
    rootData: RedBlackNode<V>,
    rootColor: Color,
    right: RedBlackNode<V>,
  ): [RemoveCoreResult, RedBlackNode<V> | undefined] {
    // Contracts.AssertValue(root)
    // Contracts.AssertValue(root.Left)
    // Contracts.AssertValue(rootData)
    // Contracts.AssertValueOrNull(right)

    const rootLeft = root.left as RedBlackNode<V>

    // There are 4 main cases, order matters to avoid introducing red-red violations.
    // See RemoveFixupLeft for diagrams, just reverse left and right.

    // CASE 1: The 'double black' node's furthest nephew is red.
    // Perform a right rotation and recolor. Tree is valid after this step.
    if (rootLeft.leftColor == Color.Red) {
      // Contracts.Assert(root.LeftColor == Color.Black);
      const newLeft = rootLeft.left
      const newRight = RedBlackNode.Create(
        rootData.key,
        rootData.value,
        rootLeft.right,
        right,
        rootLeft.rightColor,
        Color.Black,
      )
      root = new InteriorNode(rootLeft.key, rootLeft.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.ItemRemoved, root]
    }

    // CASE 2: The 'double black' node's nearest nephew is red.
    // Performing a left rotation and recolor on the root's left child transforms this to case 1.
    // Then performing a right rotation and recolor on the root makes a valid tree.
    // Both rotations and recolorings are performed in one step to save on node creation.
    if (rootLeft.rightColor === Color.Red) {
      // Contracts.Assert(root.LeftColor == Color.Black);
      // Contracts.Assert(rootLeft.LeftColor == Color.Black);
      const rootLeftRight = rootLeft.right as RedBlackNode<V>
      const newLeft = RedBlackNode.Create(
        rootLeft.key,
        rootLeft.value,
        rootLeft.left,
        rootLeftRight?.left,
        Color.Black,
        rootLeftRight?.leftColor,
      )
      const newRight = RedBlackNode.Create(
        rootData.key,
        rootData.value,
        rootLeftRight?.right,
        right,
        rootLeftRight?.rightColor,
        Color.Black,
      )
      root = new InteriorNode(rootLeftRight.key, rootLeftRight.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.ItemRemoved, root]
    }

    // CASE 3: The 'double black' node's sibling is red.
    // Performing a right rotation and recolor on the root transforms this into EITHER case 1, 2 OR 4,
    // depending on the values of root.Left.Right.LeftColor and root.Left.Right.RightColor
    // All rotations and recolorings are performed in one step to save on node creation.
    // In all cases, the tree is valid after this step.
    if (root.leftColor === Color.Red) {
      // Contracts.Assert(rootColor == Color.Black);
      // Contracts.Assert(rootLeft.LeftColor == Color.Black);
      // Contracts.Assert(rootLeft.RightColor == Color.Black);

      let newLeft: RedBlackNode<V> | undefined
      let newRight: RedBlackNode<V> | undefined
      const rootLeftRight = rootLeft.right as RedBlackNode<V>
      // Contracts.AssertValue(rootLeftRight);
      // Case 3 -> Case 1
      if (rootLeftRight.leftColor == Color.Red) {
        const newRightLeft = rootLeftRight.left
        const newRightRight = RedBlackNode.Create(
          rootData.key,
          rootData.value,
          rootLeftRight.right,
          right,
          rootLeftRight.rightColor,
          Color.Black,
        )
        newLeft = rootLeft.left
        newRight = new InteriorNode(
          rootLeftRight.key,
          rootLeftRight.value,
          newRightLeft,
          newRightRight,
          Color.Black,
          Color.Black,
        )
        root = new InteriorNode(rootLeft.key, rootLeft.value, newLeft, newRight, Color.Black, Color.Red)
        return [RemoveCoreResult.ItemRemoved, root]
      }

      // Case 3 -> Case 2 -> Case 1
      if (rootLeftRight.rightColor == Color.Red) {
        const rootLeftRightRight = rootLeftRight.right as RedBlackNode<V>
        // Contracts.AssertValue(rootLeftRightRight);
        const newRightLeft = RedBlackNode.Create(
          rootLeftRight.key,
          rootLeftRight.value,
          rootLeftRight.left,
          rootLeftRightRight.left,
          Color.Black,
          rootLeftRightRight.leftColor,
        )
        const newRightRight = RedBlackNode.Create(
          rootData.key,
          rootData.value,
          rootLeftRightRight.right,
          right,
          rootLeftRightRight?.rightColor,
          Color.Black,
        )
        newLeft = rootLeft.left
        newRight = new InteriorNode(
          rootLeftRightRight.key,
          rootLeftRightRight.value,
          newRightLeft,
          newRightRight,
          Color.Black,
          Color.Black,
        )
        root = new InteriorNode(rootLeft.key, rootLeft.value, newLeft, newRight, Color.Black, Color.Red)
        return [RemoveCoreResult.ItemRemoved, root]
      }

      // Case 3 -> Case 4
      newLeft = rootLeft.left
      newRight = new InteriorNode(rootData.key, rootData.value, rootLeftRight, right, Color.Red, Color.Black)
      root = new InteriorNode(rootLeft.key, rootLeft.value, newLeft, newRight, Color.Black, Color.Black)
      return [RemoveCoreResult.NewNodeIsBlack, root]
    }

    // CASE 4: The 'double black' node's parent is red.
    // Move the parent's red to the sibling and color the parent black and the tree becomes valid.
    if (rootColor == Color.Red) {
      // Contracts.Assert(root.LeftColor == Color.Black)
      root = new InteriorNode(rootData.key, rootData.value, rootLeft, right, Color.Red, Color.Black)
      return [RemoveCoreResult.NewNodeIsBlack, root]
    }

    // CASE 5: All of the 'double black' node's relations are black (parent, sibling, both nephews)
    // Color the sibling red and make the root the new 'double black' node.
    // Contracts.Assert(rootColor == Color.Black)
    // Contracts.Assert(root.LeftColor == Color.Black)
    // Contracts.Assert(rootLeft.LeftColor == Color.Black)
    // Contracts.Assert(rootLeft.RightColor == Color.Black)
    root = new InteriorNode(rootData.key, rootData.value, rootLeft, right, Color.Red, Color.Black)
    return [RemoveCoreResult.NewNodeIsDoubleBlack, root]
  }

  // Note that we DON'T implement == and !=, so those operators indicate
  // reference equality.
  public static Equals<V>(root1: RedBlackNode<V>, root2: RedBlackNode<V>) {
    // Contracts.AssertValueOrNull(root1);
    // Contracts.AssertValueOrNull(root2);

    if (root1 == root2) return true

    if (root1 == null || root2 == null) return false

    if (root1.count != root2.count) return false

    const ator1 = RedBlackNode.GetPairsArray(root1)
    const ator2 = RedBlackNode.GetPairsArray(root2)

    for (let i = 0; i < ator1.length; i++) {
      if (ator1[i].key !== ator2[i].key) {
        return false
      }
      // TODO: V需要支持equals方法
      if (ator1[i].value !== ator2[i].value) {
        return false
      }
      return true
    }

    return true
  }

  public equals(other: any): boolean {
    // Contracts.AssertValueOrNull(other)
    if (other instanceof RedBlackNode) {
      return RedBlackNode.Equals(this, other)
    }
    return this === other
  }

  // TODO: 确认是否可用
  public getHashCode() {
    let hash = Hashing.CombineHash(0x34028abc, Hashing.HashInt(this.count))
    for (const kvp of RedBlackNode.GetPairsArray(this)) {
      hash = Hashing.CombineHash(hash, Hashing.HashString(kvp.key))
      hash = Hashing.CombineHash(hash, Hashing.Hash(kvp.value))
    }
    return hash
  }

  constructor(key: string, value: V) {
    this.key = key
    this.value = value
  }
}

export class LeafNode<V> extends RedBlackNode<V> {
  public count: number = 1
  protected left: RedBlackNode<V> = undefined
  protected right: RedBlackNode<V> = undefined
  protected leftColor = Color.Black
  protected rightColor = Color.Red
  constructor(key: string, value: V) {
    super(key, value)
  }
  protected cloneStructure(value: V) {
    return new LeafNode(this.key, value)
  }
}

export class InteriorNode<V> extends RedBlackNode<V> {
  public count: number
  protected readonly left?: RedBlackNode<V>
  protected readonly right?: RedBlackNode<V>
  protected readonly leftColor?: Color
  protected readonly rightColor?: Color

  constructor(
    key: string,
    value: V,
    left: RedBlackNode<V> | undefined | null,
    right: RedBlackNode<V> | undefined | null,
    leftColor?: Color,
    rightColor?: Color,
  ) {
    super(key, value)
    this.count = 1
    if (left != null) {
      this.left = left
      this.count += 1
    }
    if (right != null) {
      this.right = right
      this.count += 1
    }
    this.leftColor = leftColor
    this.rightColor = rightColor
  }

  protected cloneStructure(value: V): RedBlackNode<V> {
    return new InteriorNode(this.key, value, this.left, this.right, this.leftColor, this.rightColor)
  }
}
