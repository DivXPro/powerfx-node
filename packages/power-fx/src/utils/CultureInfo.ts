export enum CultureTypes {
  AllCultures = 0x7,
  // [Obsolete ("This value has been deprecated.  Please use other values in CultureTypes.")]
  FrameworkCultures = 0x40,
  InstalledWin32Cultures = 0x4,
  NeutralCultures = 0x1,
  ReplacementCultures = 0x10,
  SpecificCultures = 0x2,
  UserCustomCulture = 0x8,
  // [Obsolete ("This value has been deprecated.  Please use other values in CultureTypes.")]
  WindowsOnlyCultures = 0x20,
}

export enum DigitShapes {
  Context = 0,
  NativeNational = 2,
  None = 1,
}

export interface INumberFormatInfo {
  // currencyDecimalDigits: number
  // currencyDecimalSeparator: string
  // currencyGroupSeparator: string
  // currencyGroupSizes: number[]
  // currencyNegativePattern: number
  // currencyPositivePattern: number
  // currencySymbol: string
  digitSubstitution: DigitShapes
  // isReadOnly: boolean
  // naNSymbol: string
  // nativeDigits: string[]
  // negativeInfinitySymbol: string
  // negativeSign: string
  numberDecimalDigits: number
  numberDecimalSeparator: string
  // numberGroupSeparator: string
  // numberGroupSizes: number[]
  // numberNegativePattern: number
  // percentDecimalDigits: number
  // percentDecimalSeparator: string
  // percentGroupSeparator: string
  // percentGroupSizes: number[]
  // percentNegativePattern: number
  // percentPositivePattern: number
  // percentSymbol: string
  // perMilleSymbol: string
  // positiveInfinitySymbol: string
  // positiveSign: string
}

export interface ITextInfo {
  listSeparator: string
}

export class CultureInfo {
  private _name: string
  public numberFormat: INumberFormatInfo
  public textInfo: ITextInfo
  public get name() {
    return this._name
  }
  constructor(name: string) {
    this._name = name
    this.numberFormat = {
      digitSubstitution: DigitShapes.None,
      numberDecimalDigits: 2,
      numberDecimalSeparator: '.',
    }
    this.textInfo = {
      listSeparator: ',',
    }
  }
  private static _currentCulture: CultureInfo = new CultureInfo('zh-cn')
  private static _currentUICulture: CultureInfo = new CultureInfo('zh-cn')

  static set CurrentCulture(cultureInfo: CultureInfo) {
    CultureInfo._currentCulture = cultureInfo
  }
  static set CurrentUICulture(cultureInfo: CultureInfo) {
    CultureInfo._currentUICulture = cultureInfo
  }
  static get CurrentCulture() {
    return CultureInfo._currentCulture
  }
  static get CurrentUICulture() {
    return CultureInfo._currentUICulture
  }
}

// export interface ICultureInfo {
//   // calendar: Calendar
//   // compareInfo: CompareInfo
//   cultureTypes: CultureTypes
//   // dateTimeFormat: DateTimeFormatInfo
//   displayName: string
//   englishName: string
//   letfLanguageTag: string
//   isNeutralCulture: boolean
//   isReadOnly: boolean
//   keyboardLayoutId: number
//   LCID: number
//   name: string
//   nativeName: string
//   numberFormat: INumberFormatInfo
//   // optionalCalendars: Calendar[]
//   parent: CultureInfo
//   // textInfo: TextInfo
//   threeLetterISOLanguageName: string
//   threeLetterWindowsLanguageName: string
//   twoLetterISOLanguageName: string
//   useUserOverride: boolean
// }
