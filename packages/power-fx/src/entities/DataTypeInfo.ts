import { DataFormat } from '../app/DataFormat'
import { DKind } from '../types/DKind'
import { Dictionary } from '../utils/Dictionary'

export class DataTypeInfo {
  private static readonly noValidFormt: DataFormat[] = []
  private static readonly allowedValuesOnly: DataFormat[] = [DataFormat.AllowedValues]

  private static readonly validDataFormatsPerDKind: Dictionary<DKind, DataFormat[]> = new Dictionary([
    [DKind.Number, this.allowedValuesOnly],
    [DKind.String, [DataFormat.AllowedValues, DataFormat.Email, DataFormat.Multiline, DataFormat.Phone]],
    [DKind.Record, [DataFormat.Lookup]],
    [DKind.Table, [DataFormat.Lookup]],
    [DKind.Attachment, [DataFormat.Attachment]],
    [DKind.OptionSetValue, [DataFormat.Lookup]],
  ])

  public static getValidDataFormats(dkind: DKind) {
    const validFormats = []
    return this.validDataFormatsPerDKind.get(dkind) || this.noValidFormt
  }
}
