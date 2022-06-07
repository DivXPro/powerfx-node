import { TextEncoder, TextDecoder } from 'web-encoding'
import { StringFormat } from './StringFormat'

export class StringBuilder {
  private utf8Decoder = new TextDecoder()
  private utf8Encoder = new TextEncoder()

  private bufferConsumed = 0
  private _capacity = 128
  private buffer = new Uint8Array(128)

  constructor(str?: string | number) {
    if (typeof str === 'number') {
      this._capacity = str
    } else {
      if (str != null) {
        this.append(str)
      }
    }
  }

  public get capacity() {
    return this._capacity
  }

  public get length() {
    return this.bufferConsumed
  }

  public ensureCapacity(least: number) {
    if (this._capacity < least) {
      const tmpBuffer = this.buffer
      this.buffer = new Uint8Array(least)
      for (let i = 0; i < this.bufferConsumed; i++) {
        this.buffer[i] = tmpBuffer[i]
      }
      this._capacity = least
    }
  }

  public set length(length: number) {
    if (length > this._capacity) {
      this.capacityGrow(length)
      const tmpBuffer = this.buffer
      this.buffer = new Uint8Array(this.capacity)
      for (let i = 0; i < this.bufferConsumed; i++) {
        this.buffer[i] = tmpBuffer[i]
      }
    } else if (length < this.bufferConsumed) {
      const tmpBuffer = this.buffer
      this.buffer = new Uint8Array(this.capacity)
      for (let i = 0; i < length; i++) {
        this.buffer[i] = tmpBuffer[i]
      }
      this.bufferConsumed = length
    }
  }

  private capacityGrow(grow: number) {
    while (grow + this.bufferConsumed > this.capacity) {
      this._capacity = this.capacity * 2
    }
  }

  public at(index: number) {
    const buf = this.buffer.slice(index, index + 1)
    const b = this.buffer[index]
    return this.utf8Decoder.decode(buf)
  }

  public appendFormat(strToAdd: string, ...args: any[]) {
    return this.append(StringFormat(strToAdd, ...args))
  }

  public appendLine(strToAdd?: string | number) {
    this.append(`${strToAdd}\n`)
  }

  public append(
    strToAdd: string | number,
    startIndex?: number,
    count?: number
  ): StringBuilder {
    // O(N) copy but ammortized to O(1) over all concats
    const encodedStr = this.utf8Encoder.encode(
      strToAdd.toString().substr(startIndex, count)
    )
    this.capacityGrow(encodedStr.length)
    if (this.buffer.length < this.capacity) {
      const tmpBuffer = this.buffer
      this.buffer = new Uint8Array(this.capacity)
      for (let i = 0; i < this.bufferConsumed; i++) {
        this.buffer[i] = tmpBuffer[i]
      }
    }
    for (let i = 0; i < encodedStr.length; i++) {
      this.buffer[this.bufferConsumed + i] = encodedStr[i]
    }
    //   const rightBuffer = this.buffer.subarray(startIndex)
    //   // // add the characters to the end
    //   for (let i = 0; i < encodedStr.length; i++) {
    //     this.buffer[i + startIndex] = encodedStr[i]
    //   }
    //   for (let i = 0; i < rightBuffer.length; i++) {
    //     this.buffer[i + startIndex + encodedStr.length] = rightBuffer[i]
    //   }
    //   this.bufferConsumed += encodedStr.length
    // } else {
    //   for (let i = 0; i < encodedStr.length; i++) {
    //     this.buffer[i + this.bufferConsumed] = encodedStr[i]
    //   }
    //   this.bufferConsumed += encodedStr.length
    // add the characters to the end
    this.bufferConsumed += encodedStr.length
    return this
  }

  // public appendAt(strToAdd: string, startIndex: number, count: number) {
  //   O(N) copy but ammortized to O(1) over all concats
  //   const encodedStr = this.utf8Encoder.encode(strToAdd.substr(0, count))
  //   this.capacityGrow(encodedStr.length)
  //   if (this.buffer.length < this.capacity) {
  //     const tmpBuffer = this.buffer
  //     this.buffer = new Uint8Array(this.capacity)
  //     for (let i = 0; i < this.bufferConsumed; i++) {
  //       this.buffer[i] = tmpBuffer[i]
  //     }
  //   }
  //   const rightBuffer = this.buffer.subarray(startIndex)
  //   // // add the characters to the end
  //   for (let i = 0; i < encodedStr.length; i++) {
  //     this.buffer[i + startIndex] = encodedStr[i]
  //   }
  //   for (let i = 0; i < rightBuffer.length; i++) {
  //     this.buffer[i + startIndex + encodedStr.length] = rightBuffer[i]
  //   }
  //   this.bufferConsumed += encodedStr.length
  //   return this
  // }

  public insert(index: number, value: string, count: number = 1) {
    let innerValue = value
    for (let i = 0; i < count; i++) {
      innerValue += value
    }
    this.append(innerValue, 0)
  }

  public clear() {
    this.buffer = new Uint8Array(128)
    this.bufferConsumed = 0
  }

  private build() {
    return this.utf8Decoder.decode(this.buffer.slice(0, this.bufferConsumed))
  }

  public toString() {
    return this.build()
  }
}
