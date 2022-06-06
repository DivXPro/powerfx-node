export class BitArray extends Map<number, boolean> {
  constructor(entries?: readonly (readonly [number, boolean])[] | Map<number, boolean> | null) {
    super(entries)
  }
}
