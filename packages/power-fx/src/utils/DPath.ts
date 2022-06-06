import TexlLexer from '../lexer/TexlLexer'
import { DName } from './DName'
import { Hashing } from './Hash'
import { StringBuilder } from './StringBuilder'
import { ICheckable } from './types'

class Node implements ICheckable {
  public static readonly HashNull = 0x340ca819

  public readonly parent: Node
  public readonly name: DName
  public readonly length: number

  // Computed lazily and cached. This only hashes the strings, NOT the length.
  private _hash: number

  public get isValid() {
    return this.name.isValid && (this.parent == null ? this.length == 1 : this.length == this.parent.length + 1)
  }

  constructor(par: Node, name: DName) {
    // Contracts.AssertValueOrNull(par);
    // Contracts.Assert(name.IsValid);

    this.parent = par
    this.name = name
    this.length = par == null ? 1 : 1 + par.length
  }

  // Simple recursion avoids memory allocation at the expense of stack space.
  // Only use this for "small" chains.
  public append(node: Node): Node {
    // AssertValid();
    // Contracts.AssertValueOrNull(node);
    if (node == null) {
      return this
    }
    return new Node(this.append(node.parent), node.name)
  }

  // [Conditional("DEBUG")]
  assertValid() {
    // Contracts.AssertValueOrNull(Parent);
    // Contracts.Assert(IsValid);
  }

  public getHashCode() {
    if (this._hash == 0) {
      this.ensureHash()
    }
    return this._hash
  }

  private ensureHash() {
    let hash = Hashing.CombineHash(
      this.parent == null ? Node.HashNull : this.parent.getHashCode(),
      this.name.getHashCode(),
    )
    // const hash = hashCode(this.parent == null ? Node.HashNull : this.parent.getHashCode())
    if (hash == 0) {
      hash = 1
    }
    this._hash = this._hash === 0 ? hash : this._hash
  }
}

export class DPath implements ICheckable {
  public readonly rootChar: string = '\u2202'
  public readonly rootString: string = '\u2202'

  private readonly _node?: Node
  public static readonly Root = new DPath()

  constructor(node?: Node)
  constructor(parent: DPath, name: DName)
  constructor(node?: Node | DPath, name?: DName) {
    if (node instanceof Node) {
      this._node = node
    } else if (node instanceof DPath && name != null) {
      const path = node
      this._node = new Node(path._node, name)
    }
  }

  get parent(): DPath {
    return this._node == null ? this : new DPath(this._node.parent)
  }
  get name() {
    return this._node == null ? new DName() : this._node.name
  }
  get length() {
    return this._node == null ? 0 : this._node.length
  }
  get isRoot() {
    return this._node == null
  }
  get isValid() {
    return this._node == null || this._node.isValid
  }

  public at(index: number) {
    let node = this._node
    while (node && node.length > index + 1) {
      node = node.parent
    }
    return node?.name.value
  }

  public append(nameOrPath: DName | DPath) {
    if (nameOrPath instanceof DName) {
      return new DPath(this, nameOrPath)
    }
    if (nameOrPath instanceof DPath) {
      if (this.isRoot) {
        return nameOrPath
      }
      // Simple recursion avoids excess memory allocation at the expense of stack space
      if (nameOrPath.length <= 20) {
        return new DPath(this._node?.append(nameOrPath._node))
      }

      const nodes: Node[] = []
      let inode = 0
      let node: Node | undefined
      for (node = nameOrPath._node; node != null; node = node.parent) {
        nodes[inode++] = node
      }
      node = this._node
      while (inode > 0) {
        const nodeCur = nodes[--inode]
        node = new Node(node, nodeCur.name)
      }
      return new DPath(node)
    }
  }

  public goUp(count: number): DPath {
    // Contracts.AssertIndexInclusive(count, Length);
    return new DPath(this.goUpCore(count))
  }

  private goUpCore(count: number) {
    // Contracts.AssertIndexInclusive(count, Length);
    let node = this._node
    while (--count >= 0) {
      // Contracts.AssertValue(node);
      node = node.parent
    }

    return node
  }

  public toString(): string {
    if (this.isRoot) {
      return this.rootString
    }

    let cch = 1
    for (let node = this._node; node != null; node = node.parent) {
      cch += node.name.value.length + 1
    }

    let sb: string[] = []
    for (let node = this._node; node != null; node = node.parent) {
      let str = node.name.toString()
      let ich = str.length
      // Contracts.Assert(ich < cch);
      while (ich > 0) {
        sb[--cch] = str.substr(--ich, 1)
      }

      sb[--cch] = '.'
    }

    // Contracts.Assert(cch == 1);
    sb[--cch] = this.rootChar
    return sb.join()
  }

  // Convert this DPath to a string in dotted syntax, such as "screen1.group6.label3"
  public toDottedSyntax(punctuator = '.', escapeInnerName = false): string {
    // Contracts.AssertNonEmpty(punctuator);
    // Contracts.Assert(punctuator.Length == 1);
    // Contracts.Assert(".!".IndexOf(punctuator[0]) >= 0);

    if (this.isRoot) {
      return ''
    }

    // Contracts.Assert(Length > 0);
    let count = 0
    for (let node = this._node; node != null; node = node.parent) {
      count += node.name.value.length
    }

    const sb = new StringBuilder()

    let sep = ''
    for (let i = 0; i < this.length; i++) {
      sb.append(sep)
      const escapedName = escapeInnerName ? TexlLexer.EscapeName(this.at(i)) : this.at(i)
      sb.append(escapedName.toString())
      sep = punctuator
    }

    return sb.toString()
  }

  // Convert a path specified as a string to a DPath.
  // Does not support individual path segments that contain '.' and '!' characters.
  public static TryParse(dotted: string): [boolean, DPath] {
    // Contracts.AssertValue(dotted);

    let path = DPath.Root

    if (dotted == '') {
      return [true, path]
    }

    for (const name of dotted.split(`(.|!)`)) {
      if (!DName.IsValidDName(name)) {
        path = DPath.Root
        return [false, path]
      }

      path = path.append(new DName(name))
    }

    return [true, path]
  }

  // public static bool operator !=(DPath path1, DPath path2) => !(path1 == path2);

  public getHashCode(): number {
    if (this._node == null) {
      return Node.HashNull
    }

    return this._node.getHashCode()
  }

  public equals(other: any) {
    // Contracts.AssertValueOrNull(other);
    if (!(other instanceof DPath)) {
      return false
    }
    let node1 = this as DPath
    let node2 = other

    for (;;) {
      if (node1 == node2) {
        return true
      }

      // Contracts.Assert(node1 != null || node2 != null);
      if (node1 == null || node2 == null) {
        return false
      }

      if (node1.getHashCode() != node2.getHashCode()) {
        return false
      }

      if (node1.name != node2.name) {
        return false
      }

      node1 = node1.parent
      node2 = node2.parent
    }
  }
}
