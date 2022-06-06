import {
  BlankNode,
  BoolLitNode,
  DottedNameNode,
  StrLitNode,
  NumLitNode,
  FirstNameNode,
  ParentNode,
  SelfNode,
  ReplaceableNode,
  UnaryOpNode,
  BinaryOpNode,
  VariadicOpNode,
  CallNode,
  ListNode,
  RecordNode,
  TableNode,
  AsNode,
  ErrorNode,
  StrInterpNode,
} from '../nodes'

// Abstract visitor base class
export declare type LeafNodeType =
  | BlankNode
  | BoolLitNode
  | StrLitNode
  | NumLitNode
  | FirstNameNode
  | ParentNode
  | SelfNode
  | ReplaceableNode
  | ErrorNode

export declare type NonLeafNodeType =
  | UnaryOpNode
  | BinaryOpNode
  | VariadicOpNode
  | CallNode
  | ListNode
  | RecordNode
  | TableNode
  | AsNode
  | DottedNameNode
  | StrInterpNode
