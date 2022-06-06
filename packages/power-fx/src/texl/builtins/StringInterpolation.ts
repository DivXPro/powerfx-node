// StringInterpolation(source1:s, source2:s, ...)
// No DAX function, compiler-only, not available for end users, no table support
// String interpolations such as $"Hello {"World"}" translate into a call to this function

import { ConcatenateFunctionBase } from './Concatenate'

export class StringInterpolationFunction extends ConcatenateFunctionBase {
  constructor() {
    super('StringInterpolation')
  }
}
