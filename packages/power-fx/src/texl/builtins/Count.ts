import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { TexlStrings } from '../../localization';
import { TexlNode } from '../../syntax';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { Dictionary } from '../../utils/Dictionary';
import { DPath } from '../../utils/DPath';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class CountFunction extends FunctionWithTableInput {
  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'Count',
      TexlStrings.AboutCount,
      FunctionCategories.Table | FunctionCategories.MathAndStat,
      DType.Number,
      0,
      1,
      1,
      DType.EmptyTable
    );
  }

  public getSignatures() {
    return [[TexlStrings.CountArg1]];
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding);
    let fValid = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    // The argument should be a table of one column.
    let argType = argTypes[0];
    let columns = [];
    if (!argType.isTable) {
      fValid = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrNeedTable_Func,
        this.name
      );
    } else if ((columns = argType.getNames(DPath.Root)).length != 1) {
      fValid = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[0],
        TexlStrings.ErrNeedTableCol_Func,
        this.name
      );
    } else if (!DType.Number.accepts(columns[0].type)) {
      fValid = false;
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        args[0],
        TexlStrings.ErrInvalidSchemaNeedNumCol_Col,
        columns[0].name
      );
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }];
  }
}
