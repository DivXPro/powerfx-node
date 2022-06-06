import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { IRContext } from '../../ir/IRContext'
import { ErrorKind } from '../../public/ErrorKind'
import { ExpressionError } from '../../public/ExpressionError'
import { ExternalType, ExternalTypeKind, FormulaType, TableType } from '../../public/types'
import {
  BlankValue,
  BooleanValue,
  DValue,
  ErrorValue,
  FormulaValue,
  InMemoryRecordValue,
  InMemoryTableValue,
  NamedValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '../../public/values'
import { UntypedObjectValue } from '../../public/values/UntypedObjectValue'
import { CommonErrors } from './CommonErrors'
import { TargetFunctionFullProps } from './StandardErrorHanding'

export function Index_UO(props: { irContext: IRContext; values: FormulaValue[] }): FormulaValue {
  const arg0 = props.values[0] as UntypedObjectValue
  const arg1 = props.values[1] as NumberValue

  const element = arg0.impl

  const len = element.getArrayLength()
  const index1 = arg1.value
  const index0 = index1 - 1

  // Error pipeline already caught cases of too low.
  if (index0 <= len) {
    const result = element.at(index0) // 1-based index

    // Map null to blank
    if (result == null || result.type === FormulaType.Blank) {
      return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    }
    return new UntypedObjectValue(props.irContext, result)
  } else {
    return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    return CommonErrors.ArgumentOutOfRange(props.irContext)
  }
}

export function Value_UO(props: TargetFunctionFullProps<UntypedObjectValue>) {
  const impl = props.values[0].impl

  if (impl.type === FormulaType.Number) {
    const num = impl.getNumber()
    if (isNaN(num)) {
      return CommonErrors.ArgumentOutOfRange(props.irContext)
    }

    return new NumberValue(props.irContext, num)
  }

  return CommonErrors.RuntimeTypeMismatch(props.irContext)
}

export function Text_UO(props: TargetFunctionFullProps<UntypedObjectValue>) {
  const impl = props.values[0].impl

  if (impl.type === FormulaType.String) {
    const str = impl.getString()
    return new StringValue(props.irContext, str)
  }

  return CommonErrors.RuntimeTypeMismatch(props.irContext)
}

export function Table_UO(props: TargetFunctionFullProps<UntypedObjectValue>): FormulaValue {
  const tableType = props.irContext.resultType as TableType
  const resultType = tableType.toRecord()
  const itemType = resultType.getFieldType(BuiltinFunction.ColumnName_ValueStr)

  const resultRows: Array<DValue<RecordValue>> = []

  const len = props.values[0].impl.getArrayLength()

  for (let i = 0; i < len; i++) {
    const element = props.values[0].impl.at(i)

    const namedValue = new NamedValue(
      BuiltinFunction.ColumnName_ValueStr,
      new UntypedObjectValue(IRContext.NotInSource(itemType), element),
    )
    const record = new InMemoryRecordValue(IRContext.NotInSource(resultType), [namedValue])
    resultRows.push(DValue.Of<RecordValue>(record))
  }

  return new InMemoryTableValue(props.irContext, resultRows)
}

export function UntypedObjectArrayChecker(irContext: IRContext, index: number, arg: FormulaValue): FormulaValue {
  if (arg instanceof UntypedObjectValue) {
    if (arg.impl.type instanceof ExternalType && arg.impl.type.kind === ExternalTypeKind.Array) {
      return new ErrorValue(
        irContext,
        new ExpressionError(
          'The CustomObject does not represent an array',
          irContext.sourceContext,
          ErrorKind.InvalidFunctionUsage,
        ),
      )
    }
  }
  return arg
}

export function Boolean_UO(props: TargetFunctionFullProps<UntypedObjectValue>): FormulaValue {
  const impl = props.values[0].impl

  if (impl.type === FormulaType.Boolean) {
    const b = impl.getBoolean()
    return new BooleanValue(props.irContext, b)
  }

  return CommonErrors.RuntimeTypeMismatch(props.irContext)
}
