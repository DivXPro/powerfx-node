import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { DType } from '../../types'
import { TypedName } from '../../types/TypedName'
import { FunctionCategories } from '../../types/FunctionCategories'
import { DName } from '../../utils/DName'

// Sequence(records:n, start:n, step:n): *[Value:n]
export class SequenceFunction extends BuiltinFunction {
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
      'Sequence',
      undefined,
      TexlStrings.AboutSequence,
      FunctionCategories.MathAndStat,
      DType.CreateTable(new TypedName(DType.Number, new DName('Value'))),
      0,
      1,
      3,
      DType.Number,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [
      [TexlStrings.SequenceArg1],
      [TexlStrings.SequenceArg1, TexlStrings.SequenceArg2],
      [TexlStrings.SequenceArg1, TexlStrings.SequenceArg2, TexlStrings.SequenceArg3],
    ]
  }
}
