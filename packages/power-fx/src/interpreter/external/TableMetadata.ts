import { IExternalTableMetadata } from '../../entities/external/IExternalTableMetadata'
import { ColumnCreationKind, ColumnMetadata } from '../../entities/ColumnMetadata'
import { IDataEntityMetadata } from '../../functions/delegation'
import { DName } from '../../utils'

export class TableMetadata implements IExternalTableMetadata {
  private _displayName: string
  public get displayName() {
    return this._displayName
  }
  private _name: string
  public get name() {
    return this._name
  }
  private _columns: ColumnMetadata[]
  public get columns() {
    return this._columns
  }

  constructor(name: string, displayName: string, columns: ColumnMetadata[]) {
    this._name = name
    this._displayName = displayName
    this._columns = columns
  }

  tryGetColumn(nameRhs: string): [boolean, ColumnMetadata] {
    return [false, undefined]
  }

  static MakeTableMetadataFromDataEntityMetadata(dataEntityMetaData: IDataEntityMetadata): TableMetadata {
    const columns = Array.from(dataEntityMetaData.displayNameMapping.getEnumerator()).map((attribute) => {
      const name = attribute[0]
      const displayName = attribute[1]
      const type = dataEntityMetaData.schema.getType(new DName(name))
      return new ColumnMetadata(
        name,
        type,
        undefined,
        displayName,
        false,
        name === dataEntityMetaData.entityDefinition.primaryKey,
        false,
        ColumnCreationKind.UserProvided,
        undefined,
        dataEntityMetaData.entityDefinition.titleKey,
        undefined,
        undefined,
      )
    })
    return new TableMetadata(dataEntityMetaData.entityName, dataEntityMetaData.entityName, columns)
  }
}
