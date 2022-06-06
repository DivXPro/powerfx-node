import { AggregateCoercionNode } from './node/AggregateCoercionNode'
import { BinaryOpNode } from './node/BinaryOpNode'
import { BooleanLiteralNode } from './node/BooleanLiteralNode'
import { CallNode } from './node/CallNode'
import { ChainingNode } from './node/ChainingNode'
import { ColorLiteralNode } from './node/ColorLiteralNode'
import { ErrorNode } from './node/ErrorNode'
import { LazyEvalNode } from './node/LazyEvalNode'
import { NumberLiteralNode } from './node/NumberLiteralNode'
import { RecordFieldAccessNode } from './node/RecordFieldAccessNode'
import { RecordNode } from './node/RecordNode'
import { ResolvedObjectNode } from './node/ResolvedObjectNode'
import { ScopeAccessNode } from './node/ScopeAccessNode'
import { SingleColumnTableAccessNode } from './node/SingleColumnTableAccessNode'
import { TableNode } from './node/TableNode'
import { TextLiteralNode } from './node/TextLiteralNode'
import { UnaryOpNode } from './node/UnaryOpNode'

export abstract class IRNodeVisitor<TResult, TContext> {
  public abstract visit(node: TextLiteralNode, context: TContext): Promise<TResult>
  public abstract visit(node: NumberLiteralNode, context: TContext): Promise<TResult>
  public abstract visit(node: BooleanLiteralNode, context: TContext): Promise<TResult>
  public abstract visit(node: ColorLiteralNode, context: TContext): Promise<TResult>
  public abstract visit(node: TableNode, context: TContext): Promise<TResult>
  public abstract visit(node: RecordNode, context: TContext): Promise<TResult>
  public abstract visit(node: ErrorNode, context: TContext): Promise<TResult>

  public abstract visit(node: LazyEvalNode, context: TContext): Promise<TResult>
  public abstract visit(node: CallNode, context: TContext): Promise<TResult>
  public abstract visit(node: BinaryOpNode, context: TContext): Promise<TResult>
  public abstract visit(node: UnaryOpNode, context: TContext): Promise<TResult>
  public abstract visit(node: ScopeAccessNode, context: TContext): Promise<TResult>
  public abstract visit(node: RecordFieldAccessNode, context: TContext): Promise<TResult>
  public abstract visit(node: ResolvedObjectNode, context: TContext): Promise<TResult>
  public abstract visit(node: SingleColumnTableAccessNode, context: TContext): Promise<TResult>
  public abstract visit(node: ChainingNode, context: TContext): Promise<TResult>
  public abstract visit(node: AggregateCoercionNode, context: TContext): Promise<TResult>
}
