import { DType } from '../../types/DType'
import { DName } from '../../utils/DName'

export class ScopedNameLookupInfo {
  public readonly type: DType
  public readonly argIndex: number
  public readonly name: DName
  public readonly namespace: DName
  public readonly isStateful: boolean

  constructor(type: DType, argIndex: number, namesp: DName, name: DName, isStateful: boolean) {
    // Contracts.AssertValid(type)
    // Contracts.AssertValid(name)

    this.type = type
    this.argIndex = argIndex
    this.namespace = namesp
    this.name = name
    this.isStateful = isStateful
  }
}
