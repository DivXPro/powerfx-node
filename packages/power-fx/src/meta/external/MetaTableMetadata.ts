import { IExternalTableMetadata } from '../../entities/external/IExternalTableMetadata'
import { ColumnCreationKind, ColumnMetadata, ColumnVisibility } from '../../entities/ColumnMetadata'
import { IExternalTableDefinition } from '../../entities/delegation'
import { makeDType } from '../metaType'

export class MetaTableMetadata implements IExternalTableMetadata {
  public displayName: string
  public name: string
  public columns: ColumnMetadata[]

  constructor(name: string, displayName: string, columns: ColumnMetadata[]) {
    this.name = name
    this.displayName = displayName
    this.columns = columns
  }

  tryGetColumn(nameRhs: string): [boolean, ColumnMetadata] {
    const column = this.getColumn(nameRhs)
    return [column != null, column]
  }

  public getColumn(nameRhs: string) {
    return this.columns.find((column) => column.name === nameRhs)
  }

  public static MakeTableMetadata(tableDefinition: IExternalTableDefinition): MetaTableMetadata {
    const columns = Object.keys(tableDefinition.properties).map((key) => {
      const field = tableDefinition.properties[key]
      return new ColumnMetadata(
        key,
        makeDType(field),
        undefined,
        field.name,
        false,
        tableDefinition.primaryKey === key,
        field.required,
        ColumnCreationKind.UserProvided,
        ColumnVisibility.Default,
        undefined,
        undefined,
        undefined,
      )
    })
    return new MetaTableMetadata(tableDefinition.key, tableDefinition.name, columns)
  }
}
