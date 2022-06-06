import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { LanguageConstants } from '../../utils/LanguageConstants'

export abstract class CalendarFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(functionInvariantName: string, functionDescription: StringGetter) {
    super(
      new DPath().append(new DName(LanguageConstants.InvariantCalendarNamespace)),
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
    return []
  }
}

// Calendar.MonthsLong()
export class MonthsLongFunction extends CalendarFunction {
  constructor() {
    super('MonthsLong', TexlStrings.AboutCalendar__MonthsLong)
  }
}

// Calendar.MonthsShort()
export class MonthsShortFunction extends CalendarFunction {
  constructor() {
    super('MonthsShort', TexlStrings.AboutCalendar__MonthsShort)
  }
}

// Calendar.WeekdaysLong()
export class WeekdaysLongFunction extends CalendarFunction {
  constructor() {
    super('WeekdaysLong', TexlStrings.AboutCalendar__WeekdaysLong)
  }
}

// Calendar.WeekdaysShort()
export class WeekdaysShortFunction extends CalendarFunction {
  constructor() {
    super('WeekdaysShort', TexlStrings.AboutCalendar__WeekdaysShort)
  }
}
