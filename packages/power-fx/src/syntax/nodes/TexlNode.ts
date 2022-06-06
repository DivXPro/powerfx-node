import { Span } from '../../localization'
import { Token } from '../../lexer/tokens'
import { NodeKind } from '../NodeKind'
import { SourceList } from '../sourceInformation'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { AsNode } from './AsNode'
import { BinaryOpNode } from './BinaryOpNode'
import { BlankNode } from './BlankNode'
import { BoolLitNode } from './BoolLitNode'
import { CallNode } from './CallNode'
import { DottedNameNode } from './DottedNameNode'
import { FirstNameNode } from './FirstNameNode'
import { ListNode } from './ListNode'
import { NumLitNode } from './NumLitNode'
import { ParentNode } from './ParentNode'
import { RecordNode } from './RecordNode'
import { ReplaceableNode } from './ReplaceNode'
import { SelfNode } from './SelfNode'
import { StrLitNode } from './StrLitNode'
import { TableNode } from './TableNode'
import { UnaryOpNode } from './UnaryOpNode'
import { ErrorNode } from './ErrorNode'
import { TexlPretty } from '../TexlPretty'
import { VariadicOpNode } from './VariadicOpNode'
import { FindNodeVisitor } from '../visitors/FindNodeVisitor'
import { StrInterpNode } from './StrInterpNode'

export abstract class TexlNode {
  protected minChildID: number
  private usesChains?: boolean
  // private kind?: NodeKind
  // private sourceList: SourceList
  protected depth: number
  public parent?: TexlNode
  public readonly id: number
  public readonly token: Token

  public sourceList: SourceList

  constructor(idNext: number, primaryToken: Token, sourceList: SourceList) {
    this.id = idNext
    this.minChildID = this.id
    this.token = primaryToken
    this.sourceList = sourceList
    this.depth = 1
  }

  get UsesChains() {
    if (this.usesChains != null) {
      return this.usesChains
    }
    // this.usesChains = ChainTrackerVisitor.Run(this)
    return this.usesChains
  }

  get Depth() {
    return this.depth
  }

  get MinChildID() {
    return this.minChildID
  }

  public abstract get kind(): NodeKind
  public abstract clone(idNext: number, ts: Span): TexlNode
  public abstract accept(visitor: TexlVisitor): void
  public abstract acceptResult<Result, Context>(
    visitor: TexlFunctionalVisitor<Result, Context>,
    context: Context,
  ): Result

  public parser_setSourceList(sources: SourceList) {
    // Contracts.AssertValue(sources)
    this.sourceList = sources
  }

  public getTextSpan() {
    return new Span(this.token.span.min, this.token.span.lim)
  }

  public getCompleteSpan() {
    return this.getTextSpan()
  }

  public getSourceBasedSpan() {
    if (this.sourceList.tokens.length == 0) return this.getCompleteSpan()

    const start = this.sourceList.tokens[1].span.min
    const end = this.sourceList.tokens[this.sourceList.tokens.length].span.lim
    return new Span(start, end)
  }

  public asError(): ErrorNode {
    return undefined
  }

  public castFirstName(): FirstNameNode {
    // Contracts.Assert(false);
    // if (this instanceof FirstNameNode) {
    //   return this as FirstNameNode
    // }
    return undefined
  }

  public asFirstName(): FirstNameNode {
    return undefined
  }

  public asParent(): ParentNode {
    return undefined
  }

  public asReplaceable(): ReplaceableNode {
    return undefined
  }

  public asSelf(): SelfNode {
    return undefined
  }

  public castDottedName(): DottedNameNode {
    // Contracts.Assert(false);
    // if (this instanceof DottedNameNode) {
    //   return this as DottedNameNode
    // }
    return undefined
  }

  public asDottedName(): DottedNameNode {
    return undefined
  }

  public asNumLit(): NumLitNode {
    return undefined
  }

  public asStrLit(): StrLitNode {
    return undefined
  }

  public asStrInterp(): StrInterpNode {
    return undefined
  }

  public castBoolLit(): BoolLitNode {
    // Contracts.Assert(false);
    // if (this instanceof BoolLitNode) {
    //   return this as BoolLitNode
    // }
    return undefined
  }

  public asBoolLit(): BoolLitNode {
    return undefined
  }

  public castUnaryOp(): UnaryOpNode {
    // Contracts.Assert(false);
    // if (this instanceof UnaryOpNode) {
    //   return this as UnaryOpNode
    // }
    return undefined
  }

  public asUnaryOpLit(): UnaryOpNode {
    return undefined
  }

  public castBinaryOp(): BinaryOpNode {
    // Contracts.Assert(false);
    // if (this instanceof BinaryOpNode) {
    //   return this as BinaryOpNode
    // }
    return undefined
  }

  public asBinaryOp(): BinaryOpNode {
    return undefined
  }

  public asVariadicOp(): VariadicOpNode {
    return undefined
  }

  public castList(): ListNode {
    // Contracts.Assert(false);
    // if (this instanceof ListNode) {
    //   return this as ListNode
    // }
    return undefined
  }

  public asList(): ListNode {
    return undefined
  }

  public castCall(): CallNode {
    // Contracts.Assert(false);
    // if (this instanceof CallNode) {
    //   return this as CallNode
    // }
    return undefined
  }

  public asCall(): CallNode {
    return undefined
  }

  public castRecord(): RecordNode {
    // Contracts.Assert(false);
    // if (this instanceof RecordNode) {
    //   return this as RecordNode
    // }
    return undefined
  }

  public asRecord(): RecordNode {
    return undefined
  }

  public asTable(): TableNode {
    return undefined
  }

  public asBlank(): BlankNode {
    return undefined
  }

  public asAsNode(): AsNode {
    return undefined
  }

  public inTree(root: TexlNode) {
    // Contracts.AssertValue(root)
    return root.MinChildID <= this.id && this.id <= root.id
  }

  public toString() {
    return TexlPretty.PrettyPrint(this)
  }

  // Returns the nearest node to the cursor position. If the node has child nodes returns the nearest child node.
  public static FindNode(rootNode: TexlNode, cursorPosition: number): TexlNode {
    // Contracts.AssertValue(rootNode)
    // Contracts.Assert(cursorPosition >= 0)
    return FindNodeVisitor.Run(rootNode, cursorPosition)
  }
}
