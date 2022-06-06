import { DType } from '../../types/DType'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { BindKind } from '../BindKind'

/* struct */
export class NameLookupInfo {
  public readonly kind: BindKind
  public readonly path: DPath
  public readonly upCount: number
  public readonly type: DType
  public readonly logicalName: DName

  // Optional data associated with a name. May be null.
  public readonly data: any

  public static Default() {
    return new NameLookupInfo(0, null, null, 0, null, null)
  }

  constructor(kind: BindKind, type: DType, path: DPath, upCount: number, data?: any, logicalName: DName = null) {
    // Contracts.Assert(BindKind._Min <= kind && kind < BindKind._Lim)
    // Contracts.Assert(upCount >= 0)
    // Contracts.AssertValueOrNull(data)

    this.kind = kind
    this.type = type
    this.path = path
    this.upCount = upCount
    this.data = data
    this.logicalName = logicalName
  }
}
