import { DottedNameNode } from './DottedNameNode'
import { ListNode } from './ListNode'
import { SourceList } from '../sourceInformation'
import { Identifier } from '../Identifier'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { TexlBinding } from '../../binding/Binder'
import { Token } from '../../lexer/tokens'
import { Span } from '../../localization'
import { NodeKind } from '../NodeKind'
import { TexlNode } from './TexlNode'

export class CallNode extends TexlNode {
  readonly args: ListNode
  readonly parenClose: Token
  readonly headNode?: TexlNode
  readonly head: Identifier
  readonly uniqueInvocationId?: string

  private static uniqueInvocationIdNext: number

  constructor(
    idNext: number,
    primaryToken: Token,
    sourceList: SourceList,
    head: Identifier,
    headNode: TexlNode | undefined,
    args: ListNode,
    tokParenClose: Token,
  ) {
    super(idNext, primaryToken, sourceList)
    this.head = head
    this.headNode = headNode
    this.args = args
    this.args.parent = this
    this.parenClose = tokParenClose

    const headDepth = headNode == null ? 0 : headNode.Depth
    if (args) {
      this.depth = 1 + args.Depth > headDepth ? args.Depth : headDepth
    } else {
      this.depth = headDepth
    }

    if (headNode != null) this.minChildID = Math.min(headNode.MinChildID, this.minChildID)

    if (args != null) this.minChildID = Math.min(args.MinChildID, this.minChildID)
  }

  clone(idNext: number, ts: Span) {
    const newNodes = new Map<TexlNode, TexlNode>()
    if (this.args) {
      newNodes.set(this.args, this.args.clone(idNext++, ts))
    }
    let headNode: TexlNode | undefined = undefined
    if (this.headNode != null) {
      headNode = this.headNode.clone(idNext++, ts)
      newNodes.set(this.headNode, headNode)
    }
    return new CallNode(
      idNext++,
      this.token.clone(ts),
      this.sourceList.clone(ts, newNodes),
      this.head,
      headNode,
      this.args,
      this.parenClose,
    )
  }

  get kind() {
    return NodeKind.Call
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.args.accept(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public castCall(): CallNode {
    return this
  }

  public asCall(): CallNode {
    return this
  }

  public getTextSpan() {
    if (this.parenClose == null) return super.getTextSpan()
    // If the call is a Service call then adjust the span for the entire call
    let dotted: DottedNameNode
    if (this.headNode != null && (dotted = this.headNode.asDottedName()) != null) {
      return new Span(dotted.getCompleteSpan().min, this.parenClose.span.lim)
    }
    return new Span(this.head.token.Span.min, this.parenClose.span.lim)
  }

  public getCompleteSpan() {
    let limit: number

    // If we have a close paren, then the call node is complete.
    // If not, then the call node ends with the end of the last argument.
    if (this.parenClose != null) limit = this.parenClose.span.lim
    else {
      limit = this.args.getCompleteSpan().lim
    }

    let dotted: DottedNameNode
    if (this.headNode != null && (dotted = this.headNode.asDottedName()) != null)
      return new Span(dotted.getCompleteSpan().min, limit)

    return new Span(this.head.token.span.min, limit)
  }

  // Does the CallNode have an argument/expression that is async without side effects
  // Check 1..N arguments to identify if there is an AsyncWithNoSideEffects expression.
  public hasArgumentAsyncWithNoSideEffects(binding: TexlBinding, firstArgument = 0): boolean {
    // check if the CallNode has any async arguments.
    // some functions don't need to look at all
    // arguments (e.g. Filter and LookUp where the first arg is a data source)
    return this.args.children.some((child, i) => i > firstArgument && binding.isAsyncWithNoSideEffects(child))
    // return this.args.children.Skip(firstArgument).Any((x) => binding.IsAsyncWithNoSideEffects(x))
  }
}
