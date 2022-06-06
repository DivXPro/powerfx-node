import { ParameterInfo } from './ParameterInfo'

export class FunctionSignature {
  public label: string
  public parameters: ParameterInfo[]

  constructor(label: string, parameters: ParameterInfo[]) {
    this.label = label
    this.parameters = parameters
  }
}
