import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { IRContext } from '../../ir/IRContext'
import { ErrorKind } from '../../public/ErrorKind'
import { ExpressionError } from '../../public/ExpressionError'
import { FormulaType, RecordType, TableType } from '../../public/types'
import {
  BlankValue,
  BooleanValue,
  DateTimeValue,
  DateValue,
  DValue,
  ErrorValue,
  FormulaValue,
  FormulaValueStatic,
  InMemoryRecordValue,
  InMemoryTableValue,
  NamedValue,
  NumberValue,
  RecordValue,
  StringValue,
  TableValue,
  TimeValue,
} from '../../public/values'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'
import { CommonErrors } from './CommonErrors'
import { FunctionPtr } from './Library'

export enum ReturnBehavior {
  AlwaysEvaluateAndReturnResult,
  ReturnBlankIfAnyArgIsBlank,
  ReturnEmptyStringIfAnyArgIsBlank,
  ReturnFalseIfAnyArgIsBlank,
}

export declare type TargetFunctionFullProps<T> = {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: T[]
}

export declare type TargetFunctionSimpleProps<T> = {
  irContext: IRContext
  values: T[]
}

declare type MayBePromise<T> = T | Promise<T>

export declare type TargetFunctionSimple<T extends FormulaValue> = (
  props: TargetFunctionSimpleProps<T>
) => MayBePromise<FormulaValue>

export declare type TargetFunctionFull<T extends FormulaValue> = (
  props: TargetFunctionFullProps<T>
) => MayBePromise<FormulaValue>

export declare type TargetFunctionProp<T extends FormulaValue> =
  | TargetFunctionSimple<T>
  | TargetFunctionFull<T>

export declare type TargetFunction<T extends FormulaValue> =
  | TargetFunctionSimple<T>
  | TargetFunctionFull<T>

export class LibStandardErrorHanding {
  public static IsInvalidDouble(number: number): boolean {
    return isNaN(number) || !isFinite(number)
  }

  /// <summary>
  /// A pipeline that maps blanks to a value, checks
  /// runtime types, and possibly map values to errors
  /// before filtering errors and possibly returning
  /// an ErrorValue instead of executing.
  /// </summary>
  /// <typeparam name="T">The specific FormulaValue type that the implementation of the builtin expects, for exmaple NumberValue for math functions.</typeparam>
  /// <param name="expandArguments">This stage of the pipeline can be used to expand an argument list if some of the arguments are optional and missing.</param>
  /// <param name="replaceBlankValues">This stage can be used to transform Blank() into something else, for example the number 0.</param>
  /// <param name="checkRuntimeTypes">This stage can be used to check to that all the arguments have type T, or check that all arguments have type T | Blank(), etc.</param>
  /// <param name="checkRuntimeValues">This stage can be used to generate errors if specific values occur in the arguments, for example infinity, NaN, etc.</param>
  /// <param name="returnBehavior">A flag that can be used to activate pre-defined early return behavior, such as returning Blank() if any argument is Blank().</param>
  /// <param name="targetFunction">The implementation of the builtin function.</param>
  /// <returns></returns>
  public static StandardErrorHandling<T extends FormulaValue>(
    expandArguments: (
      irContext: IRContext,
      values: Array<FormulaValue>
    ) => Array<FormulaValue>,
    replaceBlankValues: (irContext: IRContext, num: number) => FormulaValue,
    checkRuntimeTypes: (
      irContext: IRContext,
      num: number,
      value: FormulaValue
    ) => FormulaValue,
    checkRuntimeValues: (
      irContext: IRContext,
      num: number,
      value: FormulaValue
    ) => FormulaValue,
    returnBehavior: ReturnBehavior,
    targetFunction: TargetFunction<T>
  ): FunctionPtr {
    return (props: TargetFunctionFullProps<FormulaValue>) => {
      const { visitor, symbolContext, irContext, values: args } = props
      const argumentsExpanded = expandArguments(irContext, args)
      const blankValuesReplaced = argumentsExpanded.map((arg, i) => {
        if (arg instanceof BlankValue) {
          return replaceBlankValues(arg.irContext, i)
        } else {
          return arg
        }
      })
      const runtimeTypesChecked = blankValuesReplaced.map((arg, i) =>
        checkRuntimeTypes(irContext, i, arg)
      )

      const runtimeValuesChecked = runtimeTypesChecked.map((arg, i) => {
        if (arg instanceof FormulaValue) {
          return checkRuntimeValues(arg.irContext, i, arg)
        } else {
          return arg
        }
      })

      const errors = runtimeValuesChecked.filter(
        (v) => v instanceof ErrorValue
      ) as ErrorValue[]
      if (errors.length != 0) {
        return ErrorValue.Combine(irContext, errors)
      }

      switch (returnBehavior) {
        case ReturnBehavior.ReturnBlankIfAnyArgIsBlank:
          if (runtimeValuesChecked.some((arg) => arg instanceof BlankValue)) {
            return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
          }

          break
        case ReturnBehavior.ReturnEmptyStringIfAnyArgIsBlank:
          if (runtimeValuesChecked.some((arg) => arg instanceof BlankValue)) {
            return new StringValue(
              IRContext.NotInSource(FormulaType.String),
              ''
            )
          }

          break
        case ReturnBehavior.ReturnFalseIfAnyArgIsBlank:
          if (runtimeValuesChecked.some((arg) => arg instanceof BlankValue)) {
            return new BooleanValue(
              IRContext.NotInSource(FormulaType.Boolean),
              false
            )
          }

          break
        case ReturnBehavior.AlwaysEvaluateAndReturnResult:
          break
      }
      return targetFunction({
        visitor,
        symbolContext,
        irContext,
        values: runtimeValuesChecked as unknown as T[],
      })
    }
  }

  // A wrapper that allows standard error handling to apply to
  // functions which accept the simpler parameter list of
  // an array of arguments, ignoring context, runner etc.
  // private static StandardErrorHandling2<T extends FormulaValue>(
  //     expandArguments: (irContext: IRContext, values: Array<FormulaValue>) => Array<FormulaValue>,
  //     replaceBlankValues: (irContext: IRContext, num: number) => FormulaValue,
  //     checkRuntimeTypes: (irContext: IRContext, num: number, value: FormulaValue) => FormulaValue,
  //     checkRuntimeValues: (irContext: IRContext, num: number, value: FormulaValue) => FormulaValue,
  //     returnBehavior: ReturnBehavior,
  //     targetFunction: (irContext: IRContext, values: T[]) => FormulaValue,
  //     // Func<IRContext, IEnumerable<FormulaValue>, IEnumerable<FormulaValue>> expandArguments,
  //     // Func<IRContext, int, FormulaValue> replaceBlankValues,
  //     // Func<IRContext, int, FormulaValue, FormulaValue> checkRuntimeTypes,
  //     // Func<IRContext, int, FormulaValue, FormulaValue> checkRuntimeValues,
  //     // ReturnBehavior returnBehavior,
  //     // Func<IRContext, T[], FormulaValue> targetFunction
  // ): FunctionPtr
  // {
  //     return LibraryStandardErrorHanding.StandardErrorHandling<T>(expandArguments, replaceBlankValues, checkRuntimeTypes, checkRuntimeValues, returnBehavior, (runner, symbolContext, irContext, args) =>
  //     {
  //         return targetFunction(irContext, args);
  //     });
  // }

  // #region Single Column Table Functions
  public static StandardSingleColumnTable<T extends FormulaValue>(
    targetFunction: TargetFunction<T>
  ): TargetFunctionFull<TableValue> {
    return async (props: TargetFunctionFullProps<TableValue>) => {
      const { visitor: runner, symbolContext, irContext, values: args } = props
      const tableType = irContext.resultType as TableType
      const resultType = tableType.toRecord()
      const itemType = resultType.getFieldType(
        BuiltinFunction.OneColumnTableResultNameStr
      )

      const arg0 = args[0]
      const resultRows: Array<DValue<RecordValue>> = []
      for (const row of arg0.rows) {
        if (row.isValue) {
          const value = row.value.getField(
            undefined,
            BuiltinFunction.ColumnName_ValueStr
          )
          let namedValue: NamedValue
          if (value instanceof BlankValue || value instanceof ErrorValue) {
            namedValue = new NamedValue(
              BuiltinFunction.OneColumnTableResultNameStr,
              value
            )
          }
          if (value instanceof FormulaValue) {
            namedValue = new NamedValue(
              BuiltinFunction.OneColumnTableResultNameStr,
              await targetFunction({
                visitor: runner,
                symbolContext,
                irContext: IRContext.NotInSource(itemType),
                values: [value] as unknown as T[],
              })
            )
          } else {
            namedValue = new NamedValue(
              BuiltinFunction.OneColumnTableResultNameStr,
              CommonErrors.RuntimeTypeMismatch(IRContext.NotInSource(itemType))
            )
          }
          const record = new InMemoryRecordValue(
            IRContext.NotInSource(resultType),
            [namedValue]
          )
          resultRows.push(DValue.Of(record))
        } else if (row.isBlank) {
          // resultRows.Add(DValue<RecordValue>.Of(row.Blank));
          resultRows.push(DValue.Of(row.blank))
        } else {
          resultRows.push(DValue.Of(row.error))
        }
      }

      return new InMemoryTableValue(irContext, resultRows)
    }
  }

  // public static Func<EvalVisitor, SymbolContext, IRContext, TableValue[], FormulaValue> StandardSingleColumnTable<T>(Func<IRContext, T[], FormulaValue> targetFunction)
  //     where T : FormulaValue
  // {
  //     return StandardSingleColumnTable<T>((runner, symbolContext, irContext, args) => targetFunction(irContext, args));
  // }

  public static GetMaxTableSize(args: FormulaValue[]): number {
    let max = 0

    for (const arg of args) {
      if (arg instanceof TableValue) {
        max = Math.max(max, arg.rows.length)
      }
    }

    return max
  }

  public static ExpandToSize(
    arg: FormulaValue,
    size: number
  ): ExpandToSizeResult {
    let name = BuiltinFunction.ColumnName_ValueStr
    if (arg instanceof TableValue) {
      const tvType = arg.type as TableType
      name = tvType.singleColumnFieldName

      const count = arg.rows.length
      if (count < size) {
        const inputRecordType = tvType.toRecord()
        const inputRecordNamedValue = new NamedValue(
          name,
          new BlankValue(IRContext.NotInSource(FormulaType.Blank))
        )
        const inputRecord = new InMemoryRecordValue(
          IRContext.NotInSource(inputRecordType),
          [inputRecordNamedValue]
        )
        const inputDValue = DValue.Of(inputRecord)

        const repeated = [].fill(inputDValue, 0, size - count)
        const rows = arg.rows.concat(...repeated)
        return new ExpandToSizeResult(name, rows)
      } else {
        return new ExpandToSizeResult(name, arg.rows)
      }
    } else {
      const inputRecordType = new RecordType(null)
      const inputRecordNamedValue = new NamedValue(name, arg)
      const inputRecord = new InMemoryRecordValue(
        IRContext.NotInSource(inputRecordType),
        [inputRecordNamedValue]
      )
      const inputDValue = DValue.Of(inputRecord)
      const rows = [].fill(inputDValue, 0, size)
      return new ExpandToSizeResult(name, rows)
    }
  }

  // Transpose a matrix (list of lists) so that the rows become columns and the columns become rows
  // The column length is uniform and known
  public static Transpose<T>(
    columns: Array<T[]>,
    columnSize: number
  ): Array<T[]> {
    const rows: Array<T[]> = []

    for (let i = 0; i < columnSize; i++) {
      rows.push(columns.map((column) => column[i]))
    }

    return rows
  }

  /*
   * A standard error handling wrapper function that handles functions that can accept one or more table values.
   * The standard behavior for this type of function is to expand all scalars and tables into a set of tables
   * with the same size, where that size is the length of the longest table, if any. The result is always a table
   * where some operation has been performed on the transpose of the input tables.
   *
   * For example given the table function F and the operation F' and inputs [a, b] and [c, d], the transpose is [a, c], [b, d]
   * F([a, b], [c, d]) => [F'([a, c]), F'([b, d])]
   * As a concrete example, Concatenate(["a", "b"], ["1", "2"]) => ["a1", "b2"]
   */
  public static MultiSingleColumnTable(
    targetFunction: FunctionPtr
  ): TargetFunctionFull<FormulaValue> {
    return async (props: TargetFunctionFullProps<FormulaValue>) => {
      const { visitor: runner, symbolContext, irContext, values: args } = props
      const resultRows: Array<DValue<RecordValue>> = []
      const maxSize = LibStandardErrorHanding.GetMaxTableSize(args)

      if (maxSize == 0) {
        // This can happen when we expect a Table at compile time but we recieve Blank() at runtime
        // Just return an empty table with the correct type
        return new InMemoryTableValue(irContext, resultRows)
      }

      const allResults = args.map((arg) =>
        LibStandardErrorHanding.ExpandToSize(arg, maxSize)
      )

      const tableType = irContext.resultType as TableType
      const resultType = tableType.toRecord()
      const itemType = resultType.getFieldType(
        BuiltinFunction.OneColumnTableResultNameStr
      )

      const transposed = LibStandardErrorHanding.Transpose(
        allResults.map((result) => result.rows),
        maxSize
      )
      const names = allResults.map((result) => result.name)
      for (const list of transposed) {
        const errorRow = list.filter((dv) => dv.isError)[0]
        if (errorRow != null) {
          resultRows.push(DValue.Of<RecordValue>(errorRow.error))
          continue
        }

        const targetArgs = list.map((dv, i) =>
          dv.isValue ? dv.value.getField(names[i]) : dv.toFormulaValue()
        )

        const namedValue = new NamedValue(
          BuiltinFunction.OneColumnTableResultNameStr,
          await targetFunction({
            visitor: runner,
            symbolContext,
            irContext: IRContext.NotInSource(itemType),
            values: targetArgs,
          })
        )
        const record = new InMemoryRecordValue(
          IRContext.NotInSource(resultType),
          [namedValue]
        )
        resultRows.push(DValue.Of(record))
      }

      return new InMemoryTableValue(irContext, resultRows)
    }
  }
  // #endregion

  // #region Common Arg Expansion Pipeline Stages
  public static InsertDefaultValues(
    outputArgsCount: number,
    fillWith: FormulaValue
  ): (
    irContext: IRContext,
    values: Array<FormulaValue>
  ) => Array<FormulaValue> {
    return (irContext, args) => {
      const res: Array<FormulaValue> = args
      while (res.length < outputArgsCount) {
        res.push(fillWith)
      }
      return res
    }
  }

  public static MidFunctionExpandArgs(
    irContext: IRContext,
    args: Array<FormulaValue>
  ): Array<FormulaValue> {
    const res = [...args]
    while (res.length < 3) {
      // The third argument to Mid can only ever be used if the first argument is a string
      if (args[0] instanceof StringValue) {
        const count = new NumberValue(
          IRContext.NotInSource(FormulaType.Number),
          args[0].value.length
        )
        res.push(count)
      } else {
        break
      }
    }

    return res
  }
  // #endregion

  // #region Common Blank Replacement Pipeline Stages
  public static ReplaceBlankWithZero(
    irContext: IRContext,
    index: number
  ): FormulaValue {
    return new NumberValue(IRContext.NotInSource(FormulaType.Number), 0.0)
  }

  public static ReplaceBlankWithEmptyString(
    irContext: IRContext,
    index: number
  ): FormulaValue {
    return new StringValue(IRContext.NotInSource(FormulaType.String), '')
  }

  public static ReplaceBlankWith(
    ...values: FormulaValue[]
  ): (irContext: IRContext, num: number) => FormulaValue {
    return (irContext, index) => {
      return values[index]
    }
  }

  public static ReplaceBlankWithZeroForSpecificIndices(
    ...indices: number[]
  ): (irContext: IRContext, num: number) => FormulaValue {
    const indicesToReplace = new Set<number>(indices)
    return (irContext, index) => {
      if (indicesToReplace.has(index)) {
        return new NumberValue(IRContext.NotInSource(FormulaType.Number), 0.0)
      }

      return new BlankValue(irContext)
    }
  }
  // #endregion

  public static ExactValueTypeProvider(type: string) {
    return (irContext: IRContext, index: number, arg: FormulaValue) =>
      LibStandardErrorHanding.ExactValueType(irContext, index, arg, type)
  }

  // #region Common Type Checking Pipeline Stages
  public static ExactValueType(
    irContext: IRContext,
    index: number,
    arg: FormulaValue,
    type: string
  ): FormulaValue {
    // TODO: 确认 valueType的方式需要调整
    if (
      arg instanceof ErrorValue ||
      FormulaValueStatic.CheckFormulaValueType(arg, type)
    ) {
      return arg
    } else {
      return CommonErrors.RuntimeTypeMismatch(irContext)
    }
  }

  public static ExactValueTypeOrBlankProvider(type: string) {
    return (irContext: IRContext, index: number, arg: FormulaValue) =>
      LibStandardErrorHanding.ExactValueTypeOrBlank(irContext, index, arg, type)
  }

  public static ExactValueTypeOrBlank(
    irContext: IRContext,
    index: number,
    arg: FormulaValue,
    type: string
  ): FormulaValue {
    if (arg instanceof BlankValue) {
      return arg
    } else {
      return LibStandardErrorHanding.ExactValueType(irContext, index, arg, type)
    }
  }

  public static ExactValueTypeOrTableOrBlankProvider(type: string) {
    return (irContext: IRContext, index: number, arg: FormulaValue) =>
      LibStandardErrorHanding.ExactValueTypeOrTableOrBlank(
        irContext,
        index,
        arg,
        type
      )
  }

  public static ExactValueTypeOrTableOrBlank(
    irContext: IRContext,
    index: number,
    arg: FormulaValue,
    type: string
  ): FormulaValue {
    if (arg instanceof TableValue) {
      return arg
    } else {
      return LibStandardErrorHanding.ExactValueTypeOrBlank(
        irContext,
        index,
        arg,
        type
      )
    }
  }

  public static ExactSequence(
    ...runtimeChecks: Array<
      (irContext: IRContext, index: number, arg: FormulaValue) => FormulaValue
    >
  ) {
    return (irContext: IRContext, index: number, arg: FormulaValue) => {
      return runtimeChecks[index](irContext, index, arg)
    }
  }

  public static AddColumnsTypeChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    if (index == 0) {
      return LibStandardErrorHanding.ExactValueTypeOrBlank(
        irContext,
        index,
        arg,
        'TableValue'
      )
    } else if (index % 2 == 1) {
      return LibStandardErrorHanding.ExactValueTypeOrBlank(
        irContext,
        index,
        arg,
        'StringValue'
      )
    } else {
      return LibStandardErrorHanding.ExactValueTypeOrBlank(
        irContext,
        index,
        arg,
        'LambdaFormulaValue'
      )
    }
  }

  public static DateOrDateTime(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    if (
      arg instanceof DateValue ||
      arg instanceof DateTimeValue ||
      arg instanceof BlankValue ||
      arg instanceof ErrorValue
    ) {
      return arg
    }

    return CommonErrors.RuntimeTypeMismatch(irContext)
  }

  public static TimeOrDateTime(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    if (
      arg instanceof TimeValue ||
      arg instanceof DateTimeValue ||
      arg instanceof BlankValue ||
      arg instanceof ErrorValue
    ) {
      return arg
    }

    return CommonErrors.RuntimeTypeMismatch(irContext)
  }
  // #endregion

  // #region Common Runtime Value Checking Pipeline Stages
  public static FiniteChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    if (arg instanceof NumberValue) {
      const number = arg.value
      if (isNaN(number)) {
        return CommonErrors.ArgumentOutOfRange(irContext)
      }
    }

    return arg
  }

  public static PositiveNumberChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    const finiteCheckResult = LibStandardErrorHanding.FiniteChecker(
      irContext,
      index,
      arg
    )
    if (finiteCheckResult instanceof NumberValue) {
      const number = finiteCheckResult.value
      if (number < 0) {
        return CommonErrors.ArgumentOutOfRange(irContext)
      }
    }

    return arg
  }

  public static StrictPositiveNumberChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    const finiteCheckResult = LibStandardErrorHanding.FiniteChecker(
      irContext,
      index,
      arg
    )
    if (finiteCheckResult instanceof NumberValue) {
      const number = finiteCheckResult.value
      if (number <= 0) {
        return CommonErrors.ArgumentOutOfRange(irContext)
      }
    }

    return arg
  }

  public static DivideByZeroChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    const finiteCheckResult = LibStandardErrorHanding.FiniteChecker(
      irContext,
      index,
      arg
    )
    if (index == 1 && finiteCheckResult instanceof NumberValue) {
      const number = finiteCheckResult.value
      if (number == 0) {
        return CommonErrors.DivByZeroError(irContext)
      }
    }

    return arg
  }

  public static ReplaceChecker(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    if (index == 1) {
      if (arg instanceof BlankValue) {
        return new ErrorValue(
          irContext,
          new ExpressionError(
            'The second parameter to the Replace function cannot be Blank()',
            irContext.sourceContext,
            ErrorKind.InvalidFunctionUsage
          )
        )
      }

      const finiteCheckResult = LibStandardErrorHanding.FiniteChecker(
        irContext,
        index,
        arg
      )
      if (finiteCheckResult instanceof NumberValue) {
        let number = finiteCheckResult.value
        if (number <= 0) {
          return CommonErrors.ArgumentOutOfRange(irContext)
        }
      }

      return finiteCheckResult
    }

    if (index == 2) {
      return LibStandardErrorHanding.PositiveNumberChecker(
        irContext,
        index,
        arg
      )
    }

    return arg
  }
  // #endregion

  // #region No Op Pipeline Stages
  public static NoArgExpansion(
    irContext: IRContext,
    args: Array<FormulaValue>
  ) {
    return args
  }

  public static DoNotReplaceBlank(irContext: IRContext, index: number) {
    return new BlankValue(irContext)
  }

  // // This function should be used when type checking is too unique and needs to be located
  // // within the body of the builtin function itself
  public static DeferRuntimeTypeChecking(
    irContext: IRContext,
    index: number,
    arg: FormulaValue
  ): FormulaValue {
    return arg
  }

  public static DeferRuntimeValueChecking<T extends FormulaValue>(
    irContext: IRContext,
    index: number,
    arg: T
  ): FormulaValue {
    return arg
  }
  // #endregion
}

class ExpandToSizeResult {
  public readonly name: string
  public readonly rows: Array<DValue<RecordValue>>

  constructor(name: string, rows: Array<DValue<RecordValue>>) {
    this.name = name
    this.rows = rows
  }
}
