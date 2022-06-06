import { IExternalControl } from '../../app/controls/IExternalControl'
import TexlLexer from '../../lexer/TexlLexer'
import { SelfNode } from '../../syntax'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { ControlKeywordInfo } from './ControlKeywordInfo'

export class SelfInfo extends ControlKeywordInfo {
  public get name() {
    return new DName(TexlLexer.KeywordSelf)
  }

  constructor(node: SelfNode, path: DPath, data: IExternalControl) {
    super(node, path, data)
  }
}
