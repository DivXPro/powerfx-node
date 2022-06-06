import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { TexlStrings } from '../../localization';
import { StrLitNode, TexlNode } from '../../syntax';
import { DKind } from '../../types/DKind';
import { DType } from '../../types/DType';
import { FieldNameKind } from '../../types/FieldNameKind';
import { FunctionCategories } from '../../types/FunctionCategories';
import { Dictionary } from '../../utils/Dictionary';
import { DName } from '../../utils/DName';
import { DPath } from '../../utils/DPath';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class DropColumnsFunction extends FunctionWithTableInput {
  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return false;
  }

  constructor() {
    super(
      undefined,
      'DropColumns',
      TexlStrings.AboutDropColumns,
      FunctionCategories.Table,
      DType.EmptyTable,
      0,
      2,
      Number.MAX_VALUE,
      DType.EmptyTable
    );
  }

  public getSignatures() {
    return [
      [TexlStrings.DropColumnsArg1, TexlStrings.DropColumnsArg2],
      [TexlStrings.DropColumnsArg1, TexlStrings.DropColumnsArg2, TexlStrings.DropColumnsArg2],
      [
        TexlStrings.DropColumnsArg1,
        TexlStrings.DropColumnsArg2,
        TexlStrings.DropColumnsArg2,
        TexlStrings.DropColumnsArg2,
      ],
    ];
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return super.getGenericSignatures(
        arity,
        TexlStrings.DropColumnsArg1,
        TexlStrings.DropColumnsArg2
      );
    }

    return super.getSignaturesAtArity(arity);
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding);
    let fArgsValid = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    // var fArgsValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);

    if (!argTypes[0].isTable) {
      fArgsValid = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrNeedTable_Func,
        this.name
      );
    } else {
      returnType = argTypes[0];
    }

    // The result type has N fewer columns, as specified by (args[1],args[2],args[3],...)
    let count = args.length;
    for (let i = 1; i < count; i++) {
      let nameArg = args[i];
      let nameArgType = argTypes[i];

      // Verify we have a string literal for the column name. Accd to spec, we don't support
      // arbitrary expressions that evaluate to string values, because these values contribute to
      // type analysis, so they need to be known upfront (before DropColumns executes).
      let nameNode: StrLitNode;
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

      // Verify that the name exists.
      let TryGetType = returnType.tryGetType(columnName);
      let columnType = TryGetType[1];
      if (!TryGetType[0]) {
        fArgsValid = false;
        returnType.reportNonExistingName(FieldNameKind.Logical, errors, columnName, nameArg);
        continue;
      }

      // Drop the specified column from the result type.
      let fError = false;

      let dropRes = returnType.drop(fError, DPath.Root, columnName);
      returnType = dropRes[0];
      fError = dropRes[1];
      // Contracts.Assert(!fError);

      return [fArgsValid, { returnType, nodeToCoercedTypeMap }];

      // return fArgsValid;
    }
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex >= 0;
  }
}
