import { Token } from '../../lexer/tokens/Token'
import { Span } from '../../localization/Span'
import { TexlNode } from '../nodes'

export interface ITexlSource {
  tokens: Token[]
  sources: ITexlSource[]

  clone(newNodes: Map<TexlNode, TexlNode>, sapn: Span): ITexlSource
}
