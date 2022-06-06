import { ExpandPath, IExpandInfo } from '../../types'
import { DataSource } from '../external/DataSource'

export class ControlExpandInfo implements IExpandInfo {
  expandPath: ExpandPath
  identity: string
  isTable: boolean
  name: string
  parentDataSource: DataSource
  polymorphicParent: string

  clone(): IExpandInfo {
    return undefined
  }

  equals(other: any): boolean {
    if (other instanceof ControlExpandInfo) {
      return (
        this.identity === other.identity &&
        this.name === other.name &&
        this.isTable === other.isTable &&
        this.parentDataSource === other.parentDataSource &&
        this.polymorphicParent === other.polymorphicParent
      )
    }
    return false
  }

  toDebugString(): string {
    return ''
  }

  updateEntityInfo(dataSource: DataSource, relatedEntityPath: string): void {}
}
