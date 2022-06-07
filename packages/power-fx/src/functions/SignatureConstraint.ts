/// <summary>
/// This class is used to help limit signature length for variadic function. e.g.
/// FuncName(arg1,arg1,...,arg1,...),
/// FuncName(arg1,arg2,arg2,...,arg2,...)
/// FuncName(arg1,arg2,arg1,arg2,...,arg1,arg2,...)
/// FuncName(arg1,arg2,arg2,...,arg2,...,arg3,...)
/// </summary>
export class SignatureConstraint {
  public readonly omitStartIndex: number
  public readonly repeatSpan: number
  public readonly endNonRepeatCount: number
  public readonly repeatTopLength: number

  constructor(
    omitStartIndex: number,
    repeatSpan: number,
    endNonRepeatCount: number,
    repeatTopLength: number
  ) {
    this.omitStartIndex = omitStartIndex
    this.repeatSpan = repeatSpan
    this.endNonRepeatCount = endNonRepeatCount
    this.repeatTopLength = repeatTopLength
  }

  /// <summary>
  /// Determines if argIndex needs highlight.
  /// </summary>
  /// <param name="argCount">arg count in script.</param>
  /// <param name="argIndex">arg index cursor focuses on in script.</param>
  /// <param name="signatureCount">arg count in signature.</param>
  /// <param name="signatureIndex">signature index in funcDisplayString.</param>
  public argNeedsHighlight(
    argCount: number,
    argIndex: number,
    signatureCount: number,
    signatureIndex: number
  ): boolean {
    if (
      argCount <= this.repeatTopLength ||
      signatureIndex <= this.omitStartIndex
    ) {
      return signatureIndex == argIndex
    }

    if (
      signatureCount > this.repeatTopLength &&
      this.isIndexInRange(signatureIndex, this.repeatTopLength, signatureCount)
    ) {
      return signatureCount - signatureIndex == argCount - argIndex
    }

    if (this.endNonRepeatCount > 0) {
      // FuncName(arg1,arg2,arg2,...,arg2,...,arg3,...)
      const tailArgRange = [
        argCount - this.endNonRepeatCount - this.repeatSpan,
        argCount - this.endNonRepeatCount,
      ]
      const tailSignatureRange = [
        signatureCount - this.endNonRepeatCount - this.repeatSpan,
        signatureCount - this.endNonRepeatCount,
      ]
      if (this.isIndexInRange(argIndex, tailArgRange[0], tailArgRange[1])) {
        return this.isIndexInRange(
          signatureIndex,
          tailSignatureRange[0],
          tailSignatureRange[1]
        )
      }
    }

    return (
      argIndex >= signatureIndex &&
      argIndex > this.omitStartIndex &&
      (signatureIndex - this.omitStartIndex) % this.repeatSpan ==
        (argIndex - this.omitStartIndex) % this.repeatSpan
    )
  }

  /// <summary>
  /// Determines if param can omit.
  /// </summary>
  /// <param name="argCount">arg count in script.</param>
  /// <param name="argIndex">arg index cursor focuses on in script.</param>
  /// <param name="signatureCount">arg count in signature.</param>
  /// <param name="signatureIndex">signature index in funcDisplayString.</param>
  public canParamOmit(
    argCount: number,
    argIndex: number,
    signatureCount: number,
    signatureIndex: number
  ): boolean {
    if (
      signatureCount > this.repeatTopLength &&
      this.isIndexInRange(signatureIndex, this.repeatTopLength, signatureCount)
    ) {
      return false
    }

    // headOmitRange: [startIndex, endIndex)
    const headOmitRange = [
      this.omitStartIndex,
      this.omitStartIndex + this.repeatSpan,
    ]
    const tailOmitRange = [
      signatureCount - this.endNonRepeatCount - this.repeatSpan,
      signatureCount - this.endNonRepeatCount,
    ]
    if (
      this.endNonRepeatCount > 0 &&
      this.isIndexInRange(signatureIndex, tailOmitRange[0], tailOmitRange[1])
    ) {
      let tailArgRange = [
        argCount - this.endNonRepeatCount - this.repeatSpan,
        argCount - this.endNonRepeatCount,
      ]
      return !this.isIndexInRange(argIndex, tailArgRange[0], tailArgRange[1])
    }

    // return true if argIndex is out of headOmitRange and signatureIndex is within headOmitRange
    return (
      this.isIndexInRange(signatureIndex, headOmitRange[0], headOmitRange[1]) &&
      !this.isIndexInRange(argIndex, headOmitRange[0], headOmitRange[1])
    )
  }

  private isIndexInRange(index: number, startIndex: number, endIndex: number) {
    return index >= startIndex && index < endIndex
  }
}
