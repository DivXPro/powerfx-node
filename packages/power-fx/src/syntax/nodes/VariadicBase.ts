import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { TexlVisitor } from '../visitors'
import { TexlNode } from './TexlNode'

export abstract class VariadicBase extends TexlNode {
  readonly children: TexlNode[]
  constructor(idNext: number, primaryToken: Token, sourceList: SourceList, children: TexlNode[]) {
    super(idNext, primaryToken, sourceList)
    this.children = children
    let maxDepth = 0

    children.forEach((child) => {
      child.parent = this
      if (maxDepth < child.Depth) {
        maxDepth = child.Depth
      }
      if (this.minChildID > child.MinChildID) {
        this.minChildID = child.MinChildID
      }
      this.depth = maxDepth + 1
    })
  }

  cloneChildren(idNext: number, ts: Span) {
    const clones: TexlNode[] = []
    this.children.forEach((child) => {
      clones.push(child.clone(idNext++, ts))
    })
    return clones
  }

  public get count() {
    return this.children.length
  }

  public static Clone(toks: Token[] | undefined, ts: Span) {
    // Contracts.AssertValueOrNull(toks)
    if (toks == null) {
      return undefined
    }
    const newToks: Token[] = []
    toks.forEach((tok) => {
      newToks.push(tok.clone(ts))
    })
    return newToks
  }

  public acceptChildren(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    this.children.forEach((child) => {
      // Contracts.AssertValue(child)
      child.accept(visitor)
    })
  }

  public getCompleteSpan() {
    if (this.children.length === 0) {
      return new Span(this.token.span.min, this.token.span.lim)
    }
    return new Span(this.children[0].getCompleteSpan().min, this.children[this.count].getCompleteSpan().lim)
  }
}
