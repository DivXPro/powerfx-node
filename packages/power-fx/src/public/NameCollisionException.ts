export class NameCollisionException extends Error {
  private _collidingDisplayName: string
  public get collidingDisplayName() {
    return this._collidingDisplayName
  }
  constructor(collidingDisplayName: string) {
    super(`Name ${collidingDisplayName} has a collision with another display or logical name`)
    this._collidingDisplayName = collidingDisplayName
  }
}
