import { ICheckable } from './types'

export class Contracts {
  // #region Check contracts for public APIs

  public static Check(f: boolean, sid: string): void {
    if (!f) throw this.Except<string>(sid)
  }

  public static CheckNonEmpty(s: string, paramName: string): void {
    if (s === '' || s === null) {
      if (s === null) throw this.ExceptValue(paramName)
      throw this.ExceptEmpty(paramName)
    }
  }

  public static CheckNonEmptyOrNull(s: string, paramName: string): void {
    if (s != null && s.length == 0) throw this.ExceptEmpty(paramName)
  }

  public static CheckRange(f: boolean, paramName: string, sid: string): void {
    if (!f) throw this.ExceptRange(paramName, sid)
  }

  public static CheckIndexRange(
    index: number,
    count: number,
    available: number,
    paramName: string,
    sid: string
  ): void {
    if (!this.IsValid(index, count, available))
      throw this.ExceptRange(paramName, sid)
  }

  public static CheckIndex(
    index: number,
    available: number,
    paramName: string,
    sid: string
  ): void {
    if (!this.IsValidIndex(index, available))
      throw this.ExceptRange(paramName, sid)
  }

  public static CheckIndexInclusive(
    index: number,
    available: number,
    paramName: string,
    sid: string
  ): void {
    if (!this.IsValidIndexInclusive(index, available))
      throw this.ExceptRange(paramName, sid)
  }

  public static CheckParam(f: boolean, paramName: string, sid: string): void {
    if (!f) throw this.ExceptParam(paramName, sid)
  }

  public static CheckValue<T extends {}>(
    val: T | undefined,
    paramName: string,
    sid: string
  ): void {
    if (val === null || val === undefined)
      throw this.ExceptValue(paramName, sid)
  }

  public static CheckNull<T>(val: T, paramName: string, sid: string): void {
    if (!val === null) throw this.ExceptNull(paramName, sid)
  }

  //221
  // public static CheckXmlDocumentString(text: string, paramName: string): XDocument {
  //   this.CheckNonEmpty(text, paramName);
  //   try {
  //     return XDocument.Parse(text, LoadOptions.None);
  //   }
  //   catch
  //   {
  //     throw ExceptParam(paramName);
  //   }
  // }

  // public static CheckXmlDocumentStringOrNull(text: string, paramName: string): void {
  //     this.CheckXmlDocumentString(text, paramName);
  // }

  public static CheckAllNonEmpty(args: string[], paramName: string): void {
    for (let i = 0; i < this.Size(args); i++) {
      if (args[i] === '' || args[i] === null) throw this.ExceptEmpty(paramName)
    }
  }

  public static CheckAllValues<T>(args: T[], paramName: string): void {
    for (let i = 0; i < this.Size(args); i++) {
      if (args[i] === null) throw this.ExceptParam(paramName)
    }
  }

  public static CheckAll<T extends ICheckable>(
    args: T[],
    paramName: string
  ): any {
    for (let i = 0; i < this.Size(args); i++) {
      if (!args[i].isValid) throw this.ExceptValid(paramName)
    }
  }

  public static CheckValid<T extends ICheckable>(
    val: T,
    paramName: string
  ): void {
    if (!val.isValid) throw this.ExceptValid(paramName)
  }

  //317
  // [Conditional("INVARIANT_CHECKS")]
  public static CheckValueOrNull<T extends {}>(
    val: T,
    paramName: string
  ): void {}

  // #endregion

  // #region Assert contracts for internal validation

  // [Conditional("DEBUG")]
  public static Assert(f: boolean, msg?: string): void {
    // #if DEBUG
    if (!f) this.DbgFail(msg)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertIndex(index: number, available: number): void {
    // #if DEBUG
    if (!this.IsValidIndex(index, available)) this.DbgFail()
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertIndexInclusive(index: number, available: number): void {
    // #if DEBUG
    if (!this.IsValidIndexInclusive(index, available)) this.DbgFail()
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertNonEmpty(s: string, msg?: string): void {
    // #if DEBUG
    if (s === '' || s === null) this.DbgFailEmpty(msg)
    // #endif
  }

  public static AssertNonEmptyGeneric<T>(s: T[], msg?: string): void {
    // #if DEBUG
    if (s.length === 0 || s === null) this.DbgFail(msg)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertNonEmptyOrNull(s: string, msg?: string): void {
    // #if DEBUG
    if (s != null) this.AssertNonEmpty(s, msg)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertValue<T extends {}>(val: T, name?: string): void {
    // #if DEBUG
    if (val === null) this.DbgFailValue(name)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertNull<T extends {}>(val: T, name?: string): void {
    // #if DEBUG
    if (val !== null) this.DbgFailNull(name)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertXmlDocumentString(text: string): void {
    // #if DEBUG
    this.AssertNonEmpty(text)
    // try {
    //   XDocument.Parse(text, LoadOptions.None);
    // }
    // catch
    // {
    //   DbgFail();
    // }
    // #endif
  }

  /// <summary>
  /// Asserts that <paramref name="val"/> is not null and one of the <paramref name="expectedPossibilities"/>.
  /// This uses the default equality operator for the type.
  /// </summary>
  // [Conditional("DEBUG")]
  public static AssertOneOf<T extends {}>(
    val: T,
    expectedPossibilities: T[]
  ): void {
    // #if DEBUG
    this.AssertValue(val)
    this.AssertValue(expectedPossibilities)
    this.AssertAllValues(expectedPossibilities)

    if (expectedPossibilities.indexOf(val) == -1)
      this.DbgFail(`The value is not one of the allowed possibilities: ${val}`)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertOneOfValueType<T>(
    val: T,
    expectedPossibilities: T[]
  ): void {
    // #if DEBUG
    this.AssertValue(expectedPossibilities)

    if (expectedPossibilities.indexOf(val) == -1)
      this.DbgFail(`The value is not one of the allowed possibilities: ${val}`)
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertOneOfValueTypeOrNull<T>(
    val?: T,
    expectedPossibilities?: T[]
  ): void {
    // #if DEBUG
    if (val != null) this.AssertOneOfValueType(val, expectedPossibilities ?? [])
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertAllNonEmpty(args: string[]): void {
    // #if DEBUG
    for (let i = 0; i < args.length; i++) {
      if (args[i] === undefined || args[i] === null) this.DbgFail()
    }
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertAllValues<T extends {}>(args: T[]): void {
    // #if DEBUG
    if (args != null) {
      for (let arg in args) {
        if (arg === null) this.DbgFail()
      }
    }
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertValid<T extends ICheckable>(val: T): void {
    // #if DEBUG
    if (val === null || !val.isValid) this.DbgFailValid()
    // #endif
  }

  // [Conditional("DEBUG")]
  public static AssertAllValid<T extends ICheckable>(args: T[]): void {
    // #if DEBUG
    for (let i = 0; i < args.length; i++) {
      if (args[i] === null || !args[i].isValid) this.DbgFailValid()
    }
    // #endif
  }

  // [Conditional("INVARIANT_CHECKS")]
  public static AssertValueOrNull<T extends {}>(val: T): void {}

  // #if DEBUG
  // #region Assert helpers

  // If we're running in Unit Test environment, throw an exception that can be caught by the test harness.
  // private static ConstructorInfo _assertFailExCtor;

  private static DbgFailCore(msg: string): void {
    // // Only try to get a new assertFailExCtor if we do not already have one.
    // if (_assertFailExCtor == null) {
    //   // Try first to get the VS UnitTestFramework constructor
    //   _assertFailExCtor = GetTestExceptionConstructor("Microsoft.VisualStudio.TestPlatform.UnitTestFramework",
    //     "Microsoft.VisualStudio.TestPlatform.UnitTestFramework.AssertFailedException");

    //   // Otherwise, check for...
    //   if (_assertFailExCtor == null) {
    //     _assertFailExCtor = GetTestExceptionConstructor("xunit.assert",
    //       "Xunit.Sdk.XunitException");
    //   }

    //   if (_assertFailExCtor == null) {
    //     _assertFailExCtor = GetTestExceptionConstructor("Microsoft.VisualStudio.TestPlatform.TestFramework",
    //       "Microsoft.VisualStudio.TestTools.UnitTesting.AssertFailedException");
    //   }
    // }

    // // Log the failure, so we get some information on server failures during JS test execution.
    // // Must be done before the Debug.Assert for the tests to get it.
    // Console.Error.WriteLine($"Server debug failure: {msg}. Callstack: {Environment.StackTrace}");

    // if (_assertFailExCtor == null)
    //   Debug.Assert(false, msg);

    // if (_assertFailExCtor != null) {
    //               Exception ex = (Exception)_assertFailExCtor.Invoke(new object[] { msg });
    //   throw ex;
    // }
    console.warn(msg)
  }

  private static DbgFail(msg?: string): void {
    if (msg !== null && msg !== undefined) {
      this.DbgFailCore(msg)
    } else {
      this.DbgFailCore('Assertion Failed')
    }
  }

  private static DbgFailValue(name?: string, msg?: string): void {
    if (name == null && msg == null) {
      this.DbgFailCore('Non-null assertion failure')
    } else if (name != null && msg != null) {
      this.DbgFailCore(`Non-null assertion failure: ${name}: ${msg}`)
    } else if (name != null && msg == null) {
      this.DbgFailCore(`Non-null assertion failure: ${name}`)
    }
  }

  private static DbgFailNull(name?: string, msg?: string): void {
    if (name == null && msg == null) {
      this.DbgFailCore('Null assertion failure')
    } else if (name != null && msg != null) {
      this.DbgFailCore(`Null assertion failure: ${name}: ${msg}`)
    } else if (name != null && msg == null) {
      this.DbgFailCore(`Null assertion failure: ${name}`)
    }
  }

  private static DbgFailEmpty(msg?: string): void {
    if (msg == null) {
      this.DbgFailCore('Non-empty assertion failure')
    } else this.DbgFailCore(`Non-empty assertion failure: ${msg}`)
  }

  private static DbgFailValid(name?: string): void {
    if (name == null) {
      this.DbgFailCore('Validity assertion failure')
    } else this.DbgFailCore(`Validity assertion failure: ${name}`)
  }

  // #endregion
  // #endif
  // #endregion

  // #region Verify contracts

  // Verify contracts are used to assert a value in debug, and act as a pass through in retail.

  public static Verify(f: boolean, message: string = ''): boolean {
    if (message === '' || message === null) {
      this.Assert(f)
    } else {
      this.Assert(f, message)
    }
    return f
  }

  public static VerifyValue<T extends {}>(val: T): T {
    this.AssertValue(val)
    return val
  }

  public static VerifyNonEmpty(val: string): string {
    this.AssertNonEmpty(val)
    return val
  }

  // #endregion

  // #region Helpers

  private static Size<T>(list: T[]): number {
    return list == null ? 0 : list.length
  }

  /// <summary>Note: This will actualize the IEnumerable. Care should be taken to only use this when the list is not read-once.</summary>
  //   private static Size<T>(list:T[] ): number
  // {
  //   return list == null ? 0 : list.Count();
  // }

  //  for unit tests
  static IsValid(index: number, count: number, available: number): boolean {
    // This code explicitly allows the case of index == available, but only when
    // count == 0. This degenerate case is permitted in order to avoid problems
    // for developers consuming APIs that are range-checked using this routine.
    // Particularly numbereresting is the fact {index == 0, count == 0, available == 0} is
    // considered valid.

    this.Assert(available >= 0)

    // unchecked
    {
      // Equivalent to
      // return index >= 0 && index <= available && count >= 0 && count <= available - index;
      return (
        <number>index <= <number>available &&
        <number>count <= <number>(available - index)
      )
    }
  }

  //   static IsValid(index: long, count: long, available: long): booleanean
  // {
  //   // This code explicitly allows the case of index == available, but only when
  //   // count == 0. This degenerate case is permitted in order to avoid problems
  //   // for developers consuming APIs that are range-checked using this routine.
  //   // Particularly numbereresting is the fact {index == 0, count == 0, available == 0} is
  //   // considered valid.

  //   Assert(available >= 0);

  //   // unchecked
  //   {
  //     // Equivalent to
  //     // return index >= 0 && index <= available && count >= 0 && count <= available - index;
  //     return (<number>index <= <number>available) && (<number>count <= <number>(available - index));
  //   }
  // }

  static IsValidIndex(index: number, available: number): boolean {
    this.Assert(available >= 0)

    // unchecked
    {
      // Equivalent to
      // return index >= 0 && index < available;
      return <number>index < <number>available
    }
  }

  //          static booleanean IsValidIndex(long index, long available)
  // {
  //   Assert(available >= 0);

  //   unchecked
  //   {
  //     // Equivalent to
  //     // return index >= 0 && index < available;
  //     return <number>index < <number>available;
  //   }
  // }

  static IsValidIndexInclusive(index: number, existing: number): boolean {
    this.Assert(existing >= 0)

    // unchecked
    {
      // Equivalent to
      // return index >= 0 && index <= existing;
      return <number>index <= <number>existing
    }
  }

  //          static booleanean IsValidIndexInclusive(long index, long existing)
  // {
  //   Assert(existing >= 0);

  //   unchecked
  //   {
  //     // Equivalent to
  //     // return index >= 0 && index <= existing;
  //     return <number>index <= <number>existing;
  //   }
  // }

  private static Process(ex: Error): Error {
    // TASK: 69493 - Support Errors in logging.
    // This is also a convenient ponumber to catch validation Errors during development.
    return ex
  }

  //   public static Except(): Error
  // {
  //   return this.Process(new Error());
  // }

  //   public static Except(sid: string): Error
  // {
  //   return this.Process(new Error(sid));
  // }

  //   public static Except<T>(sid: string, arg: T): Error
  // {
  //     return this.Process(new Error(this.FormatMessage(sid, arg)));
  // }

  public static Except<T>(sid?: string, args?: object[], arg?: T): Error {
    return this.Process(new Error(this.FormatMessage(sid, args, arg)))
  }

  // public static ExceptRange(paramName:string): Error
  // {
  //   return this.Process(new Error(paramName));
  // }

  public static ExceptRange(paramName: string, sid?: string): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid)))
  }

  //   public static ExceptParam(paramName:string): Error
  // {
  //   return this.Process(new Error(paramName));
  // }

  //   public static ExceptParam(paramName:string, sid?: string): Error
  // {
  //     return this.Process(new Error(this.FormatMessage(paramName,sid)));
  // }

  public static ExceptParam<T>(
    paramName: string,
    sid?: string,
    arg?: T
  ): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid, arg)))
  }

  //   public static ExceptValue(paramName:string): Error
  // {
  //   return this.Process(new ArgumentNullError(paramName));
  // }

  public static ExceptValue(paramName: string, sid?: string): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid)))
  }

  //   public static ExceptNull(paramName:string): Error
  // {
  //   return this.Process(new Error(paramName));
  // }

  public static ExceptNull(paramName: string, sid?: string): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid)))
  }

  public static ExceptEmpty(paramName: string, sid?: string): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid)))
  }

  //   public static ExceptEmpty(paramName:string): Error
  // {
  //   return this.Process(new Error(sid, paramName));
  // }

  public static ExceptValid(paramName: string, sid?: string): Error {
    return this.Process(new Error(this.FormatMessage(paramName, sid)))
  }

  //   public static ExceptValid(paramName:string): Error
  // {
  //     return this.Process(new Error(this.FormatMessage(sid, paramName)));
  // }

  // #endregion

  private static FormatMessage(msg?: string, ...args: any | undefined): string {
    // AssertValue(msg);
    // AssertValue(args);
    if (args === undefined || args === null) {
      return msg !== undefined ? msg : ''
    }
    return `${msg}:${args}`
  }
}
