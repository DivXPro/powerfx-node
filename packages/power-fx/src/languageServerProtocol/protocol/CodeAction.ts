import { CodeActionCommand } from './CodeActionCommand'
import { Diagnostic } from './Diagnostics'
import { WorkspaceEdit } from './WorkspaceEdit'

export class CodeAction {
  /// <summary>
  /// ctor
  /// </summary>
  constructor() {
    this.Diagnostics = []
  }

  /// <summary>
  /// Get or sets the title of the code action.
  /// </summary>
  public Title: string

  /// <summary>
  /// Gets or sets the code action kind.
  /// </summary>
  public Kind: string

  /// <summary>
  /// An array of diagnostic information items.
  /// </summary>
  public Diagnostics: Diagnostic[]

  /// <summary>
  /// Gets or sets supported code action edits.
  /// </summary>
  public Edit: WorkspaceEdit

  /// <summary>
  /// Gets or sets code action command.
  /// </summary>
  public Command: CodeActionCommand
}
