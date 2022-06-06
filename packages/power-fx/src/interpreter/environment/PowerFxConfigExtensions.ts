import { PowerFxConfig } from '../../public'
import { ReflectionFunction } from '../ReflectionFunction'
import { OptionSet } from './OptionSet'

export class PowerFxConfigExtensions extends PowerFxConfig {
  public addOptionSet(optionSet: OptionSet) {
    this.addEntity(optionSet)
  }

  public addReflectionFunction(func: ReflectionFunction) {
    this.addFunction(func.getTexlFunction())
  }
}
