import { IRContext } from '../../ir/IRContext'
import { ErrorKind } from '../../public/ErrorKind'
import { ExpressionError } from '../../public/ExpressionError'
import { ErrorValue } from '../../public/values/ErrorValue'

export class CommonErrors {
  public static RuntimeTypeMismatch(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError('Runtime type mismatch', irContext.sourceContext, ErrorKind.Validation),
    )
  }

  public static ArgumentOutOfRange(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError('Argument out of range', irContext.sourceContext, ErrorKind.Numeric),
    )
  }

  public static DivByZeroError(irContext: IRContext): ErrorValue {
    return new ErrorValue(irContext, new ExpressionError('Divide by zero', irContext.sourceContext, ErrorKind.Div0))
  }

  public static InvalidDateTimeError(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError('The Date/Time could not be parsed', irContext.sourceContext, ErrorKind.BadLanguageCode),
    )
  }

  public static InvalidNumberFormatError(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError('The Number could not be parsed', irContext.sourceContext, ErrorKind.BadLanguageCode),
    )
  }

  public static InvalidBooleanFormatError(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError(
        'The value could not be interpreted as a Boolean',
        irContext.sourceContext,
        ErrorKind.BadLanguageCode,
      ),
    )
  }

  public static UnreachableCodeError(irContext: IRContext): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError('Unknown error', irContext.sourceContext, ErrorKind.Validation),
    )
  }

  public static NotYetImplementedError(irContext: IRContext, message: string): ErrorValue {
    return new ErrorValue(
      irContext,
      new ExpressionError(`Not implemented: ${message}`, irContext.sourceContext, ErrorKind.NotSupported),
    )
  }
}
