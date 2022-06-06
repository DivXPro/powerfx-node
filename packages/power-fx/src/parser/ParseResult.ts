import { TexlError } from '../errors'
import { CommentToken } from '../lexer/tokens'
import { SourceList, TexlNode } from '../syntax'

export class ParseResult {
  root: TexlNode
  errors: Array<TexlError>
  hasError: boolean
  comments: Array<CommentToken>
  before: SourceList
  after: SourceList

  constructor(
    root: TexlNode,
    errors: Array<TexlError>,
    hasError: boolean,
    comments: Array<CommentToken>,
    before: SourceList,
    after: SourceList,
  ) {
    // Contracts.AssertValue(root);
    // Contracts.AssertValue(comments);

    // You can have an empty error list and still have a semi-silent error, but if you have an error in your list there must have been an error.
    // Contracts.Assert(errors != null ? hasError : true);

    this.root = root
    this.errors = errors
    this.hasError = hasError
    this.comments = comments
    this.before = before
    this.after = after
  }
}
