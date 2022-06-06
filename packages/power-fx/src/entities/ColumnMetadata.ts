import { DataFormat } from '../app/DataFormat'
import { DType } from '../types/DType'
import { AllowedValuesMetadata } from './AllowedValuesMetadata'
import { IExternalColumnMetadata } from './external/IExternalColumnMetadata'

export enum ColumnVisibility {
  Default = 0,
  Hidden = 1,
  Advanced = 2,
  Important = 3,
  Internal = 4,
}

export enum ColumnCreationKind {
  UserProvided = 0,
  ServerGenerated = 1,
}

export class ColumnLookupMetadata {
  readonly isSearchable: boolean
  readonly isSearchRequired: boolean
  constructor(isSearchable: boolean, isSearchRequired: boolean) {
    this.isSearchable = isSearchable
    this.isSearchRequired = isSearchRequired
  }
}

export class ColumnAttachmentMetadata {
  readonly listFunctionName: string
  readonly getFunctionName: string
  readonly createFunctionName: string
  readonly deleteFunctionName: string

  constructor(
    listFunctionName: string,
    getFunctionName: string,
    createFunctionName: string,
    deleteFunctionName: string,
  ) {
    // Contracts.AssertNonEmpty(listFunctionName)
    // Contracts.AssertNonEmpty(getFunctionName)
    // Contracts.AssertNonEmpty(createFunctionName)
    // Contracts.AssertNonEmpty(deleteFunctionName)

    this.listFunctionName = listFunctionName
    this.getFunctionName = getFunctionName
    this.createFunctionName = createFunctionName
    this.deleteFunctionName = deleteFunctionName
  }
}

/// <summary>
/// Implements logic for describing metadata about a datasource column.
/// </summary>
export class ColumnMetadata implements IExternalColumnMetadata {
  private readonly _kind: ColumnCreationKind
  private readonly _visibility: ColumnVisibility

  public name: string
  public type: DType
  public dataFormat?: DataFormat
  public displayName: string
  public isReadOnly: boolean
  public isKey: boolean
  public isRequired: boolean
  public get isHidden() {
    return this._visibility === ColumnVisibility.Hidden || this._visibility === ColumnVisibility.Internal
  }
  public get isServerGenerated() {
    return this._kind === ColumnCreationKind.ServerGenerated
  }
  public allowedValues: AllowedValuesMetadata
  public titleColumnName: string
  public subtitleColumnName: string
  public thumbnailColumnName: string
  public lookupMetadata: ColumnLookupMetadata
  public attachmentMetadata: ColumnAttachmentMetadata

  constructor(
    name: string,
    schema: DType,
    dataFormat: DataFormat | undefined,
    displayName: string,
    isReadOnly: boolean,
    isKey: boolean,
    isRequired: boolean,
    creationKind: ColumnCreationKind,
    visibility: ColumnVisibility,
    titleColumnName: string,
    subtitleColumnName: string,
    thumbnailColumnName: string,
    lookupMetadata?: ColumnLookupMetadata,
    attachmentMetadata?: ColumnAttachmentMetadata,
  ) {
    this.name = name
    this.type = schema
    this.dataFormat = dataFormat
    this.displayName = displayName
    this.isReadOnly = isReadOnly
    this.isKey = isKey
    this.isRequired = isRequired
    this._kind = creationKind
    this._visibility = visibility
    this.titleColumnName = titleColumnName
    this.subtitleColumnName = subtitleColumnName
    this.thumbnailColumnName = thumbnailColumnName
    this.lookupMetadata = lookupMetadata
    this.attachmentMetadata = attachmentMetadata

    if (dataFormat == DataFormat.AllowedValues) {
      this.allowedValues = AllowedValuesMetadata.CreateForValue(schema)
    }
  }
}
