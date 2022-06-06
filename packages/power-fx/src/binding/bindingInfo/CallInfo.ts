import { TexlFunction } from '../../functions/TexlFunction'
import { CallNode } from '../../syntax'
import { DType } from '../../types/DType'
import { DName } from '../../utils/DName'

// noinspection DuplicatedCode
export class CallInfo {
  public readonly node: CallNode
  // May be null.
  public readonly function?: TexlFunction
  // CursorType will be DType.Invalid if the function is null or does not support a cursor variable.
  public readonly cursorType?: DType
  // Scope nesting level for this invocation. This is currently >0 only for
  // invocations of functions with scope. This refers to the scope depth of the call itself,
  // not of its lambda arguments.
  public readonly scopeNest?: number
  // ScopeIdentifier will be "" if the function does not support a scope identifier
  // RequiresScopeIdentifier is true if scopeIdentifier is set and there was an As node used
  public readonly scopeIdentifier?: DName
  public readonly requiresScopeIdentifier?: boolean

  public readonly data?: any

  constructor(
    node: CallNode,
    fn?: TexlFunction,
    data?: any,
    cursorType?: DType,
    scopeIdentifier?: DName,
    requiresScopeIdentifier?: boolean,
    scopeNest?: number,
  ) {
    //   Contracts.AssertValue(node);
    this.node = node
    this.function = fn
    this.data = data
    this.cursorType = cursorType
    this.scopeNest = scopeNest
    this.scopeIdentifier = scopeIdentifier
    this.requiresScopeIdentifier = requiresScopeIdentifier
  }
}
