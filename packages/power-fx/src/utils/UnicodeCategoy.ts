import { keys } from 'object-hash'

export enum UnicodeCategory {
  ClosePunctuation = 21,
  ConnectorPunctuation = 18,
  Control = 14,
  CurrencySymbol = 26,
  DashPunctuation = 19,
  DecimalDigitNumber = 8,
  EnclosingMark = 7,
  FinalQuotePunctuation = 23,
  Format = 0xf,
  InitialQuotePunctuation = 22,
  LetterNumber = 9,
  LineSeparator = 12,
  LowercaseLetter = 1,
  MathSymbol = 25,
  ModifierLetter = 3,
  ModifierSymbol = 27,
  NonSpacingMark = 5,
  OpenPunctuation = 20,
  OtherLetter = 4,
  OtherNotAssigned = 29,
  OtherNumber = 10,
  OtherPunctuation = 24,
  OtherSymbol = 28,
  ParagraphSeparator = 13,
  PrivateUse = 17,
  SpaceSeparator = 11,
  SpacingCombiningMark = 6,
  Surrogate = 0x10,
  TitlecaseLetter = 2,
  UppercaseLetter = 0,
}

export const UnicodeCategoryName: Record<string, string> = {
  ClosePunctuation: 'Pe',
  ConnectorPunctuation: 'Pc',
  Control: 'Cc',
  CurrencySymbol: 'Sc',
  DashPunctuation: 'Pd',
  DecimalDigitNumber: 'Nd',
  EnclosingMark: 'Me',
  FinalQuotePunctuation: 'Pf',
  Format: 'Cf',
  InitialQuotePunctuation: 'Pi',
  LetterNumber: 'Nl',
  LineSeparator: 'Zl',
  LowercaseLetter: 'Ll',
  MathSymbol: 'Sm',
  ModifierLetter: 'Lm',
  ModifierSymbol: 'Sk',
  NonSpacingMark: 'Mn',
  OpenPunctuation: 'Ps',
  OtherLetter: 'Lo',
  OtherNotAssigned: 'Cn',
  OtherNumber: 'No',
  OtherPunctuation: 'Po',
  OtherSymbol: 'So',
  ParagraphSeparator: 'Zp',
  PrivateUse: 'Co',
  SpaceSeparator: 'Zs',
  SpacingCombiningMark: 'Mc',
  Surrogate: 'Cs',
  TitlecaseLetter: 'Lt',
  UppercaseLetter: 'Lu',
}

export function getUnicodeCategoryName(ch: string) {
  const char = ch[0]
  const categories = Object.keys(UnicodeCategoryName)
  for (const category of categories) {
    const reg = new RegExp(`\\p{${UnicodeCategoryName[category]}}`, 'u')
    if (reg.test(char)) {
      return category
    }
  }
}

export function getUnicodeCategory(ch: string) {
  const name = getUnicodeCategoryName(ch)
  return (UnicodeCategory as unknown as Record<string, UnicodeCategory>)[name]
}
