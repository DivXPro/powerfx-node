declare type HandlerFunc<T> = (sender: any, e: T) => void

export class EventHandler<T> {
  private handlers: Set<HandlerFunc<T>>
  add(handler: HandlerFunc<T>) {
    this.handlers.add(handler)
  }
  remove(handler: HandlerFunc<T>) {
    this.handlers.delete(handler)
  }
  invoke(sender: any, e: T) {
    this.handlers.forEach((handler) => {
      handler(sender, e)
    })
  }
}
