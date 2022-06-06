import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization/Strings'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { LanguageConstants } from '../../utils/LanguageConstants'

export class ClockFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(functionInvariantName: string, functionDescription: StringGetter) {
    super(
      new DPath().append(new DName(LanguageConstants.InvariantClockNamespace)),
      functionInvariantName,
      undefined,
      functionDescription,
      FunctionCategories.DateTime,
      DType.CreateTable(new TypedName(DType.String, new DName('Value'))),
      0,
      0,
      0,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]]
  }
}

// Clock.AmPm()
export class AmPmFunction extends ClockFunction {
  constructor() {
    super('AmPm', TexlStrings.AboutClock__AmPm)
  }
}

// Clock.AmPmShort()
export class AmPmShortFunction extends ClockFunction {
  constructor() {
    super('AmPmShort', TexlStrings.AboutClock__AmPmShort)
  }
}

// Clock.IsClock24()
export class IsClock24Function extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      new DPath().append(new DName(LanguageConstants.InvariantClockNamespace)),
      'IsClock24',
      undefined,
      TexlStrings.AboutClock__IsClock24,
      FunctionCategories.DateTime,
      DType.Boolean,
      0,
      0,
      0,
    )
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[]]
  }
}
