import { DName } from '../utils/DName'
import { DType } from './DType'
import { TypedName } from './TypedName'

export class ErrorType {
  public static KindFieldName = 'Kind'

  public static MessageFieldName = 'Message'

  private static get ErrorDetailsSchema(): TypedName[] {
    let arr = []
    arr.push(new TypedName(DType.Number, new DName('HttpStatusCode')))
    arr.push(new TypedName(DType.String, new DName('HttpResponse')))
    return arr
  }

  /// <returns>
  /// The schema for an error value.
  /// </returns>
  private static get ReifiedErrorSchema(): TypedName[] {
    return [
      new TypedName(DType.Number, new DName(ErrorType.KindFieldName)),
      new TypedName(DType.String, new DName(ErrorType.MessageFieldName)),
      new TypedName(DType.String, new DName('Source')),
      new TypedName(DType.String, new DName('Observed')),
      new TypedName(DType.CreateRecord(...ErrorType.ErrorDetailsSchema), new DName('Details')),
    ]
  }

  /// <returns>
  /// The <see cref="DType"/> of an error value.
  /// </returns>
  public static ReifiedError(): DType {
    return DType.CreateRecord(...ErrorType.ReifiedErrorSchema)
  }

  /// <returns>
  /// The <see cref="DType"/> of a collection of error values.
  /// </returns>
  public static ReifiedErrorTable(): DType {
    return DType.CreateTable(...ErrorType.ReifiedErrorSchema)
  }
}
