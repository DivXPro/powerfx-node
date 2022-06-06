import { FunctionCategories } from '../types/FunctionCategories'

export interface IFunction {
  name: string
  qualifiedName: string
  description: string
  helpLink: string
  functionCategoriesMask: FunctionCategories
}
