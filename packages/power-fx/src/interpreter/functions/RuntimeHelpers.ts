import { IRContext } from '../../ir/IRContext'
import { BlankValue, FormulaValue, StringValue } from '../../public/values'

// Core operations for runtime implementation
export class RuntimeHelpers {
  public static AreEqual(arg1: FormulaValue, arg2: FormulaValue): boolean {
    let b: boolean

    // $$$ coercion
    if (arg1 instanceof BlankValue) {
      b = arg2 instanceof BlankValue
    } else {
      const val1 = arg1.toObject()
      const val2 = arg2.toObject()
      if (typeof val1 === 'string' || typeof val1 === 'number' || typeof val1 === 'boolean') {
        return val1 === val2
      }
      if (val1 instanceof Date && val2 instanceof Date) {
        return val1.getTime() === val2.getTime()
      }
      return arg1 === arg2
    }

    return b
  }

  public static ConcatString(irContext: IRContext, arg1: StringValue, arg2: StringValue): StringValue {
    const str = [arg1.value, arg2.value].join()
    return new StringValue(irContext, str)
  }
}
