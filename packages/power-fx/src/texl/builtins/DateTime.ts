// #pragma warning disable SA1402 // File may only contain a single type
// #pragma warning disable SA1649 // File name should match first type name

import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import {
  DelegationCapability,
  OperationCapabilityMetadata,
} from '../../functions/delegation'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Date()
// Equivalent DAX/Excel function: Date
export class DateFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Date',
      undefined,
      TexlStrings.AboutDate,
      FunctionCategories.DateTime,
      DType.Date,
      0,
      3,
      3,
      DType.Number,
      DType.Number,
      DType.Number
    )
  }

  public getSignatures() {
    return [[TexlStrings.DateArg1, TexlStrings.DateArg2, TexlStrings.DateArg3]]
  }
}

// Base for all extract date/time functions.
export abstract class ExtractDateTimeFunctionBase extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor(
    name: string,
    description: StringGetter,
    fc: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number,
    ...paramTypes: DType[]
  ) {
    // Contracts.Assert(arityMin == 1);
    // Contracts.Assert(arityMax == 1);
    // Contracts.Assert(paramTypes[0] == DType.DateTime);
    super(
      undefined,
      name,
      undefined,
      description,
      fc,
      returnType,
      maskLambdas,
      arityMin,
      arityMax,
      ...paramTypes
    )
  }

  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    return super.isRowScopedServerDelegatable(callNode, binding, metadata)
  }
}

// Time()
// Equivalent DAX/Excel function: Time
export class TimeFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Time',
      undefined,
      TexlStrings.AboutTime,
      FunctionCategories.DateTime,
      DType.Time,
      0,
      3,
      4,
      DType.Number,
      DType.Number,
      DType.Number,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.TimeArg1, TexlStrings.TimeArg2, TexlStrings.TimeArg3],
      [
        TexlStrings.TimeArg1,
        TexlStrings.TimeArg2,
        TexlStrings.TimeArg3,
        TexlStrings.TimeArg4,
      ],
    ]
  }
}

// Year()
// Equivalent DAX/Excel function: Year
export class YearFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Year',
      TexlStrings.AboutYear,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Year | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.YearArg1]]
  }
}

// Month()
// Equivalent DAX/Excel function: Month
export class MonthFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Month',
      TexlStrings.AboutMonth,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Month | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.MonthArg1]]
  }
}

// Day()
// Equivalent DAX/Excel function: Day
export class DayFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Day',
      TexlStrings.AboutDay,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Day | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.DayArg1]]
  }
}

// Hour()
// Equivalent DAX/Excel function: Hour
export class HourFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Hour',
      TexlStrings.AboutHour,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Hour | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.HourArg1]]
  }
}

// Minute()
// Equivalent DAX/Excel function: Minute
export class MinuteFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Minute',
      TexlStrings.AboutMinute,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Minute | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.MinuteArg1]]
  }
}

// Second()
// Equivalent DAX/Excel function: Second
export class SecondFunction extends ExtractDateTimeFunctionBase {
  constructor() {
    super(
      'Second',
      TexlStrings.AboutSecond,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public get functionDelegationCapability() {
    return new DelegationCapability(
      DelegationCapability.Second | DelegationCapability.Add
    )
  }

  public getSignatures() {
    return [[TexlStrings.SecondArg1]]
  }
}

// Weekday(date:d, [startOfWeek:n])
// Equivalent DAX/Excel function: Weekday
export class WeekdayFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor() {
    super(
      undefined,
      'Weekday',
      undefined,
      TexlStrings.AboutWeekday,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      2,
      DType.DateTime,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.WeekdayArg1],
      [TexlStrings.WeekdayArg1, TexlStrings.WeekdayArg2],
    ]
  }
}

// WeekNum(date:d, [startOfWeek:n])
// Equivalent DAX/Excel function: WeekNum
export class WeekNumFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor() {
    super(
      undefined,
      'WeekNum',
      undefined,
      TexlStrings.AboutWeekNum,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      2,
      DType.DateTime,
      DType.Number
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.WeekNumArg1],
      [TexlStrings.WeekNumArg1, TexlStrings.WeekNumArg2],
    ]
  }
}

// ISOWeekNum(date:d)
// Return the week number for a given date using ISO semantics.
export class ISOWeekNumFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'ISOWeekNum',
      undefined,
      TexlStrings.AboutISOWeekNum,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      1,
      1,
      DType.DateTime
    )
  }

  public getSignatures() {
    return [[TexlStrings.ISOWeekNumArg1]]
  }
}

export abstract class DateTimeGenericFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get requiresErrorContext() {
    return true
  }

  public get hasPreciseErrors() {
    return true
  }

  constructor(name: string, description: StringGetter, returnType: DType) {
    super(
      undefined,
      name,
      undefined,
      description,
      FunctionCategories.DateTime,
      returnType,
      0,
      1,
      2,
      DType.String,
      DType.String
    )
  }

  public hasSuggestionsForParam(index: number) {
    return index == 1
  }
}

// DateValue(date_text:s, [languageCode:s]) : D
export class DateValueFunction extends DateTimeGenericFunction {
  public get hasPreciseErrors() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super('DateValue', TexlStrings.AboutDateValue, DType.Date)
  }

  public getSignatures() {
    return [
      [TexlStrings.DateValueArg1],
      [TexlStrings.DateValueArg1, TexlStrings.DateValueArg2],
    ]
  }
}

// TimeValue(time_text:s, [languageCode:s]) : T
export class TimeValueFunction extends DateTimeGenericFunction {
  public get hasPreciseErrors() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super('TimeValue', TexlStrings.AboutTimeValue, DType.Time)
  }

  public getSignatures() {
    return [
      [TexlStrings.TimeValueArg1],
      [TexlStrings.TimeValueArg1, TexlStrings.TimeValueArg2],
    ]
  }
}

// DateTimeValue(time_text:s, [languageCode:s]) : d
export class DateTimeValueFunction extends DateTimeGenericFunction {
  public get hasPreciseErrors() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super('DateTimeValue', TexlStrings.AboutDateTimeValue, DType.DateTime)
  }

  public getSignatures() {
    return [
      [TexlStrings.DateTimeValueArg1],
      [TexlStrings.DateTimeValueArg1, TexlStrings.DateTimeValueArg2],
    ]
  }
}

// DateAdd(timestamp: d, delta: n, [ unit: TimeUnits ]) : d
export class DateAddFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  static readonly SubDayStringList: string[] = [
    'Hours',
    'Minutes',
    'Seconds',
    'Milliseconds',
  ]

  constructor() {
    super(
      undefined,
      'DateAdd',
      undefined,
      TexlStrings.AboutDateAdd,
      FunctionCategories.DateTime,
      DType.DateTime,
      0,
      2,
      3,
      DType.DateTime,
      DType.Number,
      DType.String
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.DateAddArg1, TexlStrings.DateAddArg2],
      [
        TexlStrings.DateAddArg1,
        TexlStrings.DateAddArg2,
        TexlStrings.DateAddArg3,
      ],
    ]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number): boolean {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 2
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    const result = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = result[0]
    let { returnType, nodeToCoercedTypeMap } = result[1]
    // Contracts.Assert(returnType == DType.DateTime);

    const type0 = argTypes[0]

    if (fValid) {
      // Arg0 should be either a DateTime or Date.
      if (type0.kind == DKind.Date) {
        // Max resolution we support right now is "Days". If we start supporting sub-day resolutions
        // then we need to revisit this and return DateTime in those cases.
        returnType = DType.Date
      } else if (type0.kind == DKind.DateTime) {
        returnType = this.returnType
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[0],
          TexlStrings.ErrDateExpected
        )
        returnType = this.returnType
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}

// DateAdd(timestamp:d|*[d], delta:n|*[n], [unit:TimeUnits])
export class DateAddTFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'DateAdd',
      undefined,
      TexlStrings.AboutDateAddT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      3
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.DateAddTArg1, TexlStrings.DateAddTArg2],
      [
        TexlStrings.DateAddTArg1,
        TexlStrings.DateAddTArg2,
        TexlStrings.DateAddTArg3,
      ],
    ]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    const result = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = result[0]
    let { returnType, nodeToCoercedTypeMap } = result[1]
    let type0 = argTypes[0]
    let type1 = argTypes[1]

    // Arg0 should be either a date/dateTime or a column of dates/dateTimes.
    // Its type dictates the function return type.
    if (type0.isTable) {
      // Ensure we have a one-column table of dates/dateTimes. Since dateTime is the supertype, checking
      // for DateTime alone is sufficient.
      const rst = this.checkDateColumnType(
        type0,
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = rst[1]
      fValid &&= rst[0]

      // Borrow the return type from the 1st arg
      returnType = type0
    } else {
      if (type0.kind == DKind.DateTime) {
        returnType = DType.CreateTable(
          new TypedName(
            DType.DateTime,
            BuiltinFunction.OneColumnTableResultName
          )
        )
      } else if (type0.kind == DKind.Date) {
        returnType = DType.CreateTable(
          new TypedName(DType.Date, BuiltinFunction.OneColumnTableResultName)
        )
      } else if (type0.coercesTo(DType.DateTime)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[0],
          DType.DateTime
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[0],
          TexlStrings.ErrDateExpected
        )
      }
    }

    // Arg1 should be either a number or a column of numbers.
    if (type1.isTable) {
      const rst = this.checkNumericColumnType(
        type1,
        args[1],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = rst[1]
      fValid &&= rst[0]
    } else if (!DType.Number.accepts(type1)) {
      if (type1.coercesTo(DType.Number)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[1],
          DType.Number
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[1],
          TexlStrings.ErrNumberExpected
        )
      }
    }

    const hasUnits = args.length == 3
    if (hasUnits && !DType.String.accepts(argTypes[2])) {
      // Arg2 should be a string
      fValid = false
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[2],
        TexlStrings.ErrStringExpected
      )
    }

    // At least one arg has to be a table.
    if (!(type0.isTable || type1.isTable)) {
      fValid = false
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrTypeError
      )
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrTypeError
      )
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}

// DateDiff(startdate: d, enddate : d, [ unit: TimeUnits ]) : n
export class DateDiffFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  public get hasPreciseErrors() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'DateDiff',
      undefined,
      TexlStrings.AboutDateDiff,
      FunctionCategories.DateTime,
      DType.Number,
      0,
      2,
      3,
      DType.DateTime,
      DType.DateTime,
      DType.String
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.DateDiffArg1, TexlStrings.DateDiffArg2],
      [
        TexlStrings.DateDiffArg1,
        TexlStrings.DateDiffArg2,
        TexlStrings.DateDiffArg3,
      ],
    ]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex == 2
  }
}

// DateDiffT(start:d|*[d], end:d|*[d], [unit:TimeUnits])
export class DateDiffTFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }
  public get isSelfContained() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'DateDiff',
      undefined,
      TexlStrings.AboutDateDiffT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      3
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.DateDiffTArg1, TexlStrings.DateDiffTArg2],
      [
        TexlStrings.DateDiffTArg1,
        TexlStrings.DateDiffTArg2,
        TexlStrings.DateDiffTArg3,
      ],
    ]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    const result = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = result[0]
    let { returnType, nodeToCoercedTypeMap } = result[1]

    const type0 = argTypes[0]
    const type1 = argTypes[1]

    returnType = DType.CreateTable(
      new TypedName(DType.Number, BuiltinFunction.OneColumnTableResultName)
    )

    // Arg0 should be either a date or a column of dates.
    if (type0.isTable) {
      // Ensure we have a one-column table of dates
      const rst = this.checkDateColumnType(
        type0,
        args[0],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = rst[1]
      fValid &&= rst[0]
    } else if (!DType.DateTime.accepts(type0)) {
      if (type0.coercesTo(DType.DateTime)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[0],
          DType.DateTime
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[0],
          TexlStrings.ErrDateExpected
        )
      }
    }

    // Arg1 should be either a a date or a column of dates.
    if (type1.isTable) {
      // Ensure we have a one-column table of dates
      const rst = this.checkDateColumnType(
        type1,
        args[1],
        errors,
        nodeToCoercedTypeMap
      )
      nodeToCoercedTypeMap = rst[1]

      fValid &&= rst[0]
    } else if (!DType.DateTime.accepts(type1)) {
      if (type1.coercesTo(DType.DateTime)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[1],
          DType.DateTime
        )
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[1],
          TexlStrings.ErrDateExpected
        )
      }
    }

    let hasUnits = args.length == 3
    if (hasUnits && !DType.String.accepts(argTypes[2])) {
      // Arg2 should be a string
      fValid = false
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[2],
        TexlStrings.ErrStringExpected
      )
    }

    // At least one arg has to be a table.
    if (!(type0.isTable || type1.isTable)) {
      fValid = false
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrTypeError
      )
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrTypeError
      )
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
// #pragma warning restore SA1402 // File may only contain a single type
// #pragma warning restore SA1649 // File name should match first type name
