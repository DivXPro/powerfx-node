import { DName } from '../../utils/DName'
import { FirstNameNode } from './FirstNameNode'
import { Identifier } from '../Identifier'
import { NameNode } from './NameNode'
import { TexlNode } from './TexlNode'
import { NodeKind } from '../NodeKind'
import { TokKind } from '../../lexer/TokKind'
import { Token } from '../../lexer/tokens'
import { TexlFunctionalVisitor, TexlVisitor } from '../visitors'
import { SourceList } from '../sourceInformation'
import { ParentNode } from './ParentNode'
import { SelfNode } from './SelfNode'
import { Span } from '../../localization'
import { DPath } from '../../utils/DPath'
import { Stack } from '../../utils/Stack'
import TexlLexer from '../../lexer/TexlLexer'

export class DottedNameNode extends NameNode {
  readonly left: TexlNode
  readonly right: Identifier

  readonly rightNode?: TexlNode
  readonly hasOnlyIdentifiers?: boolean
  readonly hasPossibleNamespaceQualifier?: boolean

  get kind() {
    return NodeKind.DottedName
  }

  get usesDot() {
    return this.token.kind == TokKind.Dot
  }

  get usesBang() {
    return this.token.kind == TokKind.Bang
  }

  get usesBracket() {
    return this.token.kind == TokKind.BracketOpen
  }

  constructor(
    idNext: number,
    primaryToken: Token,
    sourceList: SourceList,
    left: TexlNode,
    right: Identifier,
    rightNode?: TexlNode,
  ) {
    // Contracts.AssertValue(primaryToken)
    // Contracts.Assert(primaryToken.IsDottedNamePunctuator)
    // Contracts.AssertValue(left)
    // Contracts.AssertValue(right)

    // The LHS of a [] can only be a first name node. E.g. foo[bar] is valid, but foo!bar[car] is not.
    // Also, dotted names can't mix tokens, except for []. E.g. foo[bar]!car is valid, but foo.bar!car is not.
    // Contracts.Assert(primaryToken.Kind == TokKind.BracketOpen ?
    //     left is FirstNameNode :
    //     !(left is DottedNameNode) || left.AsDottedName().Token.Kind == TokKind.BracketOpen || left.AsDottedName().Token.Kind == primaryToken.Kind);

    super(idNext, primaryToken, sourceList)
    this.left = left
    this.right = right
    this.rightNode = rightNode
    this.hasOnlyIdentifiers =
      left instanceof FirstNameNode || (left instanceof DottedNameNode && left.hasOnlyIdentifiers)

    // this.hasPossibleNamespaceQualifier = this.hasOnlyIdentifiers
    this.hasPossibleNamespaceQualifier =
      this.hasOnlyIdentifiers || left instanceof SelfNode || left instanceof ParentNode

    this.depth = left.Depth + 1
    this.minChildID = Math.min(left.MinChildID, rightNode?.MinChildID || this.minChildID)
  }

  public matches(leftIdentifier: DName, rightIdentifier: DName) {
    // Contracts.AssertValid(leftIdentifier);
    // Contracts.AssertValid(rightIdentifier);

    return (
      this.left instanceof FirstNameNode && this.left.ident.name == leftIdentifier && this.right.name == rightIdentifier
    )
  }

  clone(idNext: number, ts: Span) {
    const left = this.left.clone(idNext++, ts)
    const newNodes = new Map<TexlNode, TexlNode>([[this.left, left]])
    const rightNode = this.rightNode?.clone(idNext++, ts)
    if (rightNode != null) {
      newNodes.set(this.rightNode as TexlNode, rightNode)
    }
    return new DottedNameNode(
      idNext,
      this.token.clone(ts),
      this.sourceList.clone(ts, newNodes),
      left,
      this.right.clone(ts),
      rightNode,
    )
  }

  public accept(visitor: TexlVisitor) {
    // Contracts.AssertValue(visitor);
    if (visitor.preVisit(this)) {
      this.left.accept(visitor)
      visitor.postVisit(this)
    }
  }

  public acceptResult<Result, Context>(visitor: TexlFunctionalVisitor<Result, Context>, context: Context): Result {
    return visitor.visit(this, context)
  }

  public castDottedName(): DottedNameNode {
    return this
  }

  public asDottedName(): DottedNameNode {
    return this
  }

  public toDPath(): DPath {
    // Contracts.Assert(this.hasPossibleNamespaceQualifier);

    const names = new Stack<DName>(2)
    names.push(this.right.name)

    // Traverse the DottedNameNode structure non-recursively, to account for the possibility
    // that it may be very deep. Accumulate all encountered names onto a stack.
    let pointer: DottedNameNode = this
    let reachedLeft: boolean = false
    while (pointer != null) {
      const left = pointer.left

      if (left instanceof FirstNameNode) {
        names.push(left.ident.name)
        reachedLeft = true
      } else if (left instanceof ParentNode) {
        names.push(new DName(TexlLexer.KeywordParent))
        reachedLeft = true
      } else if (left instanceof SelfNode) {
        names.push(new DName(TexlLexer.KeywordSelf))
        reachedLeft = true
      }
      if (reachedLeft) {
        break
      }
      pointer = left as DottedNameNode

      if (reachedLeft) break

      pointer = left as DottedNameNode
      if (pointer != null) names.push(pointer.right.name)
      // else
      // Contracts.Assert(false, "Can only do this for dotted names consisting of identifiers");
    }

    // For the DPath by unwinding the names stack
    let path = DPath.Root
    while (names.size() > 0) path = path.append(names.pop() as DName) as DPath

    return path
  }

  public getTextSpan() {
    return new Span(this.token.span.min, this.right.token.span.lim)
  }

  public getCompleteSpan() {
    let min = this.token.span.min
    let leftNode = this.left
    while (leftNode != null) {
      let dottedLeft: DottedNameNode
      if ((dottedLeft = leftNode.asDottedName()) != null) {
        leftNode = dottedLeft.left
      } else {
        min = leftNode.getCompleteSpan().min
        break
      }
    }
    return new Span(min, this.right.token.span.lim)
  }
}
