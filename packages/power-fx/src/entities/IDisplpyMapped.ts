import { BidirectionalDictionary } from '../utilityDataStructures/BidirectionalDictionary'

export interface IDisplayMapped<T> {
  isConvertingDisplayNameMapping: boolean
  displayNameMapping: BidirectionalDictionary<T, string>
  previousDisplayNameMapping: BidirectionalDictionary<T, string>
}
