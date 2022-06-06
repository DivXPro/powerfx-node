import { FunctionSignature } from './FunctionSignature'

export class FunctionInfo {
  public label: string
  public detail: string
  public documentation: string
  public signatures: FunctionSignature[]

  constructor(label: string, detail: string, documentation: string, signatures: FunctionSignature[]) {
    this.label = label
    this.detail = detail
    this.documentation = documentation
    this.signatures = signatures
  }

  merge(mergeWith: FunctionInfo) {
    return new FunctionInfo(
      this.label,
      this.detail,
      this.documentation,
      this.signatures.concat(...mergeWith.signatures),
    )
  }
}
