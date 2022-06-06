import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { TypedName } from '../../types/TypedName'
import { Dictionary } from '../../utils/Dictionary'

export class LeftRightScalarFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(isLeft: boolean) {
    super(
      undefined,
      isLeft ? 'Left' : 'Right',
      undefined,
      isLeft ? TexlStrings.AboutLeft : TexlStrings.AboutRight,
      FunctionCategories.Text,
      DType.String,
      0,
      2,
      2,
      DType.String,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.LeftRightArg1, TexlStrings.LeftRightArg2]]
  }
}

// Table overloads of Left and Right:
//  Left(arg:*[_:s], count:n)
//  Right(arg:*[_:s], count:n)
export class LeftRightTableScalarFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(isLeft: boolean) {
    super(
      undefined,
      isLeft ? 'Left' : 'Right',
      undefined,
      isLeft ? TexlStrings.AboutLeftT : TexlStrings.AboutRightT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      2,
      DType.EmptyTable,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.LeftRightTArg1, TexlStrings.LeftRightArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    // Disambiguate these from the scalar overloads, so we don't have to
    // do type checking in the JS (runtime) implementation of Left/Right.
    return super.getUniqueTexlRuntimeNameInner('_TS')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 2);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    let checkNumericColumnType = super.checkStringColumnType(argTypes[0], args[0], errors, nodeToCoercedTypeMap)
    nodeToCoercedTypeMap = checkNumericColumnType[1]
    fValid = fValid && checkNumericColumnType[0]

    // Typecheck the input table
    // fValid &= CheckStringColumnType(argTypes[0], args[0], errors, ref nodeToCoercedTypeMap);

    returnType = argTypes[0]

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}

// Table overloads of Left and Right:
//  Left(arg:*[_:s], count:*[_:n])
//  Right(arg:*[_:s], count:*[_:n])
export class LeftRightTableTableFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(isLeft: boolean) {
    super(
      undefined,
      isLeft ? 'Left' : 'Right',
      undefined,
      isLeft ? TexlStrings.AboutLeftT : TexlStrings.AboutRightT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      2,
      DType.EmptyTable,
      DType.EmptyTable,
    )
  }

  public getSignatures() {
    return [[TexlStrings.LeftRightTArg1, TexlStrings.LeftRightArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    // Disambiguate these from the scalar overloads, so we don't have to
    // do type checking in the JS (runtime) implementation of Left/Right.
    return super.getUniqueTexlRuntimeNameInner('_TT')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 2);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    let checkStringColumnType = super.checkStringColumnType(argTypes[0], args[0], errors, nodeToCoercedTypeMap)
    nodeToCoercedTypeMap = checkStringColumnType[1]
    fValid = fValid && checkStringColumnType[0]

    let checkNumericColumnType = super.checkNumericColumnType(argTypes[1], args[1], errors, nodeToCoercedTypeMap)
    fValid = fValid && checkNumericColumnType[0]

    returnType = argTypes[0]

    return [fValid, { returnType, nodeToCoercedTypeMap }]

    // Typecheck the input table
    // fValid &= CheckStringColumnType(argTypes[0], args[0], errors, ref nodeToCoercedTypeMap);

    // // Typecheck the count table
    // fValid &= CheckNumericColumnType(argTypes[1], args[1], errors, ref nodeToCoercedTypeMap);

    // returnType = argTypes[0];

    // return fValid;
  }
}

// Table overloads of Left and Right:
//  Left(arg:s, count:*[_:n])
//  Right(arg:s, count:*[_:n])
export class LeftRightScalarTableFunction extends BuiltinFunction {
  public get requiresErrorContext() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(isLeft: boolean) {
    super(
      undefined,
      isLeft ? 'Left' : 'Right',
      undefined,
      isLeft ? TexlStrings.AboutLeftT : TexlStrings.AboutRightT,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      2,
      DType.String,
      DType.EmptyTable,
    )
  }

  public getSignatures() {
    return [[TexlStrings.LeftRightArg1, TexlStrings.LeftRightArg2]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    // Disambiguate these from the scalar overloads, so we don't have to
    // do type checking in the JS (runtime) implementation of Left/Right.
    return super.getUniqueTexlRuntimeNameInner('_ST')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 2);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    let checkNumericColumnType = super.checkNumericColumnType(argTypes[0], args[0], errors, nodeToCoercedTypeMap)
    nodeToCoercedTypeMap = checkNumericColumnType[1]
    fValid = fValid && checkNumericColumnType[0]
    returnType = DType.CreateTable(new TypedName(DType.String, BuiltinFunction.OneColumnTableResultName))

    return [fValid, { returnType, nodeToCoercedTypeMap }]

    // Typecheck the count table
    // fValid &= CheckNumericColumnType(argTypes[1], args[1], errors, ref nodeToCoercedTypeMap);

    // // Synthesize a new return type
    // returnType = DType.CreateTable(new TypedName(DType.String, OneColumnTableResultName));

    // return fValid;
  }
}
