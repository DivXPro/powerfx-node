// export class Stack<T> {
//   private storage: T[] = []

//   constructor(private capacity: number = Infinity) {}

//   push(item: T): void {
//     if (this.size() === this.capacity) {
//       throw Error('Stack has reached max capacity, you cannot add more items')
//     }
//     this.storage.push(item)
//   }

//   pop(): T | undefined {
//     return this.storage.pop()
//   }

//   peek(): T | undefined {
//     return this.storage[this.size() - 1]
//   }

//   size(): number {
//     return this.storage.length
//   }
// }

const CAPACITY: number = 10

export class Stack<T> {
  private elements: Array<T>
  private _size: number

  public constructor(capacity: number = CAPACITY) {
    this.elements = new Array<T>(capacity)
    this._size = 0
  }

  public push(o: T) {
    var len = this.elements.length
    if (this._size >= len) {
      let temp = new Array<T>(len)
      this.elements = this.elements.concat(temp)
    }
    this.elements[this._size++] = o
  }

  public pop(): T {
    return this.elements[--this._size]
  }

  public peek(): T {
    return this.elements[this._size - 1]
  }

  public size(): number {
    return this._size
  }

  public get count() {
    return this.size
  }

  public empty(): boolean {
    return this._size == 0
  }

  public clear(capacity: number = CAPACITY) {
    delete this.elements
    this.elements = new Array(capacity)
    this._size = 0
  }
}
