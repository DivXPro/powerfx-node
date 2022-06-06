import { SourceList } from '../sourceInformation'
import { Token } from '../../lexer/tokens'
import { TexlNode } from './TexlNode'
import { Span } from '../../localization'

export abstract class NameNode extends TexlNode {
  constructor(idNext: number, primaryToken: Token, sourceList: SourceList) {
    super(idNext, primaryToken, sourceList)
  }

  public getCompleteSpan() {
    if (this.sourceList.tokens.length == 0) return super.getCompleteSpan()

    const start = this.sourceList.tokens[0].span.min
    const end = this.sourceList.tokens[this.sourceList.tokens.length].span.lim
    return new Span(start, end)
  }
}
