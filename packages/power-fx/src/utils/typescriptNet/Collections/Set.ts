import Type from '../Types'
import getIdentifier from './Dictionaries/getIdentifier'
import { ISymbolizable } from './Dictionaries/IDictionary'
import Primitive from '../Primitive'
import FiniteEnumerableOrArrayLike from './FiniteEnumerableOrArrayLike'
import HashSet from './HashSet'

function getId(obj: any): string | number | symbol {
  return getIdentifier(obj, typeof obj != Type.BOOLEAN)
}

export class Set<T extends Primitive | ISymbolizable | symbol> extends HashSet<T> {
  constructor(source?: FiniteEnumerableOrArrayLike<T>) {
    super(source, getId)
  }
}

export default Set
