import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { TexlStrings } from '../../localization';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class ConcatFunction extends FunctionWithTableInput {
  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'Concat',
      TexlStrings.AboutConcat,
      FunctionCategories.Table,
      DType.String,
      0x02,
      2,
      3,
      DType.EmptyTable,
      DType.String
    );

    this.scopeInfo = new FunctionScopeInfo(this, false);
  }

  public getSignatures() {
    return [
      [TexlStrings.ConcatArg1, TexlStrings.ConcatArg2],
      [TexlStrings.ConcatArg1, TexlStrings.ConcatArg2, TexlStrings.ConcatArg3],
    ];
  }
}
