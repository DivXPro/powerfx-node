import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { StringGetter, TexlStrings } from '../../localization'
import { TexlNode } from '../../syntax/nodes'
import { DType, TypedName } from '../../types'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

// Abstract base for all scalar flavors of round (Round, RoundUp, RoundDown)
export class ScalarRoundingFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(name: string, description: StringGetter) {
    super(
      undefined,
      name,
      undefined,
      description,
      FunctionCategories.MathAndStat,
      DType.Number,
      0,
      2,
      2,
      DType.Number,
      DType.Number,
    )
  }

  public getSignatures() {
    return [[TexlStrings.RoundArg1, TexlStrings.RoundArg2]] // {  };
  }
}

// Abstract base for all overloads of round that take table arguments
export class TableRoundingFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(name: string, description: StringGetter) {
    super(undefined, name, undefined, description, FunctionCategories.Table, DType.EmptyTable, 0, 2, 2)
  }

  public getSignatures() {
    return [[TexlStrings.RoundTArg1, TexlStrings.RoundTArg2]] // { };
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T')
  }

  //   public override bool CheckInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes, IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
  // {
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    //  let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    let type0 = argTypes[0]
    let type1 = argTypes[1]

    let otherType = DType.Invalid
    let otherArg: TexlNode = null

    // At least one of the arguments has to be a table.
    if (type0.isTable) {
      // Ensure we have a one-column table of numerics
      // fValid &= CheckNumericColumnType(type0, args[0], errors, ref nodeToCoercedTypeMap);
      let CheckNumericColumnType = super.checkNumericColumnType(type0, args[0], errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = CheckNumericColumnType[1]
      fValid = fValid && CheckNumericColumnType[0]

      // Borrow the return type from the 1st arg
      returnType = type0

      // Check arg1 below.
      otherArg = args[1]
      otherType = type1
    } else if (type1.isTable) {
      // Ensure we have a one-column table of numerics
      // fValid &= CheckNumericColumnType(type1, args[1], errors, ref nodeToCoercedTypeMap);
      let CheckNumericColumnType = super.checkNumericColumnType(type1, args[1], errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = CheckNumericColumnType[1]
      fValid = fValid && CheckNumericColumnType[0]

      // Since the 1st arg is not a table, make a new table return type *[Result:n]
      returnType = DType.CreateTable(new TypedName(DType.Number, TableRoundingFunction.OneColumnTableResultName))

      // Check arg0 below.
      otherArg = args[0]
      otherType = type0
    } else {
      // Contracts.Assert(returnType.isTable);
      errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[0], TexlStrings.ErrTypeError)
      errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, args[1], TexlStrings.ErrTypeError)

      // Both args are invalid. No need to continue.
      // return false;
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    // Contracts.Assert(otherType.isValid);
    // Contracts.AssertValue(otherArg);
    // Contracts.Assert(returnType.isTable);
    // Contracts.Assert(!fValid || returnType.IsColumn);

    if (otherType.isTable) {
      // Ensure we have a one-column table of numerics
      // fValid &= CheckNumericColumnType(otherType, otherArg, errors, ref nodeToCoercedTypeMap);
      let CheckNumericColumnType = super.checkNumericColumnType(otherType, otherArg, errors, nodeToCoercedTypeMap)
      nodeToCoercedTypeMap = CheckNumericColumnType[1]
      fValid = fValid && CheckNumericColumnType[0]
    } else if (!DType.Number.accepts(otherType)) {
      if (otherType.coercesTo(DType.Number)) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(nodeToCoercedTypeMap, otherArg, DType.Number)
      } else {
        fValid = false
        errors.ensureErrorWithSeverity(DocumentErrorSeverity.Severe, otherArg, TexlStrings.ErrTypeError)
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}

// Round(number:n, digits:n)
export class RoundScalarFunction extends ScalarRoundingFunction {
  constructor() {
    super('Round', TexlStrings.AboutRound)
  }
}

// RoundUp(number:n, digits:n)
export class RoundUpScalarFunction extends ScalarRoundingFunction {
  constructor() {
    super('RoundUp', TexlStrings.AboutRoundUp)
  }
}

// RoundDown(number:n, digits:n)
export class RoundDownScalarFunction extends ScalarRoundingFunction {
  constructor() {
    super('RoundDown', TexlStrings.AboutRoundDown)
  }
}

// Round(number:n|*[n], digits:n|*[n])
export class RoundTableFunction extends TableRoundingFunction {
  constructor() {
    super('Round', TexlStrings.AboutRoundT)
  }
}

// RoundUp(number:n|*[n], digits:n|*[n])
export class RoundUpTableFunction extends TableRoundingFunction {
  constructor() {
    super('RoundUp', TexlStrings.AboutRoundUpT)
  }
}

// RoundDown(number:n|*[n], digits:n|*[n])
export class RoundDownTableFunction extends TableRoundingFunction {
  constructor() {
    super('RoundDown', TexlStrings.AboutRoundDownT)
  }
}
