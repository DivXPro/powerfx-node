import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { SignatureConstraint } from '../../functions/SignatureConstraint';
import { StringGetter, TexlStrings } from '../../localization';
import { TexlNode } from '../../syntax';
import { DKind } from '../../types/DKind';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { Dictionary } from '../../utils/Dictionary';
import { DName } from '../../utils/DName';
import { DPath } from '../../utils/DPath';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class AddColumnsFunction extends FunctionWithTableInput {
  public get skipScopeForInlineRecords() {
    return true;
  }
  public get hasLambdas() {
    return true;
  }
  public get isSelfContained() {
    return true;
  }
  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'AddColumns',
      TexlStrings.AboutAddColumns,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      3,
      Number.MAX_VALUE, //int.MaxValue,
      DType.EmptyTable
    );
    // AddColumns(source, name, valueFunc, name, valueFunc, ..., name, valueFunc, ...)
    this.signatureConstraint = new SignatureConstraint(5, 2, 0, 9);
    this.scopeInfo = new FunctionScopeInfo(this);
  }

  public getSignatures(): Array<StringGetter[]> {
    return [
      [TexlStrings.AddColumnsArg1, TexlStrings.AddColumnsArg2, TexlStrings.AddColumnsArg3],
      [
        TexlStrings.AddColumnsArg1,
        TexlStrings.AddColumnsArg2,
        TexlStrings.AddColumnsArg3,
        TexlStrings.AddColumnsArg2,
        TexlStrings.AddColumnsArg3,
      ],
      [
        TexlStrings.AddColumnsArg1,
        TexlStrings.AddColumnsArg2,
        TexlStrings.AddColumnsArg3,
        TexlStrings.AddColumnsArg2,
        TexlStrings.AddColumnsArg3,
        TexlStrings.AddColumnsArg2,
        TexlStrings.AddColumnsArg3,
      ],
    ];
    // Enumerate just the base overloads (the first 3 possibilities).
  }

  public getSignaturesAtArity(arity: number): Array<StringGetter[]> {
    if (arity > 3) return this.GetOverloadsAddColumns(arity);
    return super.getSignaturesAtArity(arity);
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let invocation = super.checkInvocation(args, argTypes, errors, binding);
    let fArgsValid = invocation[0];
    let returnType = invocation[1].returnType;
    let nodeToCoercedTypeMap = invocation[1].nodeToCoercedTypeMap;
    // bool fArgsValid = super.checkInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    // The first arg determines the scope type for the lambda params, and the return type.
    let checkInput = this.scopeInfo.checkInput(args[0], argTypes[0], errors);
    let typeScope: DType = checkInput[1];
    fArgsValid = fArgsValid && checkInput[0];
    // Contracts.Assert(typeScope.IsRecord);

    // The result type has N additional columns, as specified by (args[1],args[2]), (args[3],args[4]), ... etc.
    returnType = typeScope.toTable();

    let count = args.length;
    if ((count & 1) == 0)
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0].parent.castList().parent.castCall(),
        TexlStrings.ErrBadArityOdd,
        count
      );

    for (var i = 1; i < count; i += 2) {
      let nameArg = args[i];
      let nameArgType = argTypes[i];

      // Verify we have a string literal for the column name. Accd to spec, we don't support
      // arbitrary expressions that evaluate to string values, because these values contribute to
      // type analysis, so they need to be known upfront (before AddColumns executes).
      let nameNode;
      if (nameArgType.kind != DKind.String || (nameNode = nameArg.asStrLit()) == null) {
        fArgsValid = false;
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          nameArg,
          TexlStrings.ErrExpectedStringLiteralArg_Name,
          nameArg.toString()
        );
        continue;
      }

      // Verify that the name is valid.
      if (!DName.IsValidDName(nameNode.value)) {
        fArgsValid = false;
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          nameArg,
          TexlStrings.ErrArgNotAValidIdentifier_Name,
          nameNode.value
        );
        continue;
      }

      let columnName = new DName(nameNode.value);
      let displayNameForColumn = DType.TryGetDisplayNameForColumn(typeScope, columnName.value);
      let colName = displayNameForColumn[1];
      if (displayNameForColumn[0]) columnName = new DName(colName);

      // Verify that the name doesn't already exist as either a logical or display name
      let columnType;
      let unused;
      let getType = typeScope.tryGetType(columnName);
      columnType = getType[1];
      let logicalNameForColumn = DType.TryGetLogicalNameForColumn(typeScope, columnName.value);
      unused = logicalNameForColumn[1];
      if (getType[0] || logicalNameForColumn[0]) {
        fArgsValid = false;
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Moderate,
          nameArg,
          TexlStrings.ErrColExists_Name,
          columnName
        );
        continue;
      }

      if (i + 1 >= count) break;

      columnType = argTypes[i + 1];

      // Augment the result type to include the specified column, and verify that it
      // hasn't been specified already within the same invocation.
      let fError = false;
      let tryAddRes = returnType.tryAdd(fError, DPath.Root, columnName, columnType);
      returnType = tryAddRes[0];
      fError = tryAddRes[1];
      if (fError) {
        fArgsValid = false;
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Moderate,
          nameArg,
          TexlStrings.ErrColConflict_Name,
          columnName
        );
        continue;
      }
    }
    return [fArgsValid, { returnType, nodeToCoercedTypeMap }];
  }

  // Gets the overloads for the AddColumns function for the specified arity.
  private GetOverloadsAddColumns(arity: number): Array<StringGetter[]> {
    // Contracts.Assert(4 <= arity);

    const OverloadCount = 2;

    // REVIEW ragru: cache these and enumerate from the cache...

    let overloads = new Array<StringGetter[]>(OverloadCount);
    // Limit the argCount avoiding potential OOM
    let argCount =
      arity > this.signatureConstraint.repeatTopLength
        ? this.signatureConstraint.repeatTopLength
        : arity;
    for (let ioverload = 0; ioverload < OverloadCount; ioverload++) {
      let iArgCount = (argCount | 1) + ioverload * 2;
      let overload: StringGetter[]; //= new StringGetter[iArgCount];
      overload[0] = TexlStrings.AddColumnsArg1;
      for (let iarg = 1; iarg < iArgCount; iarg += 2) {
        overload[iarg] = TexlStrings.AddColumnsArg2;
        overload[iarg + 1] = TexlStrings.AddColumnsArg3;
      }
      overloads.push(overload);
    }

    return overloads;
  }

  public isLambdaParam(index: number) {
    // Contracts.Assert(index >= 0);

    // Left to right mask (infinite): ...101010100 == 0x...555554
    return index >= 2 && (index & 1) == 0;
  }

  public allowsRowScopedParamDelegationExempted(index: number) {
    // Contracts.Assert(index >= 0);

    return this.isLambdaParam(index);
  }
}
