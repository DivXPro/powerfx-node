import { IDataColumnMetadata } from '../entities/IDataColumnMetadata'
import { IExternalOptionSet } from '../entities/external/IExternalOptionSet'
import { IDataEntityMetadata } from '../functions/delegation/IDataEntityMetadata'
import { IDelegationMetadata } from '../functions/delegation/IDelegationMetadata'
import { IExternalTabularDataSource } from '../entities/external/IExternalTabularDataSource'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { EquatableObject } from '../utils/EquatableObject'
import { Hashing } from '../utils/Hash'
import { Lazy } from '../utils/Lazy'
import { RedBlackNode } from '../utils/RedBlackTree'
import { KeyValuePair } from '../utils/types'
import { DKind } from './DKind'
import { IExpandInfo } from './IExpandInfo'
import { IPolymorphicInfo } from './IPolymorphicInfo'
import { TypedName } from './TypedName'
import { TypeTree } from './TypeTree'
import { ValueTree } from './ValueTree'
import { IExternalViewInfo } from '../entities/external/IExternalViewInfo'
import { StringBuilder } from '../utils/StringBuilder'
import { isNullOrEmpty } from '../utils/CharacterUtils'
import TexlLexer from '../lexer/TexlLexer'
import { IExternalControlType, IsIExternalControlType } from './IExternalControlType'
import { FieldNameKind } from './FieldNameKind'
import { TexlNode } from '../syntax'
import { DocumentErrorSeverity } from '../errors'
import { IErrorContainer } from '../app/errorContainers/IErrorContainer'
import { TexlStrings } from '../localization'
import { StringDistanceComparer } from './StringDistanceComparer'
import { DTypeSpecParser } from './DTypeSpecParser'
import { DTypeSpecLexer } from './DTypeSpecLexer'
import { DateTimeExtensions } from '../utils/DateTimeExtensions'
import { DisplayNameProvider } from '../public/displayNames/DisplayNameProvider'
import { DisabledDisplayNameProvider } from '../public/displayNames'
import { IFlowInfo } from './IFlowInfo'

export interface IDTypeProps {
  typeTree?: TypeTree
  enumSuperKind?: DKind
  valueTree?: ValueTree
  expandInfo?: IExpandInfo
  flowInfo?: IFlowInfo
  polymorphicInfo?: IPolymorphicInfo
  metadata?: IDataColumnMetadata
  associatedDataSources?: Set<IExternalTabularDataSource>
  optionSetInfo?: IExternalOptionSet
  viewInfo?: IExternalViewInfo
  namedValueKind?: string
  attachmentType?: DType
  displayNameProvider?: DisplayNameProvider
  isFile?: boolean
  isLargeImage?: boolean
}

export class DType {
  public areFieldsOptional: boolean
  public static readonly EnumPrefix: string = '%'
  public static readonly MetaFieldName: string = 'meta-6de62757-ecb6-4be6-bb85-349b3c7938a9'

  public static Unknown = new DType(DKind.Unknown)

  public static Boolean = new DType(DKind.Boolean)

  public static Number = new DType(DKind.Number)

  public static String = new DType(DKind.String)

  public static DateTimeNoTimeZone = new DType(DKind.DateTimeNoTimeZone)

  public static DateTime = new DType(DKind.DateTime)

  public static Date = new DType(DKind.Date)

  public static Time = new DType(DKind.Time)

  public static Hyperlink = new DType(DKind.Hyperlink)

  public static Currency = new DType(DKind.Currency)

  public static Image = new DType(DKind.Image)

  public static PenImage = new DType(DKind.PenImage)

  public static Media = new DType(DKind.Media)

  public static Color = new DType(DKind.Color)

  public static Blob = new DType(DKind.Blob)

  public static Guid = new DType(DKind.Guid)

  public static OptionSet = new DType(DKind.OptionSet)

  public static OptionSetValue = new DType(DKind.OptionSetValue)

  public static ObjNull = new DType(DKind.ObjNull)

  public static Error = new DType(DKind.Error)

  public static EmptyRecord = new DType(DKind.Record)

  public static EmptyTable = new DType(DKind.Table)

  public static EmptyEnum = DType.MakeDTypeForEnum(DKind.Unknown, null)

  public static Polymorphic = new DType(DKind.Polymorphic)

  public static View = new DType(DKind.View)

  public static ViewValue = new DType(DKind.ViewValue)

  public static NamedValue = new DType(DKind.NamedValue)

  public static Control = new DType(DKind.Control)

  public static Form = new DType(DKind.Form)

  public static MinimalLargeImage = DType.CreateMinimalLargeImageType()

  public static UntypedObject = new DType(DKind.UntypedObject)

  public static Invalid = new DType(DKind.Invalid)

  // public static *GetPrimitiveTypes() {
  //   yield DType.Boolean
  //   yield DType.Number
  //   yield DType.String
  //   yield DType.DateTimeNoTimeZone
  //   yield DType.DateTime
  //   yield DType.Date
  //   yield DType.Time
  //   yield DType.Hyperlink
  //   yield DType.Currency
  //   yield DType.Image
  //   yield DType.PenImage
  //   yield DType.Media
  //   yield DType.Color
  //   yield DType.Blob
  // }

  private static readonly _kindToSuperkindMapping = new Lazy(
    () =>
      new Map<DKind, DKind>([
        [DKind.DateTimeNoTimeZone, DKind.DateTime],
        [DKind.Date, DKind.DateTime],
        [DKind.Time, DKind.DateTime],
        [DKind.Image, DKind.Hyperlink],
        [DKind.Media, DKind.Hyperlink],
        [DKind.Blob, DKind.Hyperlink],
        [DKind.PenImage, DKind.Image],
        [DKind.Boolean, DKind.Error],
        [DKind.Number, DKind.Error],
        [DKind.String, DKind.Error],
        [DKind.DateTime, DKind.Error],
        [DKind.Hyperlink, DKind.String],
        [DKind.Guid, DKind.Error],
        [DKind.Currency, DKind.Number],
        [DKind.Color, DKind.Error],
        [DKind.Form, DKind.Control],
        [DKind.Control, DKind.Error],
        [DKind.DataEntity, DKind.Error],
        [DKind.Metadata, DKind.Error],
        [DKind.Attachment, DKind.Error],
        [DKind.File, DKind.Error],
        [DKind.LargeImage, DKind.Error],
        [DKind.OptionSet, DKind.Error],
        [DKind.OptionSetValue, DKind.Error],
        [DKind.Polymorphic, DKind.Error],
        [DKind.Record, DKind.Error],
        [DKind.Table, DKind.Error],
        [DKind.ObjNull, DKind.Error],
        [DKind.View, DKind.Error],
        [DKind.ViewValue, DKind.Error],
        [DKind.NamedValue, DKind.Error],
        [DKind.Flow, DKind.Error],
        [DKind.UntypedObject, DKind.Error],
      ]),
  )

  public static get KindToSuperkindMapping() {
    return DType._kindToSuperkindMapping.value
  }

  public typeTree: TypeTree

  // This is only used by attachment type. DocumentDataType is used to workaround the issue of having cycles in struct type.
  public enumSuperKind: DKind
  public valueTree: ValueTree

  // This is only used by attachment type. DocumentDataType is used to workaround the issue of having cycles in struct type.
  protected readonly _attachmentType?: DType
  public associatedDataSources: Set<IExternalTabularDataSource>
  public optionSetInfo: IExternalOptionSet
  public viewInfo: IExternalViewInfo

  // Eventually, all display names should come from this centralized source
  // We should not be using individual DataSource/OptionSet/View references
  public displayNameProvider: DisplayNameProvider

  /// <summary>
  /// NamedValueKind is used only for values of kind NamedValue
  /// It is a restriction on what variety of named value it actually is
  /// Semantically, NamedValues of a given kind only interact with other ones of the same Kind
  /// undefined for non-named value DTypes
  /// </summary>
  public namedValueKind?: string

  public kind: DKind

  private readonly _isFile?: boolean
  public get isFile() {
    return this._isFile || this.kind == DKind.File
  }

  private readonly _isLargeImage?: boolean

  public get isLargeImage() {
    return this._isLargeImage || this.kind == DKind.LargeImage
  }

  private _isActivityPointer?: boolean

  public get isActivityPointer() {
    if (this._isActivityPointer != undefined) {
      return this._isActivityPointer
    }
    const result = this.tryGetType(new DName('activity_pointer_fax'))
    this._isActivityPointer = this.isRecord && result[1].equals(DType.Invalid)
    return this._isActivityPointer
  }

  public expandInfo?: IExpandInfo
  public flowInfo?: IFlowInfo
  public polymorphicInfo?: IPolymorphicInfo
  public metadata?: IDataColumnMetadata

  public get attachmentType() {
    return this._attachmentType
  }
  public get hasExpandInfo() {
    return this.expandInfo != undefined
  }
  public get hasPolymorphicInfo() {
    return this.polymorphicInfo != undefined
  }

  public get childCount() {
    if (this.isAggregate) {
      return this.typeTree.count
    }
    return 0
  }

  public get isNamedValue() {
    return this.kind == DKind.NamedValue
  }

  public isNamedValueOfKind(kind: string) {
    return this.kind == DKind.NamedValue && this.namedValueKind == kind
  }

  // REVIEW ragru: investigate how we can compute this on construction.
  public get maxDepth(): number {
    return this.isAggregate
      ? 1 + (this.childCount === 0 ? 0 : Math.max(...this.getNames(DPath.Root).map((tn) => tn.type.maxDepth)))
      : 0
  }

  public get hasErrors(): boolean {
    return this.isAggregate
      ? this.getNames(DPath.Root).some((tn) => tn.type.isError || tn.type.hasErrors)
      : this.isError
  }

  /// <summary>
  ///  Whether this type is a subtype of all possible types, meaning that it can be placed in
  ///  any location without coercion.
  /// </summary>
  public get isUniversal() {
    return this.kind == DKind.Error || this.kind == DKind.ObjNull
  }
  public get isValid() {
    return DKind._Min <= this.kind && this.kind < DKind._Lim
  }
  public get isUnknown() {
    return this.kind == DKind.Unknown
  }
  public get isError() {
    return this.kind === DKind.Error
  }
  public get isRecord() {
    return this.kind == DKind.Record || this.kind == DKind.ObjNull
  }
  public get isTable() {
    return this.kind == DKind.Table || this.kind == DKind.ObjNull
  }
  public get isEnum() {
    return this.kind == DKind.Enum || this.kind == DKind.ObjNull
  }
  public get isColumn() {
    return this.isTable && this.childCount == 1
  }
  public get isControl() {
    return this.kind == DKind.Control
  }
  public get isExpandEntity() {
    return this.kind == DKind.DataEntity
  }
  public get isMetadata() {
    return this.kind == DKind.Metadata
  }
  public get isAttachment() {
    return this.kind == DKind.Attachment
  }
  public get isPolymorphic() {
    return this.kind == DKind.Polymorphic
  }
  public get isOptionSet() {
    return this.kind == DKind.OptionSet || this.kind == DKind.OptionSetValue
  }
  public get isView() {
    return this.kind == DKind.View || this.kind == DKind.ViewValue
  }
  public get isAggregate() {
    return this.kind === DKind.Table || this.kind === DKind.Record || this.kind === DKind.ObjNull
  }
  public get isPrimitive() {
    return (DKind._MinPrimitive <= this.kind && this.kind < DKind._LimPrimitive) || this.kind == DKind.ObjNull
  }
  public get isForm() {
    return this.kind == DKind.Form
  }
  public get isFlow() {
    return this.kind == DKind.Flow
  }

  public get isUntypedObject() {
    return this.kind === DKind.UntypedObject
  }

  constructor(kind: DKind, props?: IDTypeProps) {
    // Contracts.Assert(DKind._Min <= kind && kind < DKind._Lim);
    this.kind = kind
    this.typeTree = props?.typeTree || new TypeTree()
    this.enumSuperKind = props?.enumSuperKind || DKind.Invalid
    this.valueTree = props?.valueTree || new ValueTree()
    this.flowInfo = props?.flowInfo
    this.expandInfo = props?.expandInfo
    this.polymorphicInfo = props?.polymorphicInfo
    this.metadata = props?.metadata
    this.associatedDataSources = props?.associatedDataSources || new Set<IExternalTabularDataSource>()
    this.optionSetInfo = props?.optionSetInfo
    this.namedValueKind = props?.namedValueKind
    this.displayNameProvider = props?.displayNameProvider
    this._attachmentType = props?.attachmentType
    this._isFile = props?.isFile
    this._isLargeImage = props?.isLargeImage
    // AssertValid();
  }

  // Constructor for aggregate types (record, table)
  public static MakeDTypeForAggregate(kind: DKind, tree: TypeTree, isFile = false, isLargeImage = false) {
    // Contracts.Assert(DKind._Min <= kind && kind < DKind._Lim);
    // tree.AssertValid();
    // Contracts.Assert(tree.IsEmpty || kind == DKind.Table || kind == DKind.Record);
    const props: IDTypeProps = {
      typeTree: tree,
      enumSuperKind: DKind.Invalid,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
      isFile,
      isLargeImage,
    }
    return new DType(kind, props)
  }

  // Constructor for enum types
  public static MakeDTypeForEnum(superkind: DKind, enumTree: ValueTree) {
    //   Contracts.Assert(DKind._Min <= superkind && superkind < DKind._Lim);
    const props: IDTypeProps = {
      typeTree: undefined,
      enumSuperKind: superkind,
      valueTree: enumTree,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(DKind.Enum, props)
  }

  // Constructor for control types
  public static MakeDTypeForControl(outputTypeTree: TypeTree) {
    // outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(DKind.Control, props)
  }

  // Constructor for Entity types
  public static MakeDTypeForEntity(
    kind: DKind,
    info: IExpandInfo,
    outputTypeTree: TypeTree,
    associatedDataSources?: Set<IExternalTabularDataSource>,
  ) {
    //   Contracts.AssertValue(info);
    //   outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: info,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: associatedDataSources || new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for Form types
  public static MakeDTypeForForm(outputTypeTree: TypeTree) {
    // outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: undefined,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(DKind.Form, props)
  }

  // Constructor for Flow types
  public static MakeDTypeForFlow(kind: DKind, flowInfo: IFlowInfo) {
    return new DType(kind, {
      enumSuperKind: DKind.Invalid as unknown as DKind,
      flowInfo,
    })
  }

  // Constructor for Polymorphic types
  private static MakeDTypeForPolymorphic(
    kind: DKind,
    info: IPolymorphicInfo,
    outputTypeTree: TypeTree,
    associatedDataSources?: Set<IExternalTabularDataSource>,
  ) {
    //   Contracts.AssertValue(info);
    //   outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: info,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: associatedDataSources || new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for Metadata type
  private static MakeDTypeForMetadata(kind: DKind, metadata: IDataColumnMetadata, outputTypeTree: TypeTree) {
    //   Contracts.Assert(kind == DKind.Metadata);
    //   Contracts.AssertValue(metadata);
    //   outputTypeTree.AssertValid();

    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: metadata.isExpandEntity ? metadata.type.expandInfo : undefined,
      polymorphicInfo: undefined,
      metadata,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for Attachment or File or large image type
  private static MakeDTypeForAttachment(kind: DKind, complexType: DType) {
    //   Contracts.AssertValid(complexType);
    //   Contracts.Assert(kind == DKind.Attachment || kind == DKind.File || kind == DKind.LargeImage);

    const props: IDTypeProps = {
      typeTree: complexType.typeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: kind == DKind.Attachment ? complexType : undefined,
      isFile: kind === DKind.File,
      isLargeImage: kind === DKind.LargeImage,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for OptionSet type
  private static MakeDTypeForOptionSet(kind: DKind, outputTypeTree: TypeTree, info: IExternalOptionSet) {
    //   Contracts.Assert(kind == DKind.OptionSet);
    //   Contracts.AssertValue(info);
    //   outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: info,
      viewInfo: undefined,
      namedValueKind: undefined,
      displayNameProvider: info.displayNameProvider,
    }
    return new DType(kind, props)
  }

  // Constructor for OptionSetValue type
  private static MakeDTypeForOptionSetValue(kind: DKind, info: IExternalOptionSet) {
    // Contracts.Assert(kind == DKind.OptionSetValue);
    // Contracts.AssertValue(info);

    const props: IDTypeProps = {
      typeTree: undefined,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: info,
      viewInfo: undefined,
      namedValueKind: undefined,
      displayNameProvider: info.displayNameProvider,
    }
    return new DType(kind, props)
  }

  // Constructor for View type
  private static MakeDTypeForView(kind: DKind, outputTypeTree: TypeTree, info: IExternalViewInfo) {
    //   Contracts.Assert(kind == DKind.View);
    //   Contracts.AssertValue(info);
    //   outputTypeTree.AssertValid();
    const props: IDTypeProps = {
      typeTree: outputTypeTree,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: info,
      namedValueKind: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for ViewValue type
  private static MakeDTypeForViewValue(kind: DKind, info: IExternalViewInfo) {
    //   Contracts.Assert(kind == DKind.ViewValue);
    //   Contracts.AssertValue(info);
    const props: IDTypeProps = {
      typeTree: undefined,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: info,
      namedValueKind: undefined,
    }
    return new DType(kind, props)
  }

  // Constructor for NamedValue type
  private static MakeDTypeForNamedValue(kind: DKind, namedValueKind: string) {
    //   Contracts.Assert(kind == DKind.NamedValue);
    //   Contracts.AssertNonEmptyOrundefined(namedValueKind);
    const props: IDTypeProps = {
      typeTree: undefined,
      enumSuperKind: DKind.Invalid as unknown as DKind,
      valueTree: null,
      expandInfo: undefined,
      polymorphicInfo: undefined,
      metadata: undefined,
      attachmentType: undefined,
      associatedDataSources: new Set<IExternalTabularDataSource>(),
      optionSetInfo: undefined,
      viewInfo: undefined,
      namedValueKind: namedValueKind,
    }
    return new DType(kind, props)
  }

  public clone(): DType {
    // AssertValid()
    return new DType(this.kind, {
      typeTree: this.typeTree,
      enumSuperKind: this.enumSuperKind,
      valueTree: this.valueTree,
      expandInfo: this.expandInfo,
      polymorphicInfo: this.polymorphicInfo,
      metadata: this.metadata,
      attachmentType: this.attachmentType,
      isFile: this.isFile,
      isLargeImage: this.isLargeImage,
      associatedDataSources: new Set<IExternalTabularDataSource>(this.associatedDataSources),
      optionSetInfo: this.optionSetInfo,
      viewInfo: this.viewInfo,
      namedValueKind: this.namedValueKind,
    })
  }

  public contains(field: DName | DPath): boolean {
    // Contracts.AssertValid(field);

    if (field instanceof DName) {
      return this.isAggregate && this.typeTree.contains(field.toString())
    }
    return this.isAggregate && this.tryGetTypeByPath(field)[0]
  }

  public static AttachDataSourceInfo(
    type: DType,
    dsInfo: IExternalTabularDataSource,
    attachToNestedType = true,
  ): DType {
    // type.AssertValid();
    // Contracts.AssertValue(dsInfo);

    let returnType = type.clone()
    returnType.associatedDataSources.add(dsInfo)

    if (!attachToNestedType) return returnType

    let fError: boolean = false
    returnType.getNames(DPath.Root).forEach((typedName) => {
      const result = returnType.setType(
        fError,
        DPath.Root.append(typedName.name),
        DType.AttachDataSourceInfo(typedName.type, dsInfo, false),
        true,
      )
      returnType = result[0]
      fError = result[1]
    })
    return returnType
  }

  /// <summary>
  /// This should only be used when constructing DTypes from the public surface to replace an existing display name provider.
  /// </summary>
  public static ReplaceDisplayNameProvider(type: DType, displayNames: DisplayNameProvider): DType {
    // type.AssertValid();
    // Contracts.AssertValue(displayNames);

    const returnType = type.clone()
    returnType.displayNameProvider = displayNames
    return returnType
  }

  /// <summary>
  /// This should be used by internal operations to update the set of display name providers associated with a type, i.e. during Union operations.
  /// Display name providers are disabled if there's a conflict with an existing provider.
  /// </summary>
  public static AttachOrDisableDisplayNameProvider(type: DType, displayNames: DisplayNameProvider): DType {
    // type.AssertValid()
    // Contracts.AssertValue(displayNames)

    const returnType = type.clone()
    if (returnType.displayNameProvider == null) {
      returnType.displayNameProvider = displayNames
    } else if (type.displayNameProvider != displayNames) {
      returnType.displayNameProvider = DisabledDisplayNameProvider.Instance
    }
    return returnType
  }

  public expandEntityType(expandedType: DType, associatedDatasources: Set<IExternalTabularDataSource>) {
    // Contracts.AssertValid(expandedType);
    // Contracts.Assert(HasExpandInfo);

    // expandedType is always a table as that's what runtime registers it.
    // But EntityInfo.IsTable defines whether it's a table or record.
    if (!this.expandInfo.isTable && expandedType.isTable) {
      expandedType = expandedType.toRecord()
    }
    //   Contracts.AssertValid(expandedType);
    return DType.MakeDTypeForEntity(
      expandedType.kind,
      this.expandInfo.clone(),
      expandedType.typeTree,
      associatedDatasources,
    )
  }

  public expandPolymorphic(expandedType: DType, expandInfo: IExpandInfo) {
    //   Contracts.AssertValid(expandedType);
    //   Contracts.AssertValue(expandInfo);
    //   Contracts.Assert(HasPolymorphicInfo);

    if (!this.polymorphicInfo.isTable && expandedType.isTable) {
      expandedType = expandedType.toRecord()
    }

    // Contracts.AssertValid(expandedType);
    return DType.MakeDTypeForEntity(
      expandedType.kind,
      expandInfo,
      expandedType.typeTree,
      expandedType.associatedDataSources,
    )
  }

  // Use for keeping Entity Info in expando properties
  public static CopyExpandInfo(to: DType, from: DType) {
    //   Contracts.AssertValid(to);
    //   Contracts.AssertValid(from);
    //   Contracts.Assert(from.HasExpandInfo);

    return DType.MakeDTypeForEntity(to.kind, from.expandInfo.clone(), to.typeTree, to.associatedDataSources)
  }

  public static CreateRecord(...typedNames: TypedName[]) {
    return DType.CreateRecordOrTable(DKind.Record, typedNames)
  }

  //   public static CreateRecord(typedNames: IEnumerable<TypedName>)
  //   {
  //     return CreateRecordOrTable(DKind.Record, typedNames);
  //   }

  public static CreateTable(...typedNames: TypedName[]) {
    return DType.CreateRecordOrTable(DKind.Table, typedNames)
  }

  //   public static CreateTable(typedNames: Array<TypedName>)
  //   {
  //     return CreateRecordOrTable(DKind.Table, typedNames);
  //   }

  public static CreateFile(...typedNames: TypedName[]) {
    return DType.CreateRecordOrTable(DKind.Record, typedNames, true)
  }

  public static CreateLargeImage(...typedNames: TypedName[]) {
    return DType.CreateRecordOrTable(DKind.Record, typedNames, false, true)
  }

  private static CreateRecordOrTable(kind: DKind, typedNames: Array<TypedName>, isFile = false, isLargeImage = false) {
    //   Contracts.Assert(kind == DKind.Record || kind == DKind.Table);
    //   Contracts.AssertValue(typedNames);

    return DType.MakeDTypeForAggregate(
      kind,
      TypeTree.Create(typedNames.map(DType.TypedNameToKVP)),
      isFile,
      isLargeImage,
    )
  }

  public static CreateExpandType(info: IExpandInfo) {
    //   Contracts.AssertValue(info);

    return DType.MakeDTypeForEntity(DKind.DataEntity, info, DType.Unknown.typeTree)
  }

  public static CreatePolymorphicType(info: IPolymorphicInfo) {
    //   Contracts.AssertValue(info);

    return DType.MakeDTypeForPolymorphic(DKind.Polymorphic, info, DType.Unknown.typeTree)
  }

  public static CreateMetadataType(metadata: IDataColumnMetadata) {
    //   Contracts.AssertValue(metadata);

    return DType.MakeDTypeForMetadata(DKind.Metadata, metadata, DType.Unknown.typeTree)
  }

  public static CreateAttachmentType(attachmentType: DType) {
    //   Contracts.AssertValid(attachmentType);

    return DType.MakeDTypeForAttachment(DKind.Attachment, attachmentType)
  }

  public static CreateFileType(fileType: DType) {
    //   Contracts.AssertValid(fileType);

    return DType.MakeDTypeForAttachment(DKind.File, fileType)
  }

  public static CreateLargeImageType(imageType: DType) {
    //   Contracts.AssertValid(imageType);

    return DType.MakeDTypeForAttachment(DKind.LargeImage, imageType)
  }

  public static CreateOptionSetType(info: IExternalOptionSet) {
    //   Contracts.AssertValue(info);

    const typedNames: TypedName[] = []
    for (const name of info.optionNames) {
      const type = new DType(DKind.OptionSetValue, info)
      typedNames.push(new TypedName(type, name))
    }
    return DType.MakeDTypeForOptionSet(DKind.OptionSet, TypeTree.Create(typedNames.map(DType.TypedNameToKVP)), info)
  }

  public static CreateViewType(info: IExternalViewInfo) {
    //   Contracts.AssertValue(info);

    const typedNames: TypedName[] = []
    info.displayNameMapping.getEnumerator().forEach((key, value) => {
      const type = new DType(DKind.OptionSetValue, { viewInfo: info })
      typedNames.push(new TypedName(type, new DName(key.toString())))
    })
    return DType.MakeDTypeForView(DKind.View, TypeTree.Create(typedNames.map(DType.TypedNameToKVP)), info)
  }

  public static CreateNamedValueType(namedValueKind: string) {
    //   Contracts.AssertNonEmptyOrundefined(namedValueKind);

    return DType.MakeDTypeForNamedValue(DKind.NamedValue, namedValueKind)
  }

  public static CreateMinimalLargeImageType() {
    const minTypeTree: KeyValuePair<string, DType>[] = []
    minTypeTree.push({ key: 'Value', value: DType.Image })
    return DType.MakeDTypeForAggregate(DKind.Record, TypeTree.Create(minTypeTree))
  }

  public static CreateOptionSetValueType(info: IExternalOptionSet) {
    return DType.MakeDTypeForOptionSetValue(DKind.OptionSetValue, info)
  }

  public static CreateViewValue(info: IExternalViewInfo) {
    return DType.MakeDTypeForViewValue(DKind.ViewValue, info)
  }

  private static TypedNameToKVP(typedName: TypedName): KeyValuePair<string, DType> {
    //   Contracts.Assert(typedName.IsValid);
    return { key: typedName.name.toString(), value: typedName.type }
  }

  public static CreateEnum(supertype: DType, data: ValueTree | KeyValuePair<DName, object>[]) {
    //   Contracts.Assert(supertype.IsValid);
    //   Contracts.AssertValue(pairs);
    if (data instanceof ValueTree) {
      return DType.MakeDTypeForEnum(supertype.kind, data)
    }
    return new DType(supertype.kind, { valueTree: ValueTree.Create(data.map(DType.NamedObjectToKVP)) })
  }

  private static NamedObjectToKVP(pair: KeyValuePair<DName, any>): KeyValuePair<string, EquatableObject> {
    //   Contracts.Assert(pair.Key.IsValid);
    //   Contracts.AssertValue(pair.Value);

    // Coercing all numerics to double to avoid mismatches between 1.0 vs. 1, and such.
    return { key: pair.key.getValue(), value: new EquatableObject(pair.value) }
    //   return new KeyValuePair<string, EquatableObject>(pair.Key.Value, new EquatableObject(value));
  }

  /// <summary>
  /// Get the string form representation for the Kind to be displayed in the UI.
  /// </summary>
  /// <returns>String representation of DType.Kind</returns>
  public getKindString() {
    if (this.kind == DKind._MinPrimitive) return 'Boolean'

    if (this.kind == DKind.String) return 'Text'

    if (this.kind == DKind._LimPrimitive) return 'Control'

    // return this.kind.toString()
    return DKind[this.kind]
  }

  public toRecord(): DType {
    //   AssertValid();
    switch (this.kind) {
      case DKind.Record:
        return this
      case DKind.Table:
      case DKind.Control:
      case DKind.DataEntity:
        if (this.expandInfo != undefined)
          return new DType(DKind.Record, { expandInfo: this.expandInfo, typeTree: this.typeTree })
        else
          return new DType(DKind.Record, {
            typeTree: this.typeTree,
            associatedDataSources: this.associatedDataSources,
            displayNameProvider: this.displayNameProvider,
          })
      case DKind.ObjNull:
        return DType.EmptyRecord
      default:
        //   Contracts.Assert(false, "Bad source kind for ToRecord");
        return DType.EmptyRecord
    }
  }

  // WARNING! This method is dangerous, for several reasons (below). Clients need to
  // rethink their strategy, and consider using the proper DType representation with
  // embedded "v" types instead, and dig into those types as needed for additional
  // control-specific information, such as property names.
  // Reasons this is bad:
  //  1. It is recursive, and will go as deep into a DType as needed to convert all nested
  //     controls to their corresponding record representations.
  //  2. It converts "v" (control) types to records, by picking certain property names as
  //     fields for those records. This operation is LOSSY. For example, only the locale-specific
  //     names are captured, not the invariant names (or vice versa).
  //  3. There is no way to recover the originating control or control template from the
  //     resulting type.
  public controlsToRecordsRecursive() {
    //   AssertValid();

    if (!this.isAggregate && !this.isControl) return this

    let result = this.isControl ? this.toRecord() : this

    result.getNames(DPath.Root).forEach((typedName) => {
      let fError = false
      if (typedName.type.isAggregate || typedName.type.isControl) {
        const rst = result.setType(
          fError,
          DPath.Root.append(typedName.name),
          typedName.type.controlsToRecordsRecursive(),
        )
        result = rst[0]
        fError = rst[1]
      }
    })
    return result
  }

  public getExpands() {
    //   AssertValid();

    const expands: IExpandInfo[] = []

    this.getNames(DPath.Root).forEach((typedName) => {
      if (typedName.type.isExpandEntity) {
        // expands.Add(typedName.Type.ExpandInfo.VerifyValue());
        expands.push(typedName.type.expandInfo)
      } else if (typedName.type.isPolymorphic && typedName.type.hasPolymorphicInfo) {
        typedName.type.polymorphicInfo.expands.forEach((expand) => {
          expands.push(expand)
        })
      }
    })
    return expands
  }

  public toRecordWithError(): [DType, boolean] {
    //   AssertValid();

    switch (this.kind) {
      case DKind.Record:
        return [this, false]
      case DKind.Table:
      case DKind.DataEntity:
      case DKind.Control:
        if (this.expandInfo != undefined)
          return [new DType(DKind.Record, { expandInfo: this.expandInfo, typeTree: this.typeTree }), false]
        else
          return [
            new DType(DKind.Record, { typeTree: this.typeTree, associatedDataSources: this.associatedDataSources }),
            false,
          ]
      case DKind.ObjNull:
        return [DType.EmptyRecord, false]
      default:
        return [DType.EmptyRecord, true]
    }
  }

  public toTable(): DType {
    //   AssertValid();

    switch (this.kind) {
      case DKind.Table:
        return this
      case DKind.Record:
      case DKind.DataEntity:
      case DKind.Control:
        if (this.expandInfo != undefined)
          return new DType(DKind.Table, { expandInfo: this.expandInfo, typeTree: this.typeTree })
        else
          return new DType(DKind.Table, {
            typeTree: this.typeTree,
            associatedDataSources: this.associatedDataSources,
            displayNameProvider: this.displayNameProvider,
          })
      case DKind.ObjNull:
        return DType.EmptyTable
      default:
        //   Contracts.Assert(false, "Bad source kind for ToTable");
        return DType.EmptyTable
    }
  }

  public toTableWithError(): [DType, boolean] {
    //   AssertValid();

    switch (this.kind) {
      case DKind.Table:
        return [this, false]
      case DKind.Record:
      case DKind.DataEntity:
      case DKind.Control:
        return [
          new DType(DKind.Table, {
            typeTree: this.typeTree,
            associatedDataSources: this.associatedDataSources,
            displayNameProvider: this.displayNameProvider,
          }),
          false,
        ]
      case DKind.ObjNull:
        return [DType.EmptyTable, false]
      default:
        return [DType.EmptyTable, true]
    }
  }

  // Get the underlying value associated with the specified enum value.
  public tryGetEnumValue(name: DName): [boolean, any] {
    //   AssertValid();

    if (!name.isValid || this.kind != DKind.Enum) {
      return [false, undefined]
    }

    const rst = this.valueTree.tryGetValue(name.getValue())
    return [rst[0], rst[1].object]
  }

  // The type this enum derives from.
  public getEnumSupertype() {
    //   AssertValid();
    //   Contracts.Assert(IsEnum);

    return new DType(this.enumSuperKind)
  }

  public tryGetEntityDelegationMetadata(): [boolean, IDelegationMetadata | undefined] {
    if (!this.hasExpandInfo) {
      //   metadata = undefined;
      return [false, undefined]
    }

    //   Contracts.CheckValue(ExpandInfo.ParentDataSource, nameof(ExpandInfo.ParentDataSource));
    //   Contracts.CheckValue(ExpandInfo.ParentDataSource.DataEntityMetadataProvider, nameof(ExpandInfo.ParentDataSource.DataEntityMetadataProvider));

    const metadataProvider = this.expandInfo.parentDataSource.dataEntityMetadataProvider
    const result = metadataProvider.tryGetEntityMetadata(this.expandInfo.identity)
    if (!result[0]) {
      //   metadata = undefined;
      return [false, undefined]
    }

    // Contracts.CheckValue(entityMetadata, nameof(entityMetadata));
    return [true, result[1].delegationMetadata]
  }

  // Get the type of the specified member field (name).
  // name.Value can be undefined
  public tryGetType(name: DName | DPath): [boolean, DType] {
    //   AssertValid();
    if (name instanceof DName) {
      if (!name.isValid) {
        return [false, DType.Invalid]
      }
      return this.tryGetTypeCore(name)
    } else if (name instanceof DPath) {
      const path = name
      return this.tryGetTypeByPath(path)
    }
  }

  // Get the type of the specified member field (name).
  public getType(name: DName) {
    //   AssertValid();
    //   Contracts.Assert(name.IsValid);

    //   DType type;
    //   Contracts.Verify(TryGetTypeCore(name, out type));
    return this.tryGetTypeCore(name)[1]
  }

  // Get the type of a member field specified by path.
  public getTypeByPath(path: DPath) {
    //   AssertValid();

    //   DType type;
    // Contracts.Verify(TryGetType(path, out type));
    return this.tryGetTypeByPath(path)
  }

  private tryGetTypeCore(name: DName): [boolean, DType] {
    //   AssertValid();
    //   Contracts.Assert(name.IsValid);

    switch (this.kind) {
      case DKind.Record:
      case DKind.Table:
      case DKind.OptionSet:
      case DKind.View:
      case DKind.Control:
        return this.typeTree.tryGetValue(name.value)
      case DKind.Enum:
        if (this.valueTree.contains(name.getValue())) {
          return [true, this.getEnumSupertype()]
        }
      default:
        return [false, DType.Invalid]
    }
  }

  // Get the type of a member field specified by path.
  public tryGetTypeByPath(path: DPath): [boolean, DType] {
    //   AssertValid();

    if (path.isRoot) {
      return [true, this]
    }

    let type: DType
    const result = this.tryGetTypeByPath(path.parent)
    type = result[1]
    if (type.isEnum) {
      return [true, type.getEnumSupertype()]
    }

    if (!type.isAggregate) {
      return [false, DType.Invalid]
    }

    switch (type.kind) {
      case DKind.Record:
      case DKind.Table:
      case DKind.OptionSet:
      case DKind.View:
        return type.typeTree.tryGetValue(path.name.toString())
      default:
        //   Contracts.Assert(false);
        return [false, type]
    }
  }

  // Return a new type based on this, with the member field (path) of a specified type.
  public setType(fError: boolean, path: DPath, type: DType, skipCompare = false): [DType, boolean] {
    //   AssertValid();
    //   type.AssertValid();
    for (; path.length > 0; path = path.parent) {
      let typeCur: DType
      const result = this.tryGetTypeByPath(path.parent)
      fError ||= !result[0]
      typeCur = result[1]
      if (!type.isAggregate) {
        fError = true
        return [this, fError]
      }
      let tree = typeCur.typeTree.setItem(path.name.toString(), type, skipCompare)
      type = new DType(typeCur.kind, {
        typeTree: tree,
        associatedDataSources: typeCur.associatedDataSources,
        displayNameProvider: typeCur.displayNameProvider,
      })

      if (typeCur.hasExpandInfo) {
        type = DType.CopyExpandInfo(type, typeCur)
      }
    }

    if (this.hasExpandInfo) {
      type = DType.CopyExpandInfo(type, this)
    }

    return [type, fError]
  }

  // Return a new type based on this, with an additional named member field of a specified type.
  public tryAdd(fError: boolean, path: DPath, name: DName, type: DType): [DType, boolean] {
    //   AssertValid();
    //   Contracts.Assert(name.IsValid);
    //   type.AssertValid();
    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= !result[0]
    typeOuter = result[1]
    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    //   Contracts.Assert(typeOuter.IsRecord || typeOuter.IsTable);

    let typeCur: DType
    const result2 = typeOuter.typeTree.tryGetValue(name.toString())
    typeCur = result2[1]
    if (result2[0]) {
      fError = true
    }

    let tree = typeOuter.typeTree.setItem(name.toString(), type)
    let updatedTypeOuter = new DType(typeOuter.kind, {
      typeTree: tree,
      associatedDataSources: this.associatedDataSources,
      displayNameProvider: this.displayNameProvider,
    })

    if (typeOuter.hasExpandInfo) {
      updatedTypeOuter = DType.CopyExpandInfo(updatedTypeOuter, typeOuter)
    }
    return this.setType(fError, path, updatedTypeOuter)
  }

  // Return a new type based on this, with an additional named member field (name) of a specified type.
  public add(typedName: TypedName): DType
  public add(name: DName, type: DType): DType
  public add(name: DName | TypedName, type?: DType): DType {
    //   AssertValid();
    //   Contracts.Assert(IsAggregate);
    //   Contracts.Assert(name.IsValid);
    //   type.AssertValid();

    //   Contracts.Assert(!TypeTree.Contains(name));
    if (name instanceof TypedName) {
      return this.addTypeName(name)
    }
    const tree = this.typeTree.setItem(name.toString(), type)
    const newType = new DType(this.kind, {
      typeTree: tree,
      associatedDataSources: this.associatedDataSources,
      displayNameProvider: this.displayNameProvider,
    })

    return newType
  }

  // Return a new type based on this, with an additional named member field of a specified type.
  public addTypeName(typedName: TypedName) {
    //   AssertValid();
    //   Contracts.Assert(IsAggregate);
    //   Contracts.Assert(typedName.IsValid);

    return this.add(typedName.name, typedName.type)
  }

  // Return a new type based on this, with additional named member fields of a specified type.
  public addMulti(fError: boolean, path: DPath, typedNames: TypedName[]): [DType, boolean] {
    //   AssertValid();
    //   Contracts.AssertValue(typedNames);
    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= !result[0]
    typeOuter = result[1]
    //   fError |= !TryGetType(path, out typeOuter);
    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    //   Contracts.Assert(typeOuter.IsRecord || typeOuter.IsTable);

    let tree = typeOuter.typeTree
    typedNames.forEach((tn) => {
      const rs = tree.tryGetValue(tn.name.toString())
      if (rs[0]) {
        fError = true
      }
      tree = tree.setItem(tn.name.toString(), tn.type)
    })
    typeOuter = new DType(typeOuter.kind, {
      typeTree: tree,
      associatedDataSources: this.associatedDataSources,
      displayNameProvider: this.displayNameProvider,
    })

    return this.setType(fError, path, typeOuter)
  }

  // Drop the specified name/field from path's type, and return the resulting type.
  public drop(fError: boolean, path: DPath, name: DName): [DType, boolean] {
    //   AssertValid();
    //   Contracts.Assert(name.IsValid);
    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= result[0]
    typeOuter = result[1]
    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    const rst = typeOuter.typeTree.removeItem(fError, name.toString())
    const tree = rst[0]
    fError = rst[1]
    if (fError) {
      return [this, fError]
    }
    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  // Drop fields of specified kind.
  public dropAllOfKind(fError: boolean, path: DPath, kind: DKind): [DType, boolean] {
    //   AssertValid();
    //   Contracts.Assert(DKind._Min <= kind && kind < DKind._Lim);

    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= !result[0]
    typeOuter = result[1]

    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    let tree = typeOuter.typeTree
    this.getNames(path).forEach((typedName) => {
      if (typedName.type.kind === kind) {
        const rst = tree.removeItem(fError, typedName.name.toString())
        tree = rst[0]
      }
    })

    if (TypeTree.Equals(tree, typeOuter.typeTree)) {
      fError = true
      return [this, fError]
    }

    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  public dropAllOfTableRelationships(fError: boolean, path: DPath): [DType, boolean] {
    //   AssertValid();

    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    typeOuter = result[1]
    fError ||= !result[0]

    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    let tree = typeOuter.typeTree
    this.getNames(path).forEach((typedName) => {
      if (typedName.type.kind === DKind.DataEntity && (typedName.type.expandInfo?.isTable || false)) {
        const rst = tree.removeItem(fError, typedName.name.toString())
        tree = rst[0]
        fError = rst[1]
      } else if (typedName.type.isAggregate) {
        const rst = typedName.type.dropAllOfTableRelationships(fError, DPath.Root)
        const typeInner = rst[0]
        fError = rst[1]
        if (fError) {
          return [this, fError]
        }
        if (!typeInner.typeTree.equals(tree)) {
          tree = tree.setItem(typedName.name.toString(), typeInner)
        }
      }
    })

    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  // Drop fields of specified kind from all nested types
  public dropAllOfKindNested(fError: boolean, path: DPath, kind: DKind): [DType, boolean] {
    //   AssertValid();
    //   Contracts.Assert(DKind._Min <= kind && kind < DKind._Lim);
    let typeOuter: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= !result[0]
    typeOuter = result[1]

    if (typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    let tree = typeOuter.typeTree
    this.getNames(path).forEach((typedName) => {
      if (typedName.type.kind === kind) {
        const rst = tree.removeItem(fError, typedName.name.toString())
        tree = rst[0]
        fError = rst[1]
      } else if (typedName.type.isAggregate) {
        const rst = typedName.type.dropAllOfKindNested(fError, DPath.Root, kind)
        const typeInner = rst[0]
        fError = rst[1]
        if (fError) {
          return [this, fError]
        }
        if (typeInner.typeTree.equals(tree)) {
          tree = tree.setItem(typedName.name.toString(), typeInner)
        }
      }
    })
    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  // Drop the specified names/fields from path's type, and return the resulting type.
  // Note that if some of the names/fields were missing, we are returning a new type with
  // as many fields removed as possible (and fError == true).
  public dropMulti(fError: boolean, path: DPath, ...rgname: DName[]): [DType, boolean] {
    //   AssertValid();
    //   Contracts.AssertNonEmpty(rgname);
    //   Contracts.AssertAllValid(rgname);

    let typeOuter: DType

    const result = this.tryGetTypeByPath(path)
    typeOuter = result[1]
    fError ||= !result[0]

    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }
    //   Contracts.Assert(typeOuter.IsRecord || typeOuter.IsTable);

    const result2 = typeOuter.typeTree.removeItems(fError, ...rgname)
    fError = result2[1]
    const tree = result2[0]

    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  // Drop everything but the specified names/fields from path's type, and return the resulting type.
  // If a name/field (that was specified to be kept) is missing, we are returning a new type
  // with the type for the missing field as Error and fError will be true.
  public keepMulti(fError: boolean, path: DPath, ...rgname: DName[]): [DType, boolean] {
    //   AssertValid();
    //   Contracts.AssertNonEmpty(rgname);
    //   Contracts.AssertAllValid(rgname);

    let typeOuter: DType

    const result = this.tryGetTypeByPath(path)
    typeOuter = result[1]
    fError ||= !result[0]

    if (!typeOuter.isAggregate) {
      fError = true
      return [this, fError]
    }

    let tree: TypeTree

    rgname.forEach((name) => {
      let typeCur: DType
      const rst = typeOuter.tryGetType(name)
      typeCur = rst[1]
      if (!rst[0]) {
        fError = true
        typeCur = DType.Error
      }
      tree = tree.setItem(name.toString(), typeCur)
    })

    return this.setType(
      fError,
      path,
      new DType(typeOuter.kind, {
        typeTree: tree,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      }),
    )
  }

  // If a name/field (that was specified to be split) is missing, we are returning a new type
  // with the type for the missing field as Error and fError will be true.
  public split(fError: boolean, ...rgname: DName[]): [DType, DType, boolean] {
    //   AssertValid();
    //   Contracts.AssertNonEmpty(rgname);
    //   Contracts.AssertAllValid(rgname);
    let typeRest: DType
    if (!this.isAggregate) {
      fError = true
      typeRest = DType.Error
      return [this, typeRest, fError]
    }

    // Contracts.Assert(IsRecord || IsTable);

    let treeRest = this.typeTree
    let treeWith: TypeTree

    rgname.forEach((name) => {
      let typeCur: DType
      const result = this.typeTree.tryGetValue(name.toString())
      if (result[0]) {
        typeCur = result[1]
        treeWith = treeWith.setItem(name.toString(), typeCur)
        const rst = treeRest.removeItem(fError, name.toString())
        treeRest = rst[0]
        fError = rst[1]
      } else {
        fError = true
        treeWith = treeWith.setItem(name.toString(), DType.Error)
      }

      typeRest = new DType(this.kind, {
        typeTree: treeRest,
        associatedDataSources: this.associatedDataSources,
        displayNameProvider: this.displayNameProvider,
      })
      return [
        new DType(this.kind, {
          typeTree: treeWith,
          associatedDataSources: this.associatedDataSources,
          displayNameProvider: this.displayNameProvider,
        }),
        fError,
      ]
    })
  }

  // Get ALL the fields/names at the specified path, including hidden meta fields
  // and other special fields.
  public getAllNames(path: DPath): TypedName[] {
    //   AssertValid();
    let fError = false
    const result = this.getAllNamesWithError(fError, path)
    return result[1]
  }

  public getNames(path: DPath) {
    return this.getAllNames(path).filter((kvp) => kvp.name.toString() != DType.MetaFieldName)
  }

  /// <summary>
  /// Returns true if type contains a entity type.
  /// </summary>
  public containsDataEntityType(path: DPath): boolean {
    //   AssertValid();
    //   Contracts.AssertValid(path);

    return this.getNames(path).some(
      (n) => n.type.isExpandEntity || (n.type.isAggregate && n.type.containsDataEntityType(DPath.Root)),
    )
  }

  /// <summary>
  /// Returns true if type contains an attachment type.
  /// </summary>
  public containsAttachmentType(path: DPath): boolean {
    //   AssertValid();
    //   Contracts.AssertValid(path);

    return this.getNames(path).some(
      (n) => n.type.isAttachment || (n.type.isAggregate && n.type.containsAttachmentType(DPath.Root)),
    )
  }

  /// <summary>
  /// Returns true if type contains an OptionSet type.
  /// </summary>
  /// <returns></returns>
  public isMultiSelectOptionSet(): boolean {
    if (this.typeTree.count != 1) return false

    const columnType = this.typeTree.getPairsArray()[0]
    return columnType.value.kind === DKind.OptionSetValue
  }

  // Get the fields/names at the specified path.
  private getAllNamesWithError(fError: boolean, path: DPath): [boolean, TypedName[]] {
    //   AssertValid();

    let type: DType
    const result = this.tryGetTypeByPath(path)
    fError ||= !result[0]
    type = result[1]
    if (!type.isAggregate && !type.isEnum) {
      fError = true
    }

    switch (type.kind) {
      case DKind.Record:
      case DKind.Table:
      case DKind.OptionSet:
      case DKind.View:
      case DKind.File:
      case DKind.LargeImage: {
        return [fError, type.typeTree?.getPairsArray().map((kvp) => new TypedName(kvp.value, new DName(kvp.key))) || []]
      }
      case DKind.Enum:
        const supertype = new DType(type.enumSuperKind)
        return [
          fError,
          type.valueTree?.getPairsArray().map((kvp) => new TypedName(supertype, new DName(kvp.key))) || [],
        ]
      default:
        return [fError, []]
    }
  }

  tryGetExpandedEntityType(): [boolean, DType] {
    const result = this.tryGetEntityDelegationMetadata()
    const metadata = result[1]
    if (!result[0]) {
      return [false, DType.Unknown]
    }
    return [true, this.expandEntityType(metadata.schema, metadata.schema.associatedDataSources)]
  }

  // For patching entities, we expand the type and drop entities and attachments for the purpose of comparison.
  // This allows entity types to be compared against values from Set/Collect/UpdateContext,
  // As those functions drop collections/attachments from the type, but at runtime do not change the data
  // The risk here is that the user could attempt to construct a record that matches the entity type but does not exit in the other table
  // This will cause an runtime error instead of being caught by our type system
  tryGetExpandedEntityTypeWithoutDataSourceSpecificColumns(): [boolean, DType] {
    let type: DType
    const result = this.tryGetExpandedEntityType()
    type = result[1]
    if (!result[0]) {
      return result
    }

    let fValid = true
    if (type.containsDataEntityType(DPath.Root)) {
      let fError = false
      const rst = type.dropAllOfKindNested(fError, DPath.Root, DKind.DataEntity)
      type = rst[0]
      fError = rst[1]
      fValid &&= !fError
    }

    if (type.containsAttachmentType(DPath.Root)) {
      let fError = false
      const rst = type.dropAllOfKindNested(fError, DPath.Root, DKind.Attachment)
      type = rst[0]
      fError = rst[1]
      fValid &&= !fError
    }

    if (!fValid) {
      type = DType.Unknown
    }
    return [fValid, type]
  }

  private acceptsEntityType(type: DType): boolean {
    //   Contracts.AssertValid(type);
    //   Contracts.Assert(Kind == DKind.DataEntity);

    switch (type.kind) {
      case DKind.DataEntity:
        //   Contracts.AssertValue(ExpandInfo);
        return type.expandInfo.identity === this.expandInfo.identity
      case DKind.Table:
      case DKind.Record:
        if (type.expandInfo != null && type.expandInfo.identity !== this.expandInfo.identity) {
          return false
        }
        const result = this.tryGetExpandedEntityType()
        const expandedEntityType = result[1]
        if (!result[0]) {
          return false
        }
        return expandedEntityType.accepts(type, true)
      default:
        return type.kind === DKind.Unknown
    }
  }

  private acceptsAttachmentType(type: DType) {
    //   Contracts.AssertValid(type);
    //   Contracts.Assert(Kind == DKind.Attachment);
    //   Contracts.AssertValue(_attachmentType);

    switch (type.kind) {
      case DKind.Attachment:
        return this._attachmentType.accepts(type.attachmentType, true)
      case DKind.Table:
      case DKind.Record:
        return this._attachmentType.accepts(type, true)
      default:
        return type.kind === DKind.Unknown
    }
  }

  /// <summary>
  /// Returns whether this type can accept a value of "type".
  /// For example, a table type can accept a table type containing extra fields.
  /// <br/> - type1.Accepts(type2) is the same as asking whether type2==type1 or type2 is a sub-type of type1.
  /// <br/> - Error accepts any type.
  /// <br/> - Any type accepts Unknown.
  /// <br/> If not in 'exact' mode (i.e. if exact=false), we permit downcasting as well; for
  /// example a table type will accept a table with less fields.
  /// </summary>
  /// <param name="type">
  /// Type of questionable acceptance
  /// </param>
  /// <param name="exact">
  /// Whether or not <see cref="this"/>'s absense of columns that are defined in <see cref="type"/>
  /// should affect acceptance.
  /// </param>
  /// <returns>
  /// True if <see cref="this"/> accepts <see cref="type"/>, false otherwise.
  /// </returns>
  public accepts(type: DType, exact = true, useLegacyDateTimeAccepts = false): boolean {
    return this.acceptsOut(type, exact, useLegacyDateTimeAccepts)[0]
  }

  /// <summary>
  /// Returns whether this type can accept a value of "type".
  /// For example, a table type can accept a table type containing extra fields.
  /// <br/> - type1.Accepts(type2) is the same as asking whether type2==type1 or type2 is a sub-type of type1.
  /// <br/> - Error accepts any type.
  /// <br/> - Any type accepts Unknown.
  /// <br/> If not in 'exact' mode (i.e. if exact=false), we permit downcasting as well; for
  /// example a table type will accept a table with less fields.
  /// </summary>
  /// <param name="type">
  /// Type of questionable acceptance
  /// </param>
  /// <param name="schemaDifference">
  /// Holds the expected type of a type mismatch as well as a field name if the mismatch is aggregate.
  /// If the mismatch is top level, the key of this kvp will be set to undefined.
  /// </param>
  /// <param name="schemaDifference">
  /// Holds the actual type of a type mismatch
  /// </param>
  /// <param name="exact">
  /// Whether or not <see cref="this"/>'s absense of columns that are defined in <see cref="type"/>
  /// should affect acceptance.
  /// </param>
  /// <returns>
  /// True if <see cref="this"/> accepts <see cref="type"/>, false otherwise.
  /// </returns>
  // public accepts2(type DType, out KeyValuePair<string, DType> schemaDifference, out DType schemaDifferenceType, bool exact = true, bool useLegacyDateTimeAccepts = false)
  public acceptsOut(
    type: DType,
    exact = true,
    useLegacyDateTimeAccepts = false,
  ): [boolean, { schemaDifference: KeyValuePair<string, DType>; schemaDifferenceType: DType }] {
    //   AssertValid();
    //   type.AssertValid();

    let schemaDifference = { key: undefined as string, value: DType.Invalid }
    let schemaDifferenceType = DType.Invalid

    // We accept ObjNull as any DType (but subtypes can override).
    if (type.kind == DKind.ObjNull) return [true, { schemaDifference, schemaDifferenceType }]

    const defaultReturnValue = (targetType: DType) =>
      targetType.kind == this.kind ||
      targetType.kind == DKind.Unknown ||
      (targetType.kind == DKind.Enum && this.accepts(targetType.getEnumSupertype()))

    let accepts: boolean
    switch (this.kind) {
      case DKind.Error:
        accepts = true
        break
      case DKind.Polymorphic:
        accepts = type.kind === DKind.Polymorphic || type.kind === DKind.Record || type.kind === DKind.Unknown
        break
      case DKind.Record:
      case DKind.File:
      case DKind.LargeImage:
        if (this.kind === type.kind) {
          const accResult = DType.TreeAccepts(this, this.typeTree, type.typeTree, exact, useLegacyDateTimeAccepts)
          schemaDifference = accResult[1].schemaDifference
          schemaDifferenceType = accResult[1].treeSrcSchemaDifferenceType
          return [accResult[0], { schemaDifference, schemaDifferenceType }]
        }
        accepts = type.kind === DKind.Unknown
        break
      case DKind.Table:
        if (this.kind == type.kind || type.isExpandEntity) {
          const accResult = DType.TreeAccepts(this, this.typeTree, type.typeTree, exact, useLegacyDateTimeAccepts)
          schemaDifference = accResult[1].schemaDifference
          schemaDifferenceType = accResult[1].treeSrcSchemaDifferenceType
          return [accResult[0], { schemaDifference, schemaDifferenceType }]
        }
        accepts = type.kind === DKind.Unknown
        break
      case DKind.Enum:
        accepts =
          (this.kind != type.kind && type.kind === DKind.Unknown) ||
          (this.enumSuperKind == type.enumSuperKind && DType.EnumTreeAccepts(this.valueTree, type.valueTree, exact))
        break
      case DKind.Unknown:
        accepts = type.kind == DKind.Unknown
        break

      case DKind.String:
        accepts =
          type.kind == this.kind ||
          type.kind == DKind.Hyperlink ||
          type.kind == DKind.Image ||
          type.kind == DKind.PenImage ||
          type.kind == DKind.Media ||
          type.kind == DKind.Blob ||
          type.kind == DKind.Unknown ||
          type.kind == DKind.Guid ||
          (type.kind == DKind.Enum && this.accepts(type.getEnumSupertype()))
        break

      case DKind.Number:
        accepts =
          type.kind == this.kind ||
          type.kind == DKind.Currency ||
          type.kind == DKind.Unknown ||
          (useLegacyDateTimeAccepts &&
            (type.kind == DKind.DateTime ||
              type.kind == DKind.Date ||
              type.kind == DKind.Time ||
              type.kind == DKind.DateTimeNoTimeZone)) ||
          (type.kind == DKind.Enum && this.accepts(type.getEnumSupertype()))
        break

      case DKind.Color:
      case DKind.Boolean:
      case DKind.PenImage:
      case DKind.ObjNull:
      case DKind.Guid:
        accepts = defaultReturnValue(type)
        break

      case DKind.Hyperlink:
        accepts =
          (!exact && type.kind == DKind.String) ||
          type.kind == DKind.Media ||
          type.kind == DKind.Blob ||
          type.kind == DKind.Image ||
          type.kind == DKind.PenImage ||
          defaultReturnValue(type)

        break
      case DKind.Image:
        accepts =
          type.kind == DKind.PenImage ||
          type.kind == DKind.Blob ||
          (!exact && (type.kind == DKind.String || type.kind == DKind.Hyperlink)) ||
          defaultReturnValue(type)
        break
      case DKind.Media:
        accepts =
          type.kind == DKind.Blob ||
          (!exact && (type.kind == DKind.String || type.kind == DKind.Hyperlink)) ||
          defaultReturnValue(type)
        break
      case DKind.Blob:
        accepts = (!exact && (type.kind == DKind.String || type.kind == DKind.Hyperlink)) || defaultReturnValue(type)
        break
      case DKind.Currency:
        accepts = (!exact && type.kind == DKind.Number) || defaultReturnValue(type)
        break
      case DKind.DateTime:
        accepts =
          type.kind == DKind.Date ||
          type.kind == DKind.Time ||
          type.kind == DKind.DateTimeNoTimeZone ||
          (useLegacyDateTimeAccepts && !exact && type.kind == DKind.Number) ||
          defaultReturnValue(type)
        break
      case DKind.DateTimeNoTimeZone:
        accepts =
          type.kind == DKind.Date ||
          type.kind == DKind.Time ||
          (useLegacyDateTimeAccepts && !exact && type.kind == DKind.Number) ||
          defaultReturnValue(type)
        break
      case DKind.Date:
      case DKind.Time:
        accepts =
          (!exact &&
            (type.kind === DKind.DateTime ||
              type.kind === DKind.DateTimeNoTimeZone ||
              (useLegacyDateTimeAccepts && type.kind === DKind.Number))) ||
          defaultReturnValue(type)
        break
      case DKind.Control:
        throw new Error('This should be overriden')
      //   throw new NotImplementedException("This should be overriden");
      case DKind.DataEntity:
        accepts = this.acceptsEntityType(type)
        break
      case DKind.Attachment:
        accepts = this.acceptsAttachmentType(type)
        break
      case DKind.Metadata:
        accepts =
          (type.kind === this.kind &&
            type.metadata.name === this.metadata.name &&
            type.metadata.type === this.metadata.type &&
            type.metadata.parentTableMetadata.name === this.metadata.parentTableMetadata.name) ||
          type.kind === DKind.Unknown
        break
      case DKind.OptionSet:
      case DKind.OptionSetValue:
        accepts =
          (type.kind === this.kind &&
            (this.optionSetInfo == null || type.optionSetInfo == null || type.optionSetInfo === this.optionSetInfo)) ||
          type.kind == DKind.Unknown
        break
      case DKind.View:
      case DKind.ViewValue:
        accepts =
          (type.kind == this.kind &&
            (this.viewInfo == null || type.viewInfo == null || type.viewInfo === this.viewInfo)) ||
          type.kind === DKind.Unknown
        break

      case DKind.NamedValue:
        accepts = (type.kind === this.kind && this.namedValueKind == type.namedValueKind) || type.kind == DKind.Unknown
        break
      case DKind.UntypedObject:
        accepts = type.kind == DKind.UntypedObject || type.kind == DKind.Unknown
        break
      default:
        //   Contracts.Assert(false);
        accepts = defaultReturnValue(type)
        break
    }

    // If the type is accepted we consider the difference invalid.  Otherwise, the type difference is the
    // unaccepting type
    const typeDifference = accepts ? this : DType.Invalid
    schemaDifference = { key: undefined as string, value: typeDifference }

    return [accepts, { schemaDifference, schemaDifferenceType }]
  }

  // TODO:
  // Implements Accepts for Record and Table types.
  private static TreeAccepts(
    parentType: DType,
    treeDst: TypeTree,
    treeSrc: TypeTree,
    exact = true,
    useLegacyDateTimeAccepts = false,
  ): [boolean, { schemaDifference: KeyValuePair<string, DType>; treeSrcSchemaDifferenceType: DType }] {
    //   treeDst.AssertValid();
    //   treeSrc.AssertValid();

    // let schemaDifference = { key: undefined as string, value: DType.Invalid }
    // let schemaDifferenceType = DType.Invalid;
    let schemaDifference = { key: undefined as string, value: DType.Invalid }
    let treeSrcSchemaDifferenceType = DType.Invalid

    if (treeDst == treeSrc) return [true, { schemaDifference, treeSrcSchemaDifferenceType }]

    for (const pairDst of treeDst.getPairsArray()) {
      // Contracts.Assert(pairDst.Value.IsValid);

      // If a field has type Error, it doesn't matter whether treeSrc
      // has the same field.
      if (pairDst.value.isError) {
        continue
      }

      let type: DType
      const result = treeSrc.tryGetValue(pairDst.key)
      type = result[1]
      if (!result[0]) {
        if (!exact || parentType.areFieldsOptional) {
          continue
        }
        let colName: string
        const rst = DType.TryGetDisplayNameForColumn(parentType, pairDst.key)
        colName = rst[1]
        if (!rst[0]) {
          colName = pairDst.key
        }
        schemaDifference = { key: colName, value: pairDst.value }
        return [false, { schemaDifference, treeSrcSchemaDifferenceType }]
      }

      let recursiveSchemaDifference: { key: string; value: DType }
      let recursiveSchemaDifferenceType: DType
      const result2 = pairDst.value.acceptsOut(type, exact, useLegacyDateTimeAccepts)
      recursiveSchemaDifference = result2[1].schemaDifference
      recursiveSchemaDifferenceType = result2[1].schemaDifferenceType
      if (result2[0]) {
        let colName: string
        const rst = DType.TryGetDisplayNameForColumn(parentType, pairDst.key)
        colName = rst[1]
        if (!rst[0]) {
          colName = pairDst.key
        }
        if (!isNullOrEmpty(recursiveSchemaDifference.key)) {
          schemaDifference = {
            key: colName + TexlLexer.PunctuatorDot + recursiveSchemaDifference.key,
            value: recursiveSchemaDifference.value,
          }
          treeSrcSchemaDifferenceType = recursiveSchemaDifferenceType
        } else {
          schemaDifference = { key: colName, value: pairDst.value }
          treeSrcSchemaDifferenceType = type
        }
        return [false, { schemaDifference, treeSrcSchemaDifferenceType }]
      }
    }

    return [true, { schemaDifference, treeSrcSchemaDifferenceType }]
  }

  // Implements Accepts for Enum types.
  private static EnumTreeAccepts(treeDst: ValueTree, treeSrc: ValueTree, exact = true): boolean {
    //   treeDst.AssertValid();
    //   treeSrc.AssertValid();

    if (treeDst == treeSrc) {
      return true
    }

    for (const pairSrc of treeSrc.getPairsArray()) {
      const result = treeDst.tryGetValue(pairSrc.key)
      if (!result[0]) {
        if (exact) {
          return false
        }
        continue
      }
      if (pairSrc.value != result[1]) {
        return false
      }
    }

    return true
  }

  private static IsSuperKind(baseKind: DKind, kind: DKind): boolean {
    //   Contracts.Assert(DKind._Min <= baseKind && baseKind < DKind._Lim);
    //   Contracts.Assert(DKind._Min <= kind && kind < DKind._Lim);

    if (baseKind == kind) return false

    if (baseKind == DKind.Error) return true

    if (kind == DKind.Error) return false

    let kind2Superkind: DKind

    while (true) {
      if (DType.KindToSuperkindMapping.has(kind)) {
        kind2Superkind = DType.KindToSuperkindMapping.get(kind)
      } else {
        kind2Superkind = undefined
        break
      }
      if (kind2Superkind === baseKind) {
        break
      }
      kind = kind2Superkind
    }

    return kind2Superkind == baseKind
  }

  // Some types require explicit conversion to their parents/children types.
  // This method returns true if this type requires such explicit conversion.
  // This method assumes that this type and the destination type are in the
  // same path in the type hierarchy (one is the ancestor of the other).
  public requiresExplicitCast(destType: DType): boolean {
    //   Contracts.Assert(destType.IsValid);
    //   Contracts.Assert(destType.accepts(this, exact: false));

    switch (destType.kind) {
      case DKind.String:
      case DKind.Hyperlink:
        if (this.kind === DKind.Blob || this.kind === DKind.Image || this.kind === DKind.Media) return true
        break
      default:
        break
    }

    return false
  }

  // Produces the least common supertype of the two specified types.
  public static Supertype(type1: DType, type2: DType, useLegacyDateTimeAccepts = false): DType {
    //   type1.AssertValid();
    //   type2.AssertValid();

    if (type1.isAggregate && type2.isAggregate) {
      if (type1.kind != type2.kind) return DType.Error

      return DType.SupertypeAggregateCore(type1, type2, useLegacyDateTimeAccepts)
    }

    return DType.SupertypeCore(type1, type2, useLegacyDateTimeAccepts)
  }

  private static SupertypeCore(type1: DType, type2: DType, useLegacyDateTimeAccepts: boolean): DType {
    //   type1.AssertValid();
    //   type2.AssertValid();

    if (type1.accepts(type2, undefined, useLegacyDateTimeAccepts))
      return DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type1, type2.associatedDataSources)

    if (type2.accepts(type1, undefined, useLegacyDateTimeAccepts))
      return DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type2, type1.associatedDataSources)

    let type1Superkind: DKind

    type1Superkind = DType.KindToSuperkindMapping.get(type1.kind)
    if (!DType.KindToSuperkindMapping.get(type1.kind) || type1Superkind === DKind.Error) {
      return DType.Error
    }

    while (!DType.IsSuperKind(type1Superkind, type2.kind)) {
      const isHas = DType.KindToSuperkindMapping.has(type1Superkind)
      type1Superkind = DType.KindToSuperkindMapping.get(type1Superkind)
      if (!isHas || type1Superkind === DKind.Error) {
        return DType.Error
      }
    }

    // Contracts.Assert(type1Superkind != DKind.Enum && DKind._MinPrimitive <= type1Superkind && type1Superkind < DKind._LimPrimitive);
    let type = new DType(type1Superkind)
    DType.UnionDataSourceInfoMetadata(type1, type2).forEach((cds) => {
      type = DType.AttachDataSourceInfo(type, cds)
    })
    return type
  }

  private static SupertypeAggregateCore(type1: DType, type2: DType, useLegacyDateTimeAccepts: boolean): DType {
    //   type1.AssertValid();
    //   type2.AssertValid();
    //   Contracts.Assert(type1.IsAggregate);
    //   Contracts.Assert(type2.IsAggregate);
    //   Contracts.Assert(type1.Kind == type2.Kind);

    // TODO: 需要外部完成swap
    // if (type1.childCount > type2.childCount) {
    //     CollectionUtils.Swap(ref type1, ref type2);
    // }

    let fError: boolean = false
    let treeRes = type1.typeTree
    let ator1 = type1.typeTree.getPairsArray()
    let ator2 = type2.typeTree.getPairsArray()

    let index1 = 0
    let index2 = 0

    let fAtor1 = ator1[index1]
    let fAtor2 = ator2[index2]

    while (fAtor1 && fAtor2) {
      if (fAtor1 != null && fAtor2 != null) {
        const cmp = RedBlackNode.Compare(fAtor1.key, fAtor2.key)
        if (cmp === 0) {
          const innerType = DType.Supertype(fAtor1.value, fAtor2.value, useLegacyDateTimeAccepts)
          if (innerType.isError) {
            const rst = treeRes.removeItem(fError, fAtor1.key)
            treeRes = rst[0]
            fError = rst[1]
          } else if (innerType != fAtor1.value) {
            treeRes = treeRes.setItem(fAtor1.key, innerType)
          }
          fAtor1 = ator1[++index1]
          fAtor2 = ator2[++index2]
        } else if (cmp < 0) {
          const rst = treeRes.removeItem(fError, fAtor1.key)
          treeRes = rst[0]
          fError = rst[1]
          fAtor1 = ator1[++index1]
        } else {
          fAtor2 = ator2[++index2]
        }
      }
    }

    while (fAtor1) {
      const rst = treeRes.removeItem(fError, fAtor1.key)
      treeRes = rst[0]
      fError = rst[1]
      fAtor1 = ator1[++index1]
    }
    // Contracts.Assert(!fError);
    return new DType(type1.kind, {
      typeTree: treeRes,
      associatedDataSources: DType.UnionDataSourceInfoMetadata(type1, type2),
    })
  }

  // Produces the union of the two given types.
  // For primitive types, this is the same as the least common supertype.
  // For aggregates, the union is a common subtype that includes fields from both types, assuming no errors.
  public static Union(type1: DType, type2: DType, useLegacyDateTimeAccepts = false): DType {
    let fError = false
    const result = DType.UnionWithError(fError, type1, type2, useLegacyDateTimeAccepts)
    return result[0]
  }

  public canUnionWith(type: DType, useLegacyDateTimeAccepts = false): boolean {
    //   AssertValid();
    //   type.AssertValid();

    let fError = false
    const result = DType.UnionWithError(fError, this, type, useLegacyDateTimeAccepts)
    fError = result[1]
    return !fError
  }

  private static UnionDataSourceInfoMetadata(type1: DType, type2: DType): Set<IExternalTabularDataSource> {
    //   type1.AssertValid();
    //   type2.AssertValid();

    if (type2.associatedDataSources == null && type1.associatedDataSources == null)
      return new Set<IExternalTabularDataSource>()

    if (type2.associatedDataSources == null) return type1.associatedDataSources

    if (type1.associatedDataSources == null) return type2.associatedDataSources

    const set = [...type1.associatedDataSources, ...type2.associatedDataSources]
    return new Set(set)
  }

  private static TryGetEntityMetadataForDisplayNames(type: DType): [boolean, IDataEntityMetadata] {
    if (!type.hasExpandInfo) {
      return [false, undefined]
    }

    //   Contracts.AssertValue(type.ExpandInfo.ParentDataSource);
    //   Contracts.AssertValue(type.ExpandInfo.ParentDataSource.DataEntityMetadataProvider);

    const metadataProvider = type.expandInfo.parentDataSource.dataEntityMetadataProvider
    const result = metadataProvider.tryGetEntityMetadata(type.expandInfo.identity)
    const metadata = result[1]
    if (!result[0]) {
      return [false, undefined]
    }
    return [true, metadata]
  }

  static CreateDTypeWithConnectedDataSourceInfoMetadata(
    type: DType,
    connectedDataSourceInfoSet: Set<IExternalTabularDataSource>,
  ): DType {
    //   type.AssertValid();
    //   Contracts.AssertValueOrundefined(connectedDataSourceInfoSet);

    if (connectedDataSourceInfoSet == null || connectedDataSourceInfoSet.size == 0) return type

    let returnType: DType = type
    connectedDataSourceInfoSet.forEach((cds) => {
      returnType = DType.AttachDataSourceInfo(returnType, cds)
    })
    return returnType
  }

  static TryGetDisplayNameForColumn(type: DType, logicalName: string): [boolean, string] {
    let displayName: string
    // If the type is an option set, the option set info has the mapping
    // if (type != null && type.isOptionSet && type.optionSetInfo != null) {
    //   let value: number
    //   value = parseInt(logicalName)
    //   if (isNaN(value) && type.optionSetInfo.displayNameMapping.tryGetFromFirst(value)) {
    //     const rst = type.optionSetInfo.displayNameMapping.tryGetFromFirst(value)
    //     if (rst[0]) {
    //       displayName = rst[1]
    //       return [true, displayName]
    //     }
    //   }
    //   displayName = undefined
    //   return [false, displayName]
    // }

    // If the type is an view, the view info has the mapping
    if (type != null && type.isView && type.viewInfo != null) {
      // TODO: logicName Guid 验证
      const value = logicalName
      if (value) {
        const rst = type.viewInfo.displayNameMapping.tryGetFromFirst(value)
        displayName = rst[1]
        if (rst[0]) {
          return [true, displayName]
        }
      }
      displayName = undefined
      return [false, displayName]
    }

    // If we are accessing an entity, then the entity info contains the mapping
    const result = DType.TryGetEntityMetadataForDisplayNames(type)
    const entityMetadata = result[1]
    if (result[0]) {
      const rst = entityMetadata.displayNameMapping.tryGetFromFirst(logicalName)
      displayName = rst[1]
      if (rst[0]) {
        return [true, displayName]
      }
      return [false, displayName]
    }

    // If there are multiple data sources associated with the type, we may have name conflicts
    // In that case, we block the use of display names from the type
    if (type != null && type.associatedDataSources != null && type.associatedDataSources.size == 1) {
      const values = type.associatedDataSources.values()
      const dataSourceInfo = values.next().value as IExternalTabularDataSource
      if (dataSourceInfo != null) {
        const rst = dataSourceInfo.displayNameMapping.tryGetFromSecond(logicalName)
        displayName = rst[1]
        if (rst[0]) {
          return [true, displayName]
        }
      }
    }
    displayName = undefined
    return [false, displayName]
  }

  static TryGetLogicalNameForColumn(type: DType, displayName: string, isThisItem = false): [boolean, string] {
    let logicalName: string
    // If the type is an option set, the option set info has the mapping
    // if (type != null && type.isOptionSet && !isThisItem && type.optionSetInfo != null) {
    //   let value: number
    //   const result = type.optionSetInfo.displayNameMapping.tryGetFromSecond(displayName)
    //   value = result[1]
    //   logicalName = value.toString()
    //   if (result[0]) {
    //     return [true, logicalName]
    //   }
    //   return [false, logicalName]
    // }

    // If the type is a view, the view info has the mapping
    if (type != null && type.isView && !isThisItem && type.viewInfo != null) {
      let value: string
      const result = type.viewInfo.displayNameMapping.tryGetFromSecond(displayName)
      value = result[1]
      logicalName = value.toString()
      if (result[0]) {
        return [true, logicalName]
      }
      return [false, logicalName]
    }

    // If we are accessing an entity, then the entity info contains the mapping
    const result = DType.TryGetEntityMetadataForDisplayNames(type)
    const entityMetadata = result[1]
    if (result[0]) {
      const rst = entityMetadata.displayNameMapping.tryGetFromSecond(displayName)
      logicalName = rst[1]
      if (rst[0]) {
        return [true, logicalName]
      }
      return [false, logicalName]
    }

    // If there are multiple data sources associated with the type, we may have name conflicts
    // In that case, we block the use of display names from the type
    if (type != null && type.associatedDataSources != null && type.associatedDataSources.size == 1) {
      const values = type.associatedDataSources.values()
      const dataSourceInfo = values.next().value as IExternalTabularDataSource
      if (dataSourceInfo != null) {
        const rst = dataSourceInfo.displayNameMapping.tryGetFromSecond(displayName)
        logicalName = rst[1]
        if (rst[0]) {
          return [true, logicalName]
        }
      }
    }

    // Use the DisplayNameProvider here
    if (type != null && type.displayNameProvider != null && !isThisItem) {
      const result = type.displayNameProvider.tryGetLogicalName(new DName(displayName))
      const logicalDName = result[1]
      if (result[0]) {
        logicalName = logicalDName.value
        return [true, logicalName]
      }
    }

    logicalName = undefined
    return [false, logicalName]
  }

  /// <summary>
  /// Returns true iff <see cref="displayName"/> was found within <see cref="type"/>'s old display
  /// name mapping and sets <see cref="logicalName"/> and <see cref="newDisplayName"/>
  /// according to the new mapping.
  /// </summary>
  /// <param name="type">
  /// Type the mapping within which to search for old display name and from which to produce new
  /// display name
  /// </param>
  /// <param name="displayName">
  /// Display name used to search
  /// </param>
  /// <param name="logicalName">
  /// Will be set to <see cref="displayName"/>'s corresponding logical name if
  /// <see cref="displayName"/> exists within <see cref="type"/>'s old mapping
  /// </param>
  /// <param name="newDisplayName">
  /// Will be set to <see cref="logicalName"/>'s new display name if
  /// <see cref="displayName"/> exists within <see cref="type"/>'s old mapping
  /// </param>
  /// <returns>
  /// Whether <see cref="displayName"/> exists within <see cref="type"/>'s previous display name map
  /// </returns>
  static TryGetConvertedDisplayNameAndLogicalNameForColumn(
    type: DType,
    displayName: string,
  ): [boolean, { logicalName: string; newDisplayName: string }] {
    let logicalName: string
    let newDisplayName: string

    // If the type is a view, the info has the mapping
    if (type != null && type.isView && type.viewInfo != null) {
      let value: string
      if (type.viewInfo.isConvertingDisplayNameMapping && type.viewInfo.previousDisplayNameMapping != null) {
        const result = type.viewInfo.previousDisplayNameMapping.tryGetFromSecond(displayName)
        value = result[1]
        if (result[0]) {
          logicalName = value.toString()
          const rst = type.viewInfo.displayNameMapping.tryGetFromFirst(value)
          newDisplayName = rst[1]
          if (rst[0]) {
            return [true, { logicalName, newDisplayName }]
          }
          newDisplayName = logicalName
          return [true, { logicalName, newDisplayName }]
        }
      }
      logicalName = undefined
      newDisplayName = undefined
      return [false, { logicalName, newDisplayName }]
    }

    const result = DType.TryGetEntityMetadataForDisplayNames(type)
    const entityMetadata = result[1]
    if (result[0]) {
      if (entityMetadata.isConvertingDisplayNameMapping && entityMetadata.previousDisplayNameMapping != null) {
        const rst = entityMetadata.previousDisplayNameMapping.tryGetFromSecond(displayName)
        logicalName = rst[1]
        if (rst[0]) {
          const rst2 = entityMetadata.displayNameMapping.tryGetFromFirst(logicalName)
          newDisplayName = rst2[1]
          if (rst2[0]) {
            return [true, { logicalName, newDisplayName }]
          }
          newDisplayName = logicalName
          return [true, { logicalName, newDisplayName }]
        }
      }
      logicalName = undefined
      newDisplayName = undefined
      return [false, { logicalName, newDisplayName }]
    }

    // If there are multiple data sources associated with the type, we may have name conflicts
    // In that case, we block the use of display names from the type
    if (type != null && type.associatedDataSources != null && type.associatedDataSources.size === 1) {
      const values = type.associatedDataSources.values()
      const dataSourceInfo = values.next().value as IExternalTabularDataSource
      if (
        dataSourceInfo != null &&
        dataSourceInfo.isConvertingDisplayNameMapping &&
        dataSourceInfo.previousDisplayNameMapping != null
      ) {
        const result = dataSourceInfo.previousDisplayNameMapping.tryGetFromSecond(displayName)
        logicalName = result[1]
        if (result[0]) {
          const rst = dataSourceInfo.displayNameMapping.tryGetFromFirst(logicalName)
          newDisplayName = rst[1]
          if (rst[0]) {
            return [true, { logicalName, newDisplayName }]
          }
          // Converting and no new mapping exists for this column, so the display name is also the logical name
          newDisplayName = logicalName
          return [true, { logicalName, newDisplayName }]
        }
      }
    }

    if (type != null && type.displayNameProvider != null) {
      const result = type.displayNameProvider.tryRemapLogicalAndDisplayNames(new DName(displayName))
      const { logicalName: logicalDName, newDisplayName: newDisplayDName } = result[1]
      if (result[0]) {
        logicalName = logicalDName.value
        newDisplayName = newDisplayDName.value
        return [true, { logicalName, newDisplayName }]
      }
    }

    logicalName = undefined
    newDisplayName = undefined
    return [false, { logicalName, newDisplayName }]
  }

  public static UnionWithError(
    fError: boolean,
    type1: DType,
    type2: DType,
    useLegacyDateTimeAccepts = false,
  ): [DType, boolean] {
    //   type1.AssertValid();
    //   type2.AssertValid();
    if (type1.isAggregate && type2.isAggregate) {
      if (type1.equals(DType.ObjNull))
        return [DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type2, type1.associatedDataSources), fError]
      if (type2.equals(DType.ObjNull))
        return [DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type1, type2.associatedDataSources), fError]

      if (type1.kind != type2.kind) {
        fError = true
        return [DType.Error, fError]
      }
      const unionResult = DType.UnionCore(fError, type1, type2, useLegacyDateTimeAccepts)
      fError = unionResult[1]
      return [DType.CreateDTypeWithConnectedDataSourceInfoMetadata(unionResult[0], type2.associatedDataSources), fError]
    }

    if (type1.accepts(type2, undefined, useLegacyDateTimeAccepts)) {
      fError ||= type1.isError
      return [DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type1, type2.associatedDataSources), fError]
    }

    if (type2.accepts(type1, undefined, useLegacyDateTimeAccepts)) {
      fError ||= type2.isError
      return [DType.CreateDTypeWithConnectedDataSourceInfoMetadata(type2, type1.associatedDataSources), fError]
    }

    const result = DType.Supertype(type1, type2, useLegacyDateTimeAccepts)
    fError = result.equals(DType.Error)
    return [result, fError]
  }

  private static UnionCore(
    fError: boolean,
    type1: DType,
    type2: DType,
    useLegacyDateTimeAccepts = false,
  ): [DType, boolean] {
    //   type1.AssertValid();
    //   Contracts.Assert(type1.IsAggregate);
    //   type2.AssertValid();
    //   Contracts.Assert(type2.IsAggregate);

    let result = type1
    for (const pair of type2.getNames(DPath.Root)) {
      const field2Name = pair.name
      let field1Type: DType
      const rst = type1.tryGetType(field2Name)
      field1Type = rst[1]
      if (!rst[0]) {
        result = result.addTypeName(pair)
        continue
      }

      let field2Type = pair.type
      if (field1Type.equals(field2Type)) {
        continue
      }

      let fieldType: DType
      if (field1Type.equals(DType.ObjNull) || field2Type.equals(DType.ObjNull)) {
        fieldType = field1Type.equals(DType.ObjNull) ? field2Type : field1Type
      } else if (field1Type.isAggregate && field2Type.isAggregate) {
        const rst = DType.UnionWithError(fError, field1Type, field2Type, useLegacyDateTimeAccepts)
        fieldType = rst[0]
        fError = rst[1]
      } else if (field1Type.isAggregate || field2Type.isAggregate) {
        let isMatchingExpandType = false
        let expandType = DType.Unknown
        if (field1Type.hasExpandInfo && field2Type.isAggregate) {
          isMatchingExpandType = DType.IsMatchingExpandType(field1Type, field2Type)
          expandType = field1Type
        } else if (field2Type.hasExpandInfo && field1Type.isAggregate) {
          isMatchingExpandType = DType.IsMatchingExpandType(field1Type, field2Type)
          expandType = field2Type
        }

        if (!isMatchingExpandType) {
          fieldType = DType.Error
          fError = true
        } else {
          fieldType = expandType
        }
      } else {
        const rst = DType.UnionWithError(fError, field1Type, field2Type, useLegacyDateTimeAccepts)
        fieldType = rst[0]
        fError = rst[1]
      }

      const rst2 = result.setType(fError, DPath.Root.append(field2Name), fieldType)
      result = rst2[0]
      fError = rst2[1]
    }
    return [result, fError]
  }

  /// <summary>
  /// Checks whether actualColumnType in table is matching related entity type in expectedColumnType.
  /// E.g. Collection definition rule => Collect(newCollection, Accounts);
  /// Above rule will define new collection with schema from Accounts datasource
  /// Adding new rule that populates collection with lookup data like below
  /// Collection populatin rule => Collect(newCollection, {'Primary Contact':First(Contacts)});
  /// Above rule is collecting new data record with data in lookup fields
  /// </summary>
  /// <param name="expectedColumnType">expected type in collection definition for 'Primary Contact' column is entity of expand type</param>
  /// <param name="actualColumnType">actual column provide in data collection rule is record of entity matching expand type</param>
  /// <returns>true if actual column type is Entity type matching Expand entity, false O.W.</returns>
  static IsMatchingExpandType(expectedColumnType: DType, actualColumnType: DType): boolean {
    //   expectedColumnType.AssertValid();
    //   actualColumnType.AssertValid();
    let isExpectedType = false
    for (const actualTypeAssociatedDS of actualColumnType.associatedDataSources) {
      let metadata: IDataEntityMetadata
      const rst = expectedColumnType.expandInfo.parentDataSource.dataEntityMetadataProvider.tryGetEntityMetadata(
        expectedColumnType.expandInfo.identity,
      )
      metadata = rst[1]
      if (rst[0] && metadata.entityName === actualTypeAssociatedDS.entityName.toString()) {
        isExpectedType = true
        break
      }
    }
    return isExpectedType
  }

  // Produces the intersection of the two given types.
  // For primitive types, this is only if the types match.
  // For aggregates, the union is all fields that have matching types.
  //   public static Intersection(type1: DType, type2: DType): DType
  //   {
  //     //   type1.AssertValid();
  //     //   type2.AssertValid();

  //     //   bool fError = false;
  //     return Intersection(false, type1, type2);
  //   }

  public static Intersection(fError: boolean, type1: DType, type2: DType): [DType, boolean] {
    //   type1.AssertValid();
    //   type2.AssertValid();

    if (type1.isAggregate && type2.isAggregate) {
      if (type1.kind != type2.kind) {
        fError = true
        return [DType.Error, fError]
      }

      return DType.IntersectionCore(fError, type1, type2)
    }

    if (type1.kind == type2.kind) return [type1, fError]

    fError = true
    return [DType.Error, fError]
  }

  private static IntersectionCore(fError: boolean, type1: DType, type2: DType): [DType, boolean] {
    //   type1.AssertValid();
    //   Contracts.Assert(type1.IsAggregate);
    //   type2.AssertValid();
    //   Contracts.Assert(type2.IsAggregate);

    let result = DType.CreateRecordOrTable(type1.kind, [])
    for (const pair of type2.getNames(DPath.Root)) {
      const field2Name = pair.name
      let field1Type: DType
      const rst = type1.tryGetType(field2Name)
      field1Type = rst[1]
      if (rst[0]) {
        continue
      }

      let field2Type = pair.type
      let fieldType: DType

      if (field1Type.isAggregate && field2Type.isAggregate) {
        const intRst = DType.Intersection(fError, field1Type, field2Type)
        fError = intRst[1]
        fieldType = intRst[0]
      } else if (field1Type.kind === field2Type.kind) {
        fieldType = field1Type
      } else {
        continue
      }
      result = result.add(field2Name, fieldType)
    }
    return [result, fError]
  }

  public intersects(other: DType): boolean {
    //   other.AssertValid();

    if (!this.isAggregate || !other.isAggregate || this.kind != other.kind) return false

    this.getNames(DPath.Root).forEach((pair) => {
      let f2Type: DType
      const rst = other.tryGetType(pair.name)
      f2Type = rst[1]
      if (rst[0] && f2Type === pair.type) {
        return true
      }
    })
    return false
  }

  public static Equals(type1: DType, type2: DType) {
    const null1 = type1 == null
    const null2 = type2 == null
    if (null1 && null2) {
      return true
    }
    if (null1 || null2) {
      return false
    }
    return type1.equals(type2)
  }

  // public getHashCode(): string {
  //   return hashCode({
  //     kind: this.kind,
  //     enumSuperkind: this.enumSuperKind,
  //     typeTreeHash: this.typeTree.getHashCode(),
  //     valueTreeHash: this.valueTree.getHashCode(),
  //   })
  // }

  public getHashCode() {
    return Hashing.CombineHash4(
      Hashing.HashInt(this.kind),
      Hashing.HashInt(this.enumSuperKind),
      this.typeTree.getHashCode(),
      this.valueTree.getHashCode(),
    )
  }

  public equals(other: any): boolean {
    // console.log('other instanceof DType', other instanceof DType)
    // console.log('enumSuperKind', this.enumSuperKind === other.enumSuperKind)
    // console.log('hasExpandInfo', this.hasExpandInfo === other.hasExpandInfo)
    // console.log('namedValueKind', this.namedValueKind === other.namedValueKind)
    // console.log('typeTree', this.typeTree.equals(other.typeTree))
    // console.log('valueTree', this.valueTree.equals(other.valueTree))

    return (
      other instanceof DType &&
      this.kind === other.kind &&
      this.typeTree.equals(other.typeTree) &&
      this.enumSuperKind === other.enumSuperKind &&
      this.valueTree.equals(other.valueTree) &&
      this.hasExpandInfo === other.hasExpandInfo &&
      this.namedValueKind === other.namedValueKind
    )
  }

  // Viewing DType.Invalid in the debugger should be allowed
  // so this code doesn't assert if the kind is invalid.
  public toString(): string {
    const sb = new StringBuilder()
    this.appendTo(sb)
    return sb.toString()
  }

  /// <summary>
  /// Returns a JS representation of this DType.
  /// </summary>
  /// <returns>A JS representation of this DType.</returns>
  /// <remarks>The representation is an object with a required member 't', of type string
  /// (which maps to the _kind property) and an optional member 'c', of type object, with
  /// keys named on the children properties for this DType, and values representing their
  /// respective JS type:
  /// export interface IJsonFunctionDataDefinition {
  ///     t: string;   // Type (maps to DType.Kind)
  ///     c?: HashTable<IJsonFunctionDataDefinition>; // optional children
  /// }
  /// </remarks>
  toJsTypeInner(shouldBeIncluded?: (name: DName, type: DType) => boolean): string {
    var sb = new StringBuilder()
    this.toJsType(sb, shouldBeIncluded)
    return sb.toString()
  }

  public toJsType(builder: StringBuilder, shouldBeIncluded?: (name: DName, type: DType) => boolean) {
    if (shouldBeIncluded == undefined) {
      shouldBeIncluded = (n: DName, t: DType) => true
    }

    const kindStr = DType.MapKindToStr(this.kind)
    switch (this.kind) {
      case DKind.Table:
      case DKind.Record:
        builder.append('{t:"').append(kindStr).append('",c:{')

        let sep: string = ''
        this.getNames(DPath.Root)
          .filter((tn) => shouldBeIncluded(tn.name, tn.type))
          .forEach((tn) => {
            builder.append(sep)
            DType.EscapeJSPropertyName(builder, tn.name.toString())
            builder.append(':')
            tn.type.toJsType(builder, shouldBeIncluded)
            sep = ','
          })

        builder.append('}}')
        return
      default:
        builder.append('{t:"').append(kindStr).append('"}')
        return
    }
  }

  private static readonly noNeedEscape = new RegExp(/^[a-zA-Z_][0-9a-zA-Z]*$/)

  private static EscapeJSPropertyName(builder: StringBuilder, name: string) {
    if (name.match(DType.noNeedEscape).length > 0) {
      builder.append(name)
    } else {
      builder.append('"')

      for (let i = 0; i < name.length; i++) {
        let c = name[i]
        const needsEscaping = '\\"'
        if (' ' <= c && c <= '~') {
          if (needsEscaping.includes(c)) {
            builder.append('\\')
          }

          builder.append(c)
        } else {
          builder.append(`\\u${c.charCodeAt(0)}`)
        }
      }

      builder.append('"')
    }
  }

  public appendTo(sb: StringBuilder) {
    //   Contracts.AssertValue(sb);
    sb.append(DType.MapKindToStr(this.kind))

    switch (this.kind) {
      case DKind.Record:
      case DKind.Table:
        DType.AppendAggregateType(sb, this.typeTree)
        break
      case DKind.OptionSet:
      case DKind.View:
        DType.AppendOptionSetOrViewType(sb, this.typeTree)
        break
      case DKind.Enum:
        DType.AppendEnumType(sb, this.valueTree, this.enumSuperKind)
        break
    }
  }

  /// <summary>
  /// Returns true if type contains a control type.
  /// </summary>
  public containsControlType(path: DPath): boolean {
    //   AssertValid();
    //   Contracts.AssertValid(path);

    return this.getNames(path).some(
      (n) => n.type.isControl || (n.type.isAggregate && n.type.containsControlType(DPath.Root)),
    )
  }

  //   public bool CoercesTo(DType typeDest, bool aggregateCoercion = true, bool isTopLevelCoercion = false)
  //   {
  //       return CoercesTo(typeDest, out _, aggregateCoercion, isTopLevelCoercion);
  //   }

  //   public bool CoercesTo(DType typeDest, out bool isSafe, bool aggregateCoercion = true, bool isTopLevelCoercion = false)
  //   {
  //       return CoercesTo(typeDest, out isSafe, out _, out _, out _, aggregateCoercion, isTopLevelCoercion);
  //   }

  // out bool isSafe, out DType coercionType, out KeyValuePair<string, DType> schemaDifference, out DType schemaDifferenceType,
  public aggregateCoercesTo(
    typeDest: DType,
    aggregateCoercion = true,
  ): [
    boolean,
    {
      isSafe: boolean
      coercionType: DType
      schemaDifference: { key: string; value: DType }
      schemaDifferenceType: DType
    },
  ] {
    //   Contracts.Assert(IsAggregate);

    let schemaDifference = { key: undefined as string, value: DType.Invalid }
    let schemaDifferenceType = DType.Invalid
    let isSafe: boolean
    let coercionType: DType

    if (
      (typeDest.kind == DKind.Image && this.isLargeImage) ||
      (typeDest.isLargeImage && this == DType.MinimalLargeImage)
    ) {
      isSafe = true
      coercionType = typeDest
      return [true, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    // Can't coerce scalar->aggregate, or viceversa.
    if (!typeDest.isAggregate) {
      isSafe = false
      coercionType = this
      return [false, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    if (this.kind != typeDest.kind && this.kind == DKind.Record && aggregateCoercion) {
      const result = this.toTable().coercesTo(typeDest)
      const data = result[1]
      schemaDifference = data.schemaDifference
      schemaDifferenceType = data.schemaDifferenceType
      isSafe = data.isSafe
      coercionType = data.coercionType

      return [result[0], { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    if (this.kind != typeDest.kind) {
      isSafe = false
      coercionType = this
      return [false, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    let fieldIsSafe = true
    let isValid = true
    if (this.isRecord) {
      coercionType = DType.EmptyRecord
    } else {
      coercionType = DType.EmptyTable
    }

    isSafe = true

    typeDest.getNames(DPath.Root).forEach((typedName) => {
      const result = this.tryGetType(typedName.name)
      const thisFieldType = result[1]
      if (result[0]) {
        const rst = thisFieldType.coercesTo(typedName.type, aggregateCoercion)
        // schemaDifference = rst[1].schemaDifference
        // schemaDifferenceType = rst[1].schemaDifferenceType
        const isFieldValid = rst[0]
        fieldIsSafe = rst[1].isSafe
        const fieldCoercionType = rst[1].coercionType
        const fieldSchemaDifference = rst[1].schemaDifference
        const fieldSchemaDifferenceType = rst[1].schemaDifferenceType
        // This is the attempted coercion type.  If we fail, we need to know this for error handling
        coercionType = coercionType.add(typedName.name, fieldCoercionType)

        // If this is the first field that invalidates the type, we set schema difference. We only report
        // the first type mismatch.
        if (!isFieldValid && isValid) {
          const fieldName = isNullOrEmpty(fieldSchemaDifference.key)
            ? typedName.name.toString()
            : fieldSchemaDifference.key
          schemaDifference = { key: fieldName, value: fieldSchemaDifference.value }
          schemaDifferenceType = fieldSchemaDifferenceType
        }

        isValid &&= isFieldValid
      }
    })

    return [isValid, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
  }

  // Returns true if values of this type may be coerced to the specified type.
  // isSafe is marked false if the resultant coercion could have undesireable results
  // such as returning undefined or returning an unintuitive outcome.

  public coercesTo(
    typeDest: DType,
    aggregateCoercion = true,
    isTopLevelCoercion = false,
  ): [
    boolean,
    {
      isSafe: boolean
      coercionType: DType
      schemaDifference: { key: string; value: DType }
      schemaDifferenceType: DType
    },
  ] {
    //   AssertValid();
    //   Contracts.Assert(typeDest.IsValid);

    let schemaDifference = { key: undefined as string, value: DType.Invalid }
    let schemaDifferenceType = DType.Invalid
    let isSafe: boolean
    let coercionType: DType

    isSafe = true

    if (typeDest.accepts(this)) {
      coercionType = typeDest
      return [true, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    if (this.kind === DKind.Error) {
      isSafe = false
      coercionType = this
      return [false, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    if (this.isAggregate) {
      const rst = this.aggregateCoercesTo(typeDest, aggregateCoercion)
      coercionType = rst[1].coercionType
      isSafe = rst[1].isSafe
      schemaDifference = rst[1].schemaDifference
      schemaDifferenceType = rst[1].schemaDifferenceType
      return [rst[0], { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    const result = this.subtypeCoercesTo(typeDest, isSafe, schemaDifference, schemaDifferenceType)
    const subtypeCoerces = result[0]
    coercionType = result[1].coercionType
    isSafe = result[1].isSafe
    schemaDifference = result[1].schemaDifference
    schemaDifferenceType = result[1].schemaDifferenceType

    if (subtypeCoerces != null) {
      return [subtypeCoerces, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    // For now, named values are never valid as a coerce target or source
    if (typeDest.kind === DKind.NamedValue || this.kind == DKind.NamedValue) {
      coercionType = this
      return [false, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    if (this.kind === DKind.Enum) {
      if (
        !typeDest.isControl &&
        !typeDest.isExpandEntity &&
        !typeDest.isAttachment &&
        !typeDest.isMetadata &&
        !typeDest.isAggregate &&
        typeDest.accepts(this.getEnumSupertype())
      ) {
        coercionType = typeDest
        return [true, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
      } else {
        coercionType = this
        return [false, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
      }
    }

    if (typeDest.isLargeImage && this.kind === DKind.Image) {
      coercionType = typeDest
      return [true, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
    }

    let doesCoerce = false
    switch (typeDest.kind) {
      case DKind.Boolean:
        isSafe = this.kind != DKind.String
        doesCoerce =
          this.kind === DKind.String ||
          DType.Number.accepts(this) ||
          (this.kind === DKind.OptionSetValue && this.optionSetInfo != null && this.optionSetInfo.isBooleanValued)
        break
      case DKind.DateTime:
      case DKind.Date:
      case DKind.Time:
      case DKind.DateTimeNoTimeZone:
        // String to boolean results in an unintuitive coercion
        // (eg "Robert" -> false), unless it is "true" or "false" exactly.
        // String to DateTime isn't safe for ill-formatted strings.
        isSafe = this.kind != DKind.String
        doesCoerce = this.kind == DKind.String || DType.Number.accepts(this) || DType.DateTime.accepts(this)
        break
      case DKind.Number:
        // Ill-formatted strings coerce to undefined; unsafe.
        isSafe = this.kind != DKind.String
        doesCoerce =
          this.kind == DKind.String ||
          DType.Number.accepts(this) ||
          DType.Boolean.accepts(this) ||
          DType.DateTime.accepts(this)
        break
      case DKind.Currency:
        // Ill-formatted strings coerce to undefined; unsafe.
        isSafe = this.kind != DKind.String
        doesCoerce = this.kind == DKind.String || this.kind == DKind.Number || DType.Boolean.accepts(this)
        break
      case DKind.String:
        doesCoerce =
          this.kind != DKind.Color &&
          this.kind != DKind.Control &&
          this.kind != DKind.DataEntity &&
          this.kind != DKind.OptionSet &&
          this.kind != DKind.View &&
          this.kind != DKind.Polymorphic &&
          this.kind != DKind.File &&
          this.kind != DKind.LargeImage
        break
      case DKind.Hyperlink:
        doesCoerce = this.kind != DKind.Guid && DType.String.accepts(this)
        break
      case DKind.Image:
        doesCoerce =
          this.kind != DKind.Media && this.kind != DKind.Blob && this.kind != DKind.Guid && DType.String.accepts(this)
        break
      case DKind.Media:
        doesCoerce =
          this.kind != DKind.Image &&
          this.kind != DKind.PenImage &&
          this.kind != DKind.Blob &&
          this.kind != DKind.Guid &&
          DType.String.accepts(this)
        break
      case DKind.Blob:
        doesCoerce = this.kind != DKind.Guid && DType.String.accepts(this)
        break
      case DKind.Enum:
        const rst = this.coercesTo(typeDest.getEnumSupertype())
        coercionType = rst[1].coercionType
        isSafe = rst[1].isSafe
        schemaDifference = rst[1].schemaDifference
        schemaDifferenceType = rst[1].schemaDifferenceType
        return [rst[0], { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
      case DKind.OptionSetValue:
        doesCoerce =
          (typeDest.optionSetInfo?.isBooleanValued ?? false) && this.kind === DKind.Boolean && !isTopLevelCoercion
        break
    }

    if (doesCoerce) coercionType = typeDest
    else coercionType = this

    return [doesCoerce, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
  }

  protected subtypeCoercesTo(
    typeDest: DType,
    isSafe: boolean,
    schemaDifference: KeyValuePair<string, DType>,
    schemaDifferenceType: DType,
  ): [
    boolean | undefined,
    {
      isSafe: boolean
      coercionType?: DType
      schemaDifference: KeyValuePair<string, DType>
      schemaDifferenceType: DType
    },
  ] {
    const coercionType: DType | undefined = undefined
    return [undefined, { isSafe, coercionType, schemaDifference, schemaDifferenceType }]
  }

  // Gets the subtype of aggregate type expectedType that this type can coerce to.
  // Checks whether the fields of this type can be coerced to the fields of expectedType
  // and returns the type it should be coerced to in order to be compatible.
  public TryGetCoercionSubType(
    expectedType: DType,
    safeCoercionRequired = false,
    aggregateCoercion = true,
  ): [boolean, { coercionType: DType; coercionNeeded: boolean }] {
    //   Contracts.Assert(expectedType.IsValid);
    let coercionType: DType
    let coercionNeeded: boolean
    // Primitive case
    if (!expectedType.isAggregate || expectedType.isLargeImage) {
      coercionType = expectedType
      coercionNeeded = !expectedType.accepts(this)
      if (!coercionNeeded) return [true, { coercionType, coercionNeeded }]

      let expandedType: DType
      const result = expectedType.tryGetExpandedEntityTypeWithoutDataSourceSpecificColumns()
      expandedType = result[1]
      if (result[0] && expandedType.accepts(this)) {
        coercionNeeded = false
        return [true, { coercionType, coercionNeeded }]
      }

      let coercionIsSafe: boolean
      const result2 = this.coercesTo(expectedType, aggregateCoercion)
      coercionIsSafe = result2[1].isSafe
      return [result2[0] && (!safeCoercionRequired || coercionIsSafe), { coercionType, coercionNeeded }]
    }

    coercionType = this.isRecord ? DType.EmptyRecord : DType.EmptyTable
    coercionNeeded = false

    if (!this.isAggregate) return [false, { coercionType, coercionNeeded }]

    if (this.isTable != expectedType.isTable && !aggregateCoercion) return [false, { coercionType, coercionNeeded }]

    expectedType.getNames(DPath.Root).forEach((typedName) => {
      let thisFieldType: DType
      const typeRst = this.tryGetType(typedName.name)
      thisFieldType = typeRst[1]
      if (typeRst[0]) {
        let thisFieldCoercionType: DType
        let thisFieldCoercionNeeded: boolean
        const rst = thisFieldType.TryGetCoercionSubType(typedName.type, safeCoercionRequired, aggregateCoercion)
        thisFieldType = rst[1].coercionType
        thisFieldCoercionNeeded = rst[1].coercionNeeded
        if (!rst[0]) {
          return [false, { coercionType: thisFieldCoercionType, coercionNeeded: thisFieldCoercionNeeded }]
        }
        coercionNeeded ||= thisFieldCoercionNeeded
        coercionType = coercionType.add(typedName.name, thisFieldCoercionType)
      }
    })
    return [true, { coercionType, coercionNeeded }]
  }

  public getColumnTypeFromSingleColumnTable(): DType {
    //   Contracts.Assert(IsTable);
    //   Contracts.Assert(IsColumn);
    return this.typeTree.first().value
  }

  // Attempt to convert values of a base primitive type to another.
  public static TryConvertValue(value: any, typeDest: DType): [boolean, any] {
    //   Contracts.AssertValueOrundefined(value);
    //   Contracts.Assert(typeDest.IsValid);

    let newValue: any = undefined

    // No need to do anything for undefined values.
    if (value == null) return [true, newValue]

    // No support for converting to aggregate types.
    if (typeDest.isAggregate) return [false, newValue]

    switch (typeDest.kind) {
      case DKind.Boolean:
        if (typeof value === 'boolean') {
          newValue = value
          return [true, newValue]
        }
        if (typeof value === 'number') {
          newValue = value != 0
          return [true, newValue]
        }

        const s = value as string
        if (typeof s === 'string' && s != undefined) {
          newValue = s.toLowerCase() === TexlLexer.KeywordTrue.toLowerCase()
          return [true, newValue]
        }

        // Since DateTime is represented as a numeric value underneath, conversion to boolean
        // should simply check if the numeric value is 0 or not.
        if (value instanceof Date) {
          const tempNum = value.getTime()
          newValue = tempNum != 0
          return [true, newValue]
        }
        return [false, newValue]

      case DKind.Number:
      case DKind.Currency:
        if (typeof value === 'boolean') {
          newValue = value ? 1 : 0
          return [true, newValue]
        }
        if (typeof value === 'number') {
          newValue = value
          return [true, newValue]
        }

        const s1 = value as string
        if (typeof s1 === 'string' && s1 != undefined) {
          let doubleValue: number
          const num = parseFloat(s1)
          if (isNaN(num)) {
            return [false, newValue]
          }
          newValue = doubleValue
          return [true, newValue]
        }

        if (value instanceof Date) {
          newValue = value.getTime()
          return [true, newValue]
        }
        return [false, newValue]
      case DKind.Date:
      case DKind.Time:
      case DKind.DateTime:
        const dateRst = DType.TryConvertDateTimeValue(value, typeDest)
        newValue = dateRst[1]
        return [dateRst[0], newValue]

      case DKind.String:
        if (typeof value === 'boolean') {
          newValue = (value ? TexlLexer.KeywordTrue : TexlLexer.KeywordFalse).toString()
          return [true, newValue]
        }
        if (typeof value === 'number') {
          newValue = value.toString()
          return [true, newValue]
        }

        const newValue1 = value as string
        if (typeof newValue1 === 'string' && newValue1 != undefined) {
          newValue = newValue1
          return [true, newValue]
        }

        if (value instanceof Date) {
          //   newValue = ((DateTime)value).ToLocalTime().ToString();
          newValue = value.toLocaleString()
          return [true, newValue]
        }
        return [false, newValue]

      case DKind.Image:
      case DKind.Media:
      case DKind.Blob:
      case DKind.Hyperlink:
        // If value is string we can flag it as hyperlink/image
        var value1 = value as string
        if (typeof value1 === 'string' && value1 != undefined) {
          newValue = value1
          return [true, newValue]
        }
        return [false, newValue]

      case DKind.Color:
      case DKind.Control:
      case DKind.DataEntity:
      default:
        return [false, newValue]
    }
  }

  private static TryConvertDateTimeValue(value: any, typeDest: DType): [boolean, any] {
    //   Contracts.AssertValueOrundefined(value);
    //   Contracts.Assert(typeDest.Kind == DKind.Date || typeDest.Kind == DKind.Time || typeDest.Kind == DKind.DateTime);

    let newValue: any = undefined
    let dt: Date

    switch (typeDest.kind) {
      case DKind.Date: {
        if (typeof value === 'boolean') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date
          const rst = DateTimeExtensions.TryFromOADate(value ? 1 : 0)
          const success = rst[0]
          result = rst[1]
          // newValue = success ? result.ToLocalTime().Date.ToUniversalTime() : result
          newValue = success ? result : result
          return [success, newValue]
        }

        if (typeof value === 'number') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date
          const rst = DateTimeExtensions.TryFromOADate(value)
          const success = rst[0]
          result = rst[1]
          newValue = success ? result : result
          return [success, newValue]
        }

        if (typeof value === 'string') {
          const rst = DateTimeExtensions.TryParse(value)
          dt = rst[1]
          if (!rst[0]) return [false, newValue]
          //   if (dt.Kind == DateTimeKind.Unspecified)
          //       dt = System.DateTime.SpecifyKind(dt, DateTimeKind.Local).ToUniversalTime();

          //   newValue = dt.ToLocalTime().Date.ToUniversalTime();
          newValue = dt
          return [true, newValue]
        }

        if (value instanceof Date) {
          dt = value

          //   if (dt.Kind == DateTimeKind.Unspecified)
          //       dt = System.DateTime.SpecifyKind(dt, DateTimeKind.Local);

          //   newValue = dt.ToLocalTime().Date.ToUniversalTime();
          newValue = dt
          return [true, newValue]
        }

        return [true, newValue]
      }
      case DKind.Time: {
        if (typeof value === 'boolean') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date
          const rst = DateTimeExtensions.TryFromOADate(0.0)
          const success = rst[0]
          result = rst[1]
          // newValue = success ? result.ToLocalTime().Date.ToUniversalTime() : result
          newValue = result
          return [success, newValue]
          //   var success = DateTimeExtensions.TryFromOADate(0.0, out result);
          //   newValue = result;
          //   return success;
        }

        if (typeof value === 'number') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date

          let frac = Math.abs(value) - Math.abs(Math.trunc(value))
          const rst = DateTimeExtensions.TryFromOADate(0.0)
          const success = rst[0]
          result = rst[1]
          newValue = result
          return [success, result]
        }

        if (typeof value === 'string') {
          const rst = DateTimeExtensions.TryParse(value)
          dt = rst[1]
          if (!rst[0]) return [false, newValue]
          //   if (dt.Kind == DateTimeKind.Unspecified)
          //       dt = System.DateTime.SpecifyKind(dt, DateTimeKind.Local).ToUniversalTime();

          //   newValue = dt.ToLocalTime().Date.ToUniversalTime();
          newValue = dt
          return [true, newValue]
          //   if (!System.DateTime.TryParse(@string, out dt))
          //       return false;
          //   newValue = ConvertDateTimeToTime(dt);
          //   return true;
        }

        if (value instanceof Date) {
          newValue = DType.ConvertDateTimeToTime(value)
          return [true, newValue]
        }

        return [false, newValue]
      }
      case DKind.DateTime: {
        if (typeof value === 'boolean') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date
          const rst = DateTimeExtensions.TryFromOADate(value ? 1 : 0)
          const success = rst[0]
          result = rst[1]
          // newValue = success ? result.ToLocalTime().Date.ToUniversalTime() : result
          newValue = result
          return [success, newValue]
          //   DateTime result;
          //   var success = DateTimeExtensions.TryFromOADate(boolean ? 1 : 0, out result);
          //   newValue = result;
          //   return success;
        }

        if (typeof value === 'number') {
          // REVIEW ragru/hekum: Excel specific behaviour. Revisit.
          let result: Date
          const rst = DateTimeExtensions.TryFromOADate(value)
          const success = rst[0]
          result = rst[1]
          newValue = result
          return [success, newValue]
          //   DateTime result;
          //   var success = DateTimeExtensions.TryFromOADate(@double, out result);
          //   newValue = result;
          //   return success;
        }

        if (typeof value === 'string') {
          const rst = DateTimeExtensions.TryParse(value)
          dt = rst[1]
          if (!rst[0]) return [false, newValue]
          newValue = dt
          return [true, newValue]
          //   if (!System.DateTime.TryParse(@string, out dt))
          //       return false;
          //   if (dt.Kind == DateTimeKind.Unspecified)
          //       dt = System.DateTime.SpecifyKind(dt, DateTimeKind.Local).ToUniversalTime();
          //   newValue = dt;
          //   return true;
        }

        if (value instanceof Date) {
          dt = value

          //   if (dt.Kind == DateTimeKind.Unspecified)
          //       newValue = System.DateTime.SpecifyKind(dt, DateTimeKind.Local).ToUniversalTime();
          //   else
          newValue = dt
          return [true, newValue]
        }

        return [false, newValue]
      }
    }

    newValue = undefined
    return [false, newValue]
  }

  // TODO: 时区方案
  private static ConvertDateTimeToTime(value: Date) {
    return value
    //   if (value.Kind == DateTimeKind.Unspecified)
    //       value = System.DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime();

    //   DateTime DateValue = value.ToLocalTime().Date.ToUniversalTime();
    //   return (DateTimeExtensions.OleAutomationEpoch + (value - DateValue)).ToUniversalTime();
  }

  public static IsAcceptableTypeConversionForTables(sourceType: DType, destinationType: DType): boolean {
    //   Contracts.Assert(sourceType.IsValid);
    //   Contracts.Assert(destinationType.IsValid);

    if (
      sourceType.kind == DKind.Enum ||
      sourceType.kind == DKind.Record ||
      sourceType.kind == DKind.Table ||
      sourceType.kind == DKind.Unknown ||
      sourceType.kind == DKind.Error ||
      sourceType.kind == DKind.Control ||
      sourceType.kind == DKind.DataEntity ||
      destinationType.kind == DKind.Enum ||
      destinationType.kind == DKind.Record ||
      destinationType.kind == DKind.Table ||
      destinationType.kind == DKind.Unknown ||
      destinationType.kind == DKind.Control ||
      destinationType.kind == DKind.DataEntity ||
      destinationType.kind == DKind.Error
    ) {
      return false
    }

    if (
      sourceType.kind != DKind.String ||
      destinationType.kind == DKind.Hyperlink ||
      destinationType.kind == DKind.Image ||
      destinationType.kind == DKind.Media ||
      destinationType.kind == DKind.Blob
    ) {
      return sourceType.coercesTo(destinationType)[0]
    }

    switch (destinationType.kind) {
      case DKind.Boolean:
      case DKind.String:
        return true
      default:
        return false
    }
  }

  static AreCompatibleTypes(type1: DType, type2: DType): boolean {
    //   Contracts.Assert(type1.IsValid);
    //   Contracts.Assert(type2.IsValid);

    return type1.accepts(type2) || type2.accepts(type1)
  }

  public static MapKindToStr(kind: DKind): string {
    switch (kind) {
      case DKind.Unknown:
        return '?'
      case DKind.Error:
        return 'e'
      case DKind.Boolean:
        return 'b'
      case DKind.Number:
        return 'n'
      case DKind.String:
        return 's'
      case DKind.Hyperlink:
        return 'h'
      case DKind.DateTime:
        return 'd'
      case DKind.Date:
        return 'D'
      case DKind.Time:
        return 'T'
      case DKind.DateTimeNoTimeZone:
        return 'Z'
      case DKind.Image:
        return 'i'
      case DKind.PenImage:
        return 'p'
      case DKind.Currency:
        return '$'
      case DKind.Color:
        return 'c'
      case DKind.Record:
        return '!'
      case DKind.Table:
        return '*'
      case DKind.Enum:
        return '%'
      case DKind.Media:
        return 'm'
      case DKind.Blob:
        return 'o'
      case DKind.LegacyBlob:
        return 'a'
      case DKind.Guid:
        return 'g'
      case DKind.Control:
        return 'v'
      case DKind.DataEntity:
        return 'E'
      case DKind.Metadata:
        return 'M'
      case DKind.ObjNull:
        return 'N'
      case DKind.Attachment:
        return 'A'
      case DKind.OptionSet:
        return 'L'
      case DKind.OptionSetValue:
        return 'l'
      case DKind.Polymorphic:
        return 'P'
      case DKind.View:
        return 'Q'
      case DKind.ViewValue:
        return 'q'
      case DKind.File:
        return 'F'
      case DKind.LargeImage:
        return 'I'
      case DKind.NamedValue:
        return 'V'
      case DKind.UntypedObject:
        return 'O'
      default:
        return 'x'
    }
  }

  private static AppendAggregateType(sb: StringBuilder, tree: TypeTree) {
    //   Contracts.AssertValue(sb);

    sb.append('[')

    let strPre = ''
    tree.getPairsArray().forEach((kvp) => {
      //   Contracts.Assert(kvp.Value.IsValid);
      sb.append(strPre)
      sb.append(TexlLexer.EscapeName(kvp.key))
      sb.append(':')
      kvp.value.appendTo(sb)
      strPre = ', '
    })
    sb.append(']')
  }

  private static AppendOptionSetOrViewType(sb: StringBuilder, tree: TypeTree) {
    //   Contracts.AssertValue(sb);

    sb.append('{')

    let strPre = ''

    tree.getPairsArray().forEach((kvp) => {
      //   Contracts.Assert(kvp.Value.IsValid);
      sb.append(strPre)
      sb.append(TexlLexer.EscapeName(kvp.key))
      sb.append(':')
      kvp.value.appendTo(sb)
      strPre = ', '
    })
    sb.append('}')
  }

  private static AppendEnumType(sb: StringBuilder, tree: ValueTree, enumSuperkind: DKind) {
    //   Contracts.AssertValue(sb);

    sb.append(DType.MapKindToStr(enumSuperkind))
    sb.append('[')

    let strPre = ''
    tree.getPairsArray().forEach((kvp) => {
      // Contracts.AssertNonEmpty(kvp.Key);
      // Contracts.AssertValue(kvp.Value.Object);
      sb.append(strPre)
      sb.append(TexlLexer.EscapeName(kvp.key))
      sb.append(':')
      sb.append(kvp.value.toString())
      strPre = ', '
    })
    sb.append(']')
  }

  // Produces a DType from a string representation in our reduced type algebra language.
  static TryParse(typeSpec: string): [boolean, DType] {
    //   Contracts.AssertNonEmpty(typeSpec);
    return DTypeSpecParser.TryParse(new DTypeSpecLexer(typeSpec))
  }

  static ParseOrReturnNull(typeSpec: string): DType {
    // Contracts.AssertNonEmpty(typeSpec);

    return DType.TryParse(typeSpec)[1]
  }

  public get hasMetaField() {
    return this.tryGetMetaField()[0]
  }

  // Fetch the meta field for this DType, if there is one.
  public tryGetMetaField(): [boolean, IExternalControlType] {
    let metaFieldType: IExternalControlType
    const rst = this.tryGetType(new DName(DType.MetaFieldName))
    const field = rst[1]
    if (
      !this.isAggregate ||
      !rst[0] ||
      !IsIExternalControlType(field) ||
      !(field as unknown as IExternalControlType)?.controlTemplate?.isMetaLoc
    ) {
      metaFieldType = undefined
      return [false, metaFieldType]
    }
    metaFieldType = field as unknown as IExternalControlType
    return [true, metaFieldType]
  }

  public reportNonExistingName(
    fieldNameKind: FieldNameKind,
    errors: IErrorContainer,
    name: DName,
    location: TexlNode,
    severity: DocumentErrorSeverity = DocumentErrorSeverity.Severe,
  ) {
    const result = this.tryGetSimilarName(name, fieldNameKind)
    const similar = result[1]
    if (result[0]) {
      errors.ensureErrorWithSeverity(severity, location, TexlStrings.ErrColumnDoesNotExist_Name_Similar, name, similar)
    } else {
      errors.ensureErrorWithSeverity(severity, location, TexlStrings.ErrColDNE_Name, name)
    }
  }

  public tryGetSimilarName(name: DName, fieldNameKind: FieldNameKind): [boolean, string] {
    const maxLength = 2000
    let similar: string = undefined
    if (name.getValue().length > maxLength) return [false, similar]

    const comparer = new StringDistanceComparer(name.getValue(), maxLength)
    similar =
      this.getNames(DPath.Root)
        .map((k) => {
          let result = k.name.getValue()
          if (fieldNameKind == FieldNameKind.Display) {
            const rst = DType.TryGetDisplayNameForColumn(this, result)
            const colName = rst[1]
            if (rst[0]) {
              result = colName
            }
          }
          return result
        })
        .sort(comparer.compare)[0] || ''

    // We also want to have a heuristic maximum distance so that we don't give ridiculous
    // suggestions.
    return [similar != null && comparer.distance(similar) < name.getValue().length / 3 + 3, similar]
  }
}
