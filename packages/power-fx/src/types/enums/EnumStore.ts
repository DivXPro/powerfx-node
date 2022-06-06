import { ColorTable } from './ColorTable'
import { EnumConstants } from './EnumConstants'
import { EnumSymbol } from './EnumSymbol'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { LanguageConstants } from '../../utils/LanguageConstants'
import { DType } from '../DType'

export class EnumStore {
  /// <summary>
  /// Key: Enum internal identifier
  /// Value:
  ///     Item1: Enum internal identifier
  ///     Item2: Enum invariant name
  /// </summary>
  private _customEnumDict = new Dictionary<string, [string, string, string]>()

  private _customEnumLocDict = new Dictionary<string, Map<string, string>>()

  /// <summary>
  /// Mapping from invariant enum name to its parsed DType.
  /// We cache these to improve test performance, which repeatedly creates Document objects.
  /// </summary>
  private _enumTypes: Dictionary<string, DType>

  private _enumSpec: Dictionary<string, string>

  private readonly _enums = new Dictionary<string, string>([
    [EnumConstants.BorderStyleEnumString, '%s[None:"none", Dashed:"dashed", Solid:"solid", Dotted:"dotted"]'],
    [EnumConstants.ColorEnumString, ColorTable.ToString()],
    [
      EnumConstants.DateTimeFormatEnumString,
      '%s[LongDate:"\'longdate\'", ShortDate:"\'shortdate\'", LongTime:"\'longtime\'", ShortTime:"\'shorttime\'", LongTime24:"\'longtime24\'", ' +
        'ShortTime24:"\'shorttime24\'", LongDateTime:"\'longdatetime\'", ShortDateTime:"\'shortdatetime\'", ' +
        'LongDateTime24:"\'longdatetime24\'", ShortDateTime24:"\'shortdatetime24\'", UTC:"utc"]',
    ],
    [
      EnumConstants.StartOfWeekEnumString,
      '%n[Sunday:1, Monday:2, MondayZero:3, Tuesday:12, Wednesday:13, Thursday:14, Friday:15, Saturday:16]',
    ],
    [EnumConstants.DirectionEnumString, '%s[Start:"start", End:"end"]'],
    [EnumConstants.DisplayModeEnumString, '%s[Edit:"edit", View:"view", Disabled:"disabled"]'],
    [EnumConstants.LayoutModeEnumString, '%s[Manual:"manual", Auto:"auto"]'],
    [
      EnumConstants.LayoutAlignItemsEnumString,
      '%s[Start:"flex-start", Center:"center", End:"flex-end", Stretch:"stretch"]',
    ],
    [
      EnumConstants.AlignInContainerEnumString,
      '%s[Start:"flex-start", Center:"center", End:"flex-end", Stretch:"stretch", SetByContainer:"auto"]',
    ],
    [
      EnumConstants.LayoutJustifyContentEnumString,
      '%s[Start:"flex-start", Center:"center", End:"flex-end", SpaceBetween:"space-between"]',
    ], // SpaceEvenly:\"space-evenly\", SpaceAround:\"space-around\",
    [EnumConstants.LayoutOverflowEnumString, '%s[Hide:"hidden", Scroll:"auto"]'],
    [
      EnumConstants.FontEnumString,
      "%s['Segoe UI':\"'Segoe UI', 'Open Sans', sans-serif\", Arial:\"Arial, sans-serif\",'Lato Hairline':\"'Lato Hairline', sans-serif\", 'Lato':\"'Lato', sans-serif\"," +
        "'Lato Light':\"'Lato Light', sans-serif\", 'Courier New':\"'Courier New', monospace\",Georgia:\"Georgia, serif\", " +
        "'Dancing Script':\"'Dancing Script', sans-serif\",'Lato Black':\"'Lato Black', sans-serif\", Verdana:\"Verdana, sans-serif\", " +
        "'Open Sans':\"'Open Sans', sans-serif\",'Open Sans Condensed':\"'Open Sans Condensed', sans-serif\", 'Great Vibes':\"'Great Vibes', sans-serif\"," +
        "'Patrick Hand':\"'Patrick Hand', sans-serif\"]",
    ],
    [EnumConstants.FontWeightEnumString, '%s[Normal:"normal", Semibold:"600", Bold:"bold", Lighter:"lighter"]'],
    [
      EnumConstants.ImagePositionEnumString,
      '%s[Fill:"fill", Fit:"fit", Stretch:"stretch", Tile:"tile", Center:"center"]',
    ],
    // Keep the next two enums in order for back-compat reasons.
    // See: #9003434 and #9003431
    [EnumConstants.LayoutEnumString, '%s[Horizontal:"horizontal", Vertical:"vertical"]'],
    [EnumConstants.LayoutDirectionEnumString, '%s[Horizontal:"row", Vertical:"column"]'],
    [EnumConstants.TextPositionEnumString, '%s[Left:"left", Right:"right"]'],
    [EnumConstants.TextModeEnumString, '%s[SingleLine:"singleline", Password:"password", MultiLine:"multiline"]'],
    [EnumConstants.TextFormatEnumString, '%s[Text:"text", Number:"number"]'],
    [EnumConstants.VirtualKeyboardModeEnumString, '%s[Auto:"auto", Numeric:"numeric", Text:"text"]'],
    [EnumConstants.TeamsThemeEnumString, '%s[Default:"default", Dark:"dark", Contrast:"contrast"]'],
    [
      EnumConstants.ThemesEnumString,
      '%c[Vivid: 8573268208, Eco: 8577703760, Harvest: 8588214850, Dust: 8580980564, Awakening: 8575207804]',
    ],
    [EnumConstants.PenModeEnumString, '%s[Draw:"draw", Erase:"erase"]'],
    [EnumConstants.RemoveFlagsEnumString, '%s[First:"first", All:"all"]'],
    [
      EnumConstants.ScreenTransitionEnumString,
      '%s[Fade:"fade", Cover:"cover", UnCover:"uncover", CoverRight:"coverright", UnCoverRight:"uncoverright", None:"none"]',
    ],
    [LanguageConstants.SortOrderEnumString, '%s[Ascending:"ascending", Descending:"descending"]'],
    [EnumConstants.AlignEnumString, '%s[Left:"left", Right:"right", Center:"center", Justify:"justify"]'],
    [EnumConstants.VerticalAlignEnumString, '%s[Top:"top", Middle:"middle", Bottom:"bottom"]'],
    [EnumConstants.TransitionEnumString, '%s[Push:"push", Pop:"pop", None:"none"]'],
    [
      EnumConstants.TimeUnitEnumString,
      '%s[Years:"years", Quarters:"quarters", Months:"months", Days:"days", Hours:"hours", Minutes:"minutes", Seconds:"seconds", Milliseconds:"milliseconds"]',
    ],
    [EnumConstants.OverflowEnumString, '%s[Hidden:"hidden", Scroll:"scroll"]'],
    [EnumConstants.MapStyleEnumString, '%s[Road:"road", Aerial:"aerial", Auto:"auto"]'],
    [EnumConstants.GridStyleEnumString, '%s[All:"all", None:"none", XOnly:"xonly", YOnly:"yonly"]'],
    [EnumConstants.LabelPositionEnumString, '%s[Inside:"inside", Outside:"outside"]'],
    [
      EnumConstants.DataSourceInfoEnumString,
      '%s[DisplayName:"displayname", Required:"required", MaxLength:"maxlength", MinLength:"minlength", MaxValue:"maxvalue", MinValue:"minvalue", ' +
        'AllowedValues:"allowedvalues", EditPermission:"editpermission", ReadPermission:"readpermission", CreatePermission:"createpermission", ' +
        'DeletePermission:"deletepermission"]',
    ],
    [
      EnumConstants.RecordInfoEnumString,
      '%s[EditPermission:"editpermission", ReadPermission:"readpermission", DeletePermission:"deletepermission"]',
    ],
    [EnumConstants.StateEnumString, '%n[NoChange:1, Added:2, Updated:4, Deleted:8, All:4294967295]'],
    [EnumConstants.ErrorStateEnumString, '%n[NoError:1, DataSourceError:2, All:4294967295]'],
    [EnumConstants.ErrorSeverityEnumString, '%n[NoError:0, Warning:1, Moderate:2, Severe:3]'],
    [
      EnumConstants.ErrorKindEnumString,
      '%n[None:0, Sync:1, MissingRequired:2, CreatePermission:3, EditPermission:4, DeletePermission:5, Conflict:6, NotFound:7, ' +
        'ConstraintViolated:8, GeneratedValue:9, ReadOnlyValue:10, Validation: 11, Unknown: 12, Div0: 13, BadLanguageCode: 14, ' +
        'BadRegex: 15, InvalidFunctionUsage: 16, FileNotFound: 17, AnalysisError: 18, ReadPermission: 19, NotSupported: 20, ' +
        'InsufficientMemory: 21, QuotaExceeded: 22, Network: 23, Numeric: 24, InvalidArgument: 25, Internal: 26]',
    ],
    [EnumConstants.ZoomEnumString, '%n[FitWidth:-1, FitHeight:-2, FitBoth:-3]'], // When changing, keep in sync with AppMagic/js/controls/WebViewPdfViewer/Zoom.ts
    [EnumConstants.FormModeEnumString, '%n[Edit:0, New:1, View:2]'], // When changing, keep in sync with AppMagic/js/Core/Core.Data/Enums.ts
    [EnumConstants.PDFPasswordStateEnumString, '%n[NoPasswordNeeded:0, PasswordNeeded:1, IncorrectPassword:2]'], // When changing, keep in sync with AppMagic/js/controls/WebViewPdfViewer/WebViewPdfViewerBridge.ts
    [EnumConstants.DateTimeZoneEnumString, '%s[Local:"local", UTC:"utc"]'], // When changing, keep in sync with AppMagic/js/controls/DatePicker/DatePicker.ts
    [
      EnumConstants.BarcodeTypeEnumString,
      '%s[Auto:"any", Aztec:"aztec", Codabar:"codabar", Code128:"code128", Code39:"code39", Code93:"code93", DataMatrix:"dataMatrix", Ean:"ean", I2of5:"i2of5", Pdf417:"pdf417", QRCode:"qrCode", Rss14:"rss14", RssExpanded:"rssExpanded", Upc:"upc"]',
    ],
    [
      EnumConstants.ImageRotationEnumString,
      '%s[None:"none", Rotate90:"rotate90", Rotate180:"rotate180", Rotate270:"rotate270"]',
    ],
    [
      EnumConstants.MatchEnumString,
      '%s[Email:".+@.+\\.[^\\.][2,]", Letter:"\\p[L]", MultipleLetters:"\\p[L]+", OptionalLetters:"\\p[L]*", Digit:"\\d", MultipleDigits:"\\d+", OptionalDigits:"\\d*", Any:".", Hyphen:"\\-", Period:"\\.", Comma:",", LeftParen:"\\(", RightParen:"\\)", Space:"\\s", MultipleSpaces:"\\s+", OptionalSpaces:"\\s*", NonSpace:"\\S", MultipleNonSpaces:"\\S+", OptionalNonSpaces:"\\S*"]',
    ],
    [
      EnumConstants.MatchOptionsEnumString,
      '%s[BeginsWith:"^c", EndsWith:"$c", Contains:"c", Complete:"^c$", IgnoreCase:"i", Multiline:"m"]',
    ],
    [
      EnumConstants.JSONFormatEnumString,
      '%s[Compact:"", IndentFour:"4", IgnoreBinaryData:"G", IncludeBinaryData:"B", IgnoreUnsupportedTypes:"I"]',
    ],
    [EnumConstants.TraceOptionsEnumString, '%s[None:"none",IgnoreUnsupportedTypes:"I"]'],
    [EnumConstants.EntityFormPatternEnumString, '%s[None:"none", Details:"details", List:"list", CardList:"cardlist"]'],
    [EnumConstants.ListItemTemplateEnumString, '%s[Single:"single", Double:"double", Person:"person"]'],
    [EnumConstants.LoadingSpinnerEnumString, '%n[Controls:0, Data:1, None:2]'], // When changing, keep in sync with AppMagic/js/AppMagic.Controls/Controls/ScreenControl.tsx
    [EnumConstants.NotificationTypeEnumString, '%n[Error:0, Warning:1, Success:2, Information:3]'],
    [EnumConstants.LiveEnumString, '%s[Off:"off", Polite:"polite", Assertive:"assertive"]'],
    [
      EnumConstants.TextRoleEnumString,
      '%s[Default:"default", Heading1:"heading1", Heading2:"heading2", Heading3:"heading3", Heading4:"heading4"]',
    ],
    [EnumConstants.ScreenSizeEnumString, '%n[Small:1, Medium:2, Large:3, ExtraLarge:4]'],
    [
      EnumConstants.IconEnumString,
      '%s[Add:"builtinicon:Add", Cancel:"builtinicon:Cancel", CancelBadge:"builtinicon:CancelBadge", Edit:"builtinicon:Edit", Check:"builtinicon:Check", CheckBadge:"builtinicon:CheckBadge", Search:"builtinicon:Search", Filter:"builtinicon:Filter", FilterFlat:"builtinicon:FilterFlat", FilterFlatFilled:"builtinicon:FilterFlatFilled", Sort:"builtinicon:Sort", Reload:"builtinicon:Reload", Trash:"builtinicon:Trash", Save:"builtinicon:Save", Download:"builtinicon:Download", Copy:"builtinicon:Copy", LikeDislike:"builtinicon:LikeDislike", Crop:"builtinicon:Crop", Pin:"builtinicon:Pin", ClearDrawing:"builtinicon:ClearDrawing", ExpandView:"builtinicon:ExpandView", CollapseView:"builtinicon:CollapseView", Draw:"builtinicon:Draw", Compose:"builtinicon:Compose", Erase:"builtinicon:Erase", Message:"builtinicon:Message", Post:"builtinicon:Post", AddDocument:"builtinicon:AddDocument", AddLibrary:"builtinicon:AddLibrary", Home:"builtinicon:Home", Hamburger:"builtinicon:Hamburger", Settings:"builtinicon:Settings", More:"builtinicon:More", Waffle:"builtinicon:Waffle", ChevronLeft:"builtinicon:ChevronLeft", ChevronRight:"builtinicon:ChevronRight", ChevronUp:"builtinicon:ChevronUp", ChevronDown:"builtinicon:ChevronDown", NextArrow:"builtinicon:NextArrow", BackArrow:"builtinicon:BackArrow", ArrowDown:"builtinicon:ArrowDown", ArrowUp:"builtinicon:ArrowUp", ArrowLeft:"builtinicon:ArrowLeft", ArrowRight:"builtinicon:ArrowRight", Camera:"builtinicon:Camera", Document:"builtinicon:Document", DockCheckProperties:"builtinicon:DockCheckProperties", Folder:"builtinicon:Folder", Journal:"builtinicon:Journal", ForkKnife:"builtinicon:ForkKnife", Transportation:"builtinicon:Transportation", Airplane:"builtinicon:Airplane", Bus:"builtinicon:Bus", Cars:"builtinicon:Cars", Money:"builtinicon:Money", Currency:"builtinicon:Currency", AddToCalendar:"builtinicon:AddToCalendar", CalendarBlank:"builtinicon:CalendarBlank", OfficeBuilding:"builtinicon:OfficeBuilding", PaperClip:"builtinicon:PaperClip", Newspaper:"builtinicon:Newspaper", Lock:"builtinicon:Lock", Waypoint:"builtinicon:Waypoint", Location:"builtinicon:Location", DocumentPDF:"builtinicon:DocumentPDF", Bell:"builtinicon:Bell", ShoppingCart:"builtinicon:ShoppingCart", Phone:"builtinicon:Phone", PhoneHangUp:"builtinicon:PhoneHangUp", Mobile:"builtinicon:Mobile", Laptop:"builtinicon:Laptop", ComputerDesktop:"builtinicon:ComputerDesktop", Devices:"builtinicon:Devices", Controller:"builtinicon:Controller", Tools:"builtinicon:Tools", ToolsWrench:"builtinicon:ToolsWrench", Mail:"builtinicon:Mail", Send:"builtinicon:Send", Clock:"builtinicon:Clock", ListWatchlistRemind:"builtinicon:ListWatchlistRemind", LogJournal:"builtinicon:LogJournal", Note:"builtinicon:Note", PhotosPictures:"builtinicon:PhotosPictures", RadarActivityMonitor:"builtinicon:RadarActivityMonitor", Tablet:"builtinicon:Tablet", Tag:"builtinicon:Tag", CameraAperture:"builtinicon:CameraAperture", ColorPicker:"builtinicon:ColorPicker", DetailList:"builtinicon:DetailList", DocumentWithContent:"builtinicon:DocumentWithContent", ListScrollEmpty:"builtinicon:ListScrollEmpty", ListScrollWatchlist:"builtinicon:ListScrollWatchlist", OptionsList:"builtinicon:OptionsList", People:"builtinicon:People", Person:"builtinicon:Person", EmojiFrown:"builtinicon:EmojiFrown", EmojiSmile:"builtinicon:EmojiSmile", EmojiSad:"builtinicon:EmojiSad", EmojiNeutral:"builtinicon:EmojiNeutral", EmojiHappy:"builtinicon:EmojiHappy", Warning:"builtinicon:Warning", Information:"builtinicon:Information", Database:"builtinicon:Database", Weather:"builtinicon:Weather", TrendingHashtag:"builtinicon:TrendingHashtag", TrendingUpwards:"builtinicon:TrendingUpwards", Items:"builtinicon:Items", LevelsLayersItems:"builtinicon:LevelsLayersItems", Trending:"builtinicon:Trending", LineWeight:"builtinicon:LineWeight", Printing3D:"builtinicon:Printing3D", Import:"builtinicon:Import", Export:"builtinicon:Export", QuestionMark:"builtinicon:QuestionMark", Help:"builtinicon:Help", ThumbsDown:"builtinicon:ThumbsDown", ThumbsUp:"builtinicon:ThumbsUp", ThumbsDownFilled:"builtinicon:ThumbsDownFilled", ThumbsUpFilled:"builtinicon:ThumbsUpFilled", Undo:"builtinicon:Undo", Redo:"builtinicon:Redo", ZoomIn:"builtinicon:ZoomIn", ZoomOut:"builtinicon:ZoomOut", OpenInNewWindow:"builtinicon:OpenInNewWindow", Share:"builtinicon:Share", Publish:"builtinicon:Publish", Link:"builtinicon:Link", Sync:"builtinicon:Sync", View:"builtinicon:View", Hide:"builtinicon:Hide", Bookmark:"builtinicon:Bookmark", BookmarkFilled:"builtinicon:BookmarkFilled", Reset:"builtinicon:Reset", Blocked:"builtinicon:Blocked", DockLeft:"builtinicon:DockLeft", DockRight:"builtinicon:DockRight", LightningBolt:"builtinicon:LightningBolt", HorizontalLine:"builtinicon:HorizontalLine", VerticalLine:"builtinicon:VerticalLine", Ribbon:"builtinicon:Ribbon", Diamond:"builtinicon:Diamond", Alarm:"builtinicon:Alarm", History:"builtinicon:History", Heart:"builtinicon:Heart", Print:"builtinicon:Print", Error:"builtinicon:Error", Flag:"builtinicon:Flag", Notebook:"builtinicon:Notebook", Bug:"builtinicon:Bug", Microphone:"builtinicon:Microphone", Video:"builtinicon:Video", Shop:"builtinicon:Shop", Phonebook:"builtinicon:Phonebook", Enhance:"builtinicon:Enhance", Unlock:"builtinicon:Unlock", Calculator:"builtinicon:Calculator", Support:"builtinicon:Support", Lightbulb:"builtinicon:Lightbulb", Key:"builtinicon:Key", Scan:"builtinicon:Scan", Hospital:"builtinicon:Hospital", Health:"builtinicon:Health", Medical:"builtinicon:Medical", Manufacture:"builtinicon:Manufacture", Train:"builtinicon:Train", Globe:"builtinicon:Globe", HalfFilledCircle:"builtinicon:HalfFilledCircle", Tray:"builtinicon:Tray", AddUser:"builtinicon:AddUser", Text:"builtinicon:Text", Shirt:"builtinicon:Shirt", Signal:"builtinicon:Signal", Cut:"builtinicon:Cut", Paste:"builtinicon:Paste", Leave:"builtinicon:Leave"]',
    ],
    [EnumConstants.LaunchTargetEnumString, '%s[New:"_blank", Replace:"_self"]'],
    [EnumConstants.TraceSeverityEnumString, '%n[Information:3, Warning:1, Error:0, Critical:-1]'], // Those values should match the ones from NotificationType (whenever applicable ], since there similar values. They are mapped to AppInsights-specific values in behaviorReplacementFunctions.ts
    [EnumConstants.SelectedStateString, '%n[Edit:0, New:1, View:2]'], // When changing, keep in sync with AppMagic/js/Core/Core.Data/Enums.ts
    // #if FEATUREGATE_DOCUMENTPREVIEWFLAGS_EXTERNALMESSAGE
    //             [ EnumConstants.ExternalMessageEnumString,
    //                 "%s[BarcodeScanner:\"barcodescanner\"]" ],
    // #endif
  ])

  private _enumSymbols: Array<EnumSymbol>
  // TODO: unify _enumSymbols with this variable because they are basically the same thing
  private _enumsUsedPowerApps: Array<[DName, DName, DType]>

  protected get enumDict() {
    return this._enums
  }

  registerTuple(tuple: [string, string, string], locInfo?: Map<string, string>) {
    const tupleName = tuple[0]
    if (!this._customEnumDict.has(tupleName)) {
      this._customEnumDict = this._customEnumDict.set(tupleName, tuple)
      this.resetEnumCaches()
      if (locInfo != null) {
        if (!this._customEnumLocDict.has(tupleName))
          this._customEnumLocDict = this._customEnumLocDict.set(tupleName, locInfo)
        else this._customEnumLocDict = this._customEnumLocDict.set(tupleName, locInfo)
      }
    }
  }

  tryGetLocalizedEnumValue(enumName: string, enumValue: string): [boolean, string] {
    // Contracts.AssertValue(enumName);
    // Contracts.AssertValue(enumValue);

    let locValue: string = enumValue
    if (this._customEnumLocDict.has(enumName)) {
      const thisEnum = this._customEnumLocDict.get(enumName)
      if (thisEnum.has(enumValue)) {
        locValue = thisEnum.get(enumValue)
        return [true, locValue]
      }
    }
    return [false, locValue]
  }

  resetCustomEnums() {
    this._customEnumDict = new Dictionary()
    this._customEnumLocDict = new Dictionary()
    this.resetEnumCaches()
  }

  /// <returns>
  /// A combined mapping of enum identifier to string representation of the enum spec
  /// containing all enum within <see cref="EnumDict"/> and <see cref="_customEnumDict"/>.
  /// </returns>
  private regenerateEnumSpec() {
    // Clone dictionary, then add custom enums
    const fullEnums = new Dictionary(this.enumDict)

    for (const enumTuple of this._customEnumDict.values()) {
      fullEnums.set(enumTuple[0], enumTuple[1])
    }

    return fullEnums
  }

  /// <returns>
  /// A mapping of enum identifier to containing enum type containing all enums within
  /// <see cref="EnumDict"/> and <see cref="_customEnumDict"/>.
  /// </returns>
  private regenerateEnumTypes() {
    const enumTypes = new Dictionary<string, DType>()
    for (const enumSpec of this.enumDict) {
      const result = DType.TryParse(enumSpec[1])
      if (result[0]) {
        enumTypes.set(enumSpec[0], result[1])
      }
    }

    // For custom enums, the value by which we identify their type may be different than the value
    // that we use to identify their spec, so we need a separate loop for them.
    for (const enumSpec of this._customEnumDict.values()) {
      // Contracts.Assert(DName.IsValidDName(enumSpec.Item1));
      // Contracts.Assert(DName.IsValidDName(enumSpec.Item2));

      if (!enumTypes.has(enumSpec[0])) {
        let type = enumTypes.get(enumSpec[0])
        const rst = DType.TryParse(enumSpec[2])
        if (rst[0]) {
          type = rst[1]
          enumTypes.set(enumSpec[1], type)
        }
      }
    }
    return enumTypes
  }

  /// <summary>
  /// Static list of all enum specs
  /// </summary>
  private get enumSpec() {
    return CollectionUtils.EnsureInstanceCreated(this._enumSpec, () => {
      return this.regenerateEnumSpec()
    })
  }

  /// <summary>
  /// Enumerates the default enum declarations
  /// </summary>
  /// <returns>
  /// List of enum tuples where the first item in the tuple is the internal identifier, the second item is the
  /// invariant identifier, and the third is the enum's type
  /// </returns>
  private enums(): Array<[DName, DName, DType]> {
    this._enumTypes = CollectionUtils.EnsureInstanceCreated(this._enumTypes, () => {
      return this.regenerateEnumTypes()
    })
    this._enumsUsedPowerApps = CollectionUtils.EnsureInstanceCreated(this._enumsUsedPowerApps, () => {
      const list: Array<[DName, DName, DType]> = []
      for (const enumSpec of this.enumDict) {
        const name = new DName(enumSpec[0])
        list.push([name, name, this._enumTypes.get(enumSpec[0])])
      }
      for (const enumSpec of this._customEnumDict.values()) {
        list.push([new DName(enumSpec[0]), new DName(enumSpec[1]), this._enumTypes.get(enumSpec[1])])
      }
      return list
    })
    return this._enumsUsedPowerApps
  }

  tryGetEnumSpec(name: string): [boolean, string] {
    // Contracts.AssertNonEmpty(name);
    return this.enumSpec.tryGetValue(name)
  }

  /// <summary>
  /// Finds the desired enum spec by the invariant name.
  /// Note: The invariant name is the only name for enums in <see cref="EnumDict"/>.
  /// </summary>
  /// <param name="name">
  /// Name of the desired enum
  /// </param>
  /// <param name="dType">
  /// Will be set to the string spec representing the enum <see cref="DType"/>
  /// </param>
  /// <returns>
  /// True if a result was discovered and <see cref="dType"/> was set.  False otherwise.
  /// </returns>
  tryGetEnumSpecByInvariantName(name: string): [boolean, string] {
    // Contracts.AssertValue(name);
    let dType: string
    dType =
      this.enumDict.first((tuple) => tuple[0] === name)[1] ??
      this._customEnumDict.first((tuple) => tuple[1][1] === name)[1]?.[2]
    return [dType != null, dType]
  }

  getEnum(name: string): DType {
    // Contracts.AssertValue(name);

    let enumString: string
    const result = this.tryGetEnumSpec(name)
    enumString = result[1]
    // Contracts.AssertValue(enumString, nameof(enumString));

    let enumKind: DType
    const result2 = DType.TryParse(enumString)
    enumKind = result2[1]
    // Contracts.AssertValue(enumKind, nameof(enumKind));
    return enumKind
  }

  tryGetEnumByReference(name: string): [boolean, DType] {
    // Contracts.AssertValue(name);
    let type: DType

    for (const item of this.enums()) {
      if (item[2].tryGetEnumValue(new DName(name))[0]) {
        type = item[2]
        return [true, type]
      }
    }
    return [false, type]
  }

  get enumSymbols() {
    return this.enums().map((enumValue) => new EnumSymbol(this, enumValue[0], enumValue[1], enumValue[2]))
  }

  private resetEnumCaches() {
    this._enumSpec = this.regenerateEnumSpec()
    this._enumTypes = this.regenerateEnumTypes()
    this._enumSymbols = undefined
    this._enumsUsedPowerApps = undefined
  }
}
