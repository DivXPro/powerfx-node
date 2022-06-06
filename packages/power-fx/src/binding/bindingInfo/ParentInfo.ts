import { IExternalControl } from '../../app/controls/IExternalControl'
import TexlLexer from '../../lexer/TexlLexer'
import { ParentNode } from '../../syntax'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { ControlKeywordInfo } from './ControlKeywordInfo'

export class ParentInfo extends ControlKeywordInfo {
  public get name() {
    return new DName(TexlLexer.KeywordParent)
  }

  constructor(node: ParentNode, path: DPath, data: IExternalControl) {
    super(node, path, data)
  }
}
