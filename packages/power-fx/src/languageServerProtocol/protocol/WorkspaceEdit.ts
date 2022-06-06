import Dictionary from '../../utils/typescriptNet/Collections/Dictionaries/Dictionary'
import { TextEdit } from './TextEdit'

export class WorkspaceEdit {
  /// <summary>
  /// ctor
  /// </summary>
  constructor() {
    this.Changes = new Dictionary<string, TextEdit[]>()
  }

  /// <summary>
  /// Gets or sets suggested changes.
  /// </summary>
  public Changes: Dictionary<string, TextEdit[]>
}
