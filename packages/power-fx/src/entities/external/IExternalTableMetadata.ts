import { ColumnMetadata } from '../ColumnMetadata'

export interface IExternalTableMetadata {
  tryGetColumn(nameRhs: string): [boolean, ColumnMetadata]
  displayName: string
  name: string
}
