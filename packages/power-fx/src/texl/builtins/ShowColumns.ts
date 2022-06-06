import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DataSourceToQueryOptionsMap } from '../../entities/queryOptions/DataSourceToQueryOptionsMap';
import { DocumentErrorSeverity } from '../../errors';
import { StringGetter, TexlStrings } from '../../localization';
import { CallNode, StrLitNode, TexlNode } from '../../syntax/nodes';
import { DKind, DType, DTypeHelper, FieldNameKind, FunctionCategories } from '../../types';
import { Dictionary } from '../../utils/Dictionary';
import { DName } from '../../utils/DName';
import { DPath } from '../../utils/DPath';
import { FunctionWithTableInput } from './FunctionWithTableInput';

// ShowColumns(source:*[...], name:s, name:s, ...)
export class ShowColumnsFunction extends FunctionWithTableInput {
  public get isSelfContained() {
    return true;
  }
  public get affectsDataSourceQueryOptions() {
    return true;
  }
  public get supportsParamCoercion() {
    return false;
  }

  constructor() {
    super(
      undefined,
      'ShowColumns',
      TexlStrings.AboutShowColumns,
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
      [TexlStrings.ShowColumnsArg1, TexlStrings.ShowColumnsArg2],
      [TexlStrings.ShowColumnsArg1, TexlStrings.ShowColumnsArg2, TexlStrings.ShowColumnsArg2],
      [
        TexlStrings.ShowColumnsArg1,
        TexlStrings.ShowColumnsArg2,
        TexlStrings.ShowColumnsArg2,
        TexlStrings.ShowColumnsArg2,
      ],
    ];
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return super.getGenericSignatures(
        arity,
        TexlStrings.ShowColumnsArg1,
        TexlStrings.ShowColumnsArg2
      );
    }

    return super.getSignaturesAtArity(arity);
  }

  //   public override bool CheckInvocation(TexlBinding binding, TexlNode[] args, DType[] argTypes,
  //     IErrorContainer errors, out DType returnType, out Dictionary <TexlNode, DType > nodeToCoercedTypeMap)
  // {
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    // var isValidInvocation = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);
    // Contracts.Assert(returnType.IsTable);
    let baseResult = super.checkInvocation(args, argTypes, errors, binding);
    let isValidInvocation: boolean = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    if (!argTypes[0].isTable) {
      isValidInvocation = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrNeedTable_Func,
        this.name
      );
    } else {
      returnType = argTypes[0];
    }

    let colsToKeep = DType.EmptyTable;

    // The result type has N columns, as specified by (args[1],args[2],args[3],...)
    let count = args.length;
    for (let i = 1; i < count; i++) {
      let nameArg = args[i];
      let nameArgType = argTypes[i];

      // Verify we have a string literal for the column name. Accd to spec, we don't support
      // arbitrary expressions that evaluate to string values, because these values contribute to
      // type analysis, so they need to be known upfront (before ShowColumns executes).
      let nameNode: StrLitNode;
      if (nameArgType.kind != DKind.String || (nameNode = nameArg.asStrLit()) == null) {
        isValidInvocation = false;
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
        isValidInvocation = false;
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
      const GetType = returnType.tryGetType(columnName);
      const columnType = GetType[1];
      if (!GetType[0]) {
        isValidInvocation = false;
        returnType.reportNonExistingName(FieldNameKind.Logical, errors, columnName, args[i]);
        continue;
      }

      // Verify that the name was only specified once.
      const GetType2 = colsToKeep.tryGetType(columnName);
      const existingColumnType = GetType2[1];
      if (!GetType2[0]) {
        // if (colsToKeep.TryGetType(columnName, out var existingColumnType))
        isValidInvocation = false;
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Warning,
          nameArg,
          TexlStrings.WarnColumnNameSpecifiedMultipleTimes_Name,
          columnName
        );
        continue;
      }

      // Make a note of which columns are being kept.
      // Contracts.Assert(columnType.IsValid);
      colsToKeep = colsToKeep.add(columnName, columnType);
    }

    // Drop everything but the columns that need to be kept.
    returnType = colsToKeep;

    // return isValidInvocation;
    return [isValidInvocation, { returnType, nodeToCoercedTypeMap }];
  }

  public updateDataQuerySelects(
    callNode: CallNode,
    binding: TexlBinding,
    dataSourceToQueryOptionsMap: DataSourceToQueryOptionsMap
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false;
    }

    let args = callNode.args.children; //.VerifyValue();

    let dsType = binding.getType(args[0]);
    if (dsType.associatedDataSources == null) {
      return false;
    }

    let resultType = binding.getType(callNode); //.VerifyValue();

    let retval = false;
    for (let typedName of resultType.getNames(DPath.Root)) {
      let columnType = typedName.type;
      let columnName = typedName.name.value;

      // Contracts.Assert(dsType.Contains(new DName(columnName)));

      retval =
        retval ||
        DTypeHelper.AssociateDataSourcesToSelect(
          dsType,
          dataSourceToQueryOptionsMap,
          columnName,
          columnType,
          true
        );
    }

    return retval;
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex >= 0;
  }
}
