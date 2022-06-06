export interface TextDocumentUri {
  /**上下文json*/
  context: string
  getTokensFlags?: number
  /**表达式*/
  expression?: string
  getExpressionType?: boolean
}
