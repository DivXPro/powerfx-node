import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { TexlStrings } from '../../localization';
import { TexlNode } from '../../syntax';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { TypedName } from '../../types/TypedName';
import { Dictionary } from '../../utils/Dictionary';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class ForAllFunction extends FunctionWithTableInput {
  public get skipScopeForInlineRecords() {
    return true;
  }
  public get isSelfContained() {
    return true;
  }

  public get requiresErrorContext() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'ForAll',
      TexlStrings.AboutForAll,
      FunctionCategories.Table,
      DType.Unknown,
      0x2,
      2,
      2,
      DType.EmptyTable
    );

    this.scopeInfo = new FunctionScopeInfo(this);
  }

  public getSignatures() {
    return [[TexlStrings.ForAllArg1, TexlStrings.ForAllArg2]];
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

    let baseResult = super.checkInvocation(args, argTypes, errors, binding);
    let fArgsValid = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    if (argTypes[1].isRecord) {
      returnType = argTypes[1].toTable();
    } else if (argTypes[1].isPrimitive || argTypes[1].isTable) {
      returnType = DType.CreateTable(new TypedName(argTypes[1], ForAllFunction.ColumnName_Value));
    } else {
      returnType = DType.Error;
      fArgsValid = false;
    }

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }];
  }

  public hasSuggestionsForParam(index: number) {
    // Contracts.Assert(index >= 0);

    return index == 0;
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner(isPrefetching ? '_ParallelPrefetching' : '');
  }
}
