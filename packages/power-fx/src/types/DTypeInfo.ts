import { DType } from './DType'

export class DTypeInfo {
  public dType: DType

  /// <summary>
  /// Indicates if the DType represents a truncated schema.
  /// This would indicate a loop in a type tree or that the originating schema has a depth larger
  /// than the 'max schema depth' supported by the schema computation function.
  /// </summary>
  public isTruncated: boolean

  constructor(dType: DType, isTruncated: boolean) {
    this.dType = dType
    this.isTruncated = isTruncated
  }
}
