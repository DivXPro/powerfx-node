import { isNullOrEmpty } from '../utils/CharacterUtils'
import { hashCode } from '../utils/Hash'
import { DName, DPath } from '../utils'

export class ExpandPath {
  static readonly PathSeperator = '/'

  public readonly relatedEntityPath: string
  public readonly entityName: string
  public readonly rowIndex?: number

  constructor(relatedEntityPath: string, entityName: string, rowIndex?: number) {
    // Contracts.AssertValue(relatedEntityPath);
    // Contracts.AssertNonEmpty(entityName);

    this.relatedEntityPath = relatedEntityPath
    this.entityName = entityName
    this.rowIndex = rowIndex
  }

  public static CreateExpandPath(relatedEntityPath: string, entityName: string, rowIndex?: number) {
    // Contracts.AssertValue(relatedEntityPath);
    // Contracts.AssertNonEmpty(entityName);

    relatedEntityPath = relatedEntityPath.replace(/(\/)+$/, ExpandPath.PathSeperator)
    return new ExpandPath(relatedEntityPath, entityName, rowIndex)
  }

  public equals(obj: any) {
    if (obj instanceof ExpandPath) {
      return this.toString() == obj.toString()
    }
    return false
  }

  public getHashCode() {
    return hashCode(this.toString())
  }

  public toString() {
    if (isNullOrEmpty(this.relatedEntityPath)) {
      return this.entityName
    }
    if (this.rowIndex == null) {
      return this.relatedEntityPath + ExpandPath.PathSeperator + this.entityName
    }
    return (
      this.relatedEntityPath +
      ExpandPath.PathSeperator +
      `${this.rowIndex}` +
      ExpandPath.PathSeperator +
      this.entityName
    )
  }

  public toDPath(root?: DPath) {
    if (isNullOrEmpty(this.relatedEntityPath)) {
      return new DPath(root ?? DPath.Root, new DName(this.entityName))
    }
    if (this.rowIndex != null) {
      return new DPath(root ?? DPath.Root, new DName(this.relatedEntityPath))
        .append(new DName(`${this.rowIndex}`))
        .append(new DName(this.entityName))
    }
    return new DPath(root ?? DPath.Root, new DName(this.relatedEntityPath)).append(new DName(this.entityName))
  }
}
