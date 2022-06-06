export class CodeActionCommand {
  /// <summary>
  /// ctor
  /// </summary>
  constructor() {
    this.Arguments = []
  }

  /// <summary>
  /// Gets or sets title of the command.
  /// </summary>
  public Title: string

  /// <summary>
  /// Gets or sets command to be executed.
  /// </summary>
  public Command: string

  /// <summary>
  /// Gets or sets command arguments.
  /// </summary>
  public Arguments: []
}
