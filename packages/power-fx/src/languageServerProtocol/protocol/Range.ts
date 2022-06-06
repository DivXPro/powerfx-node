import { Position } from './Position'

/**
 * Range实现，特意小写，阻止和es5内置类冲突
 */
export class range {
  constructor() {
    this.start = new Position()
    this.end = new Position()
  }

  /// <summary>
  /// The range's start position.
  /// </summary>
  public start: Position

  /// <summary>
  /// The range's end position.
  /// </summary>
  public end: Position
}
