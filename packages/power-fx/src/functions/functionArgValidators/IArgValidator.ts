import { TexlBinding } from '../../binding/Binder'
import { TexlNode } from '../../syntax'

export interface IArgValidator<T> {
  tryGetValidValue(argNode: TexlNode, binding: TexlBinding): [boolean, T]
}
