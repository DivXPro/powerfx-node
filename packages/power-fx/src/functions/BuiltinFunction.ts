import { StringGetter } from '../localization';
import { DType } from '../types/DType';
import { FunctionCategories } from '../types/FunctionCategories';
import { DName } from '../utils/DName';
import { DPath } from '../utils/DPath';
import { TexlFunction } from './TexlFunction';

export abstract class BuiltinFunction extends TexlFunction {
  public static readonly OneColumnTableResultNameStr = 'Result';
  public static readonly ColumnName_NameStr = 'Name';
  public static readonly ColumnName_AddressStr = 'Address';
  public static readonly ColumnName_ValueStr = 'Value';
  public static readonly ColumnName_FullMatchStr = 'FullMatch';
  public static readonly ColumnName_SubMatchesStr = 'SubMatches';
  public static readonly ColumnName_StartMatchStr = 'StartMatch';
  public static readonly OneColumnTableResultName = new DName(
    BuiltinFunction.OneColumnTableResultNameStr
  );
  public static readonly ColumnName_Name = new DName(BuiltinFunction.ColumnName_NameStr);
  public static readonly ColumnName_Address = new DName(BuiltinFunction.ColumnName_AddressStr);
  public static readonly ColumnName_Value = new DName(BuiltinFunction.ColumnName_ValueStr);
  public static readonly ColumnName_FullMatch = new DName(BuiltinFunction.ColumnName_FullMatchStr);
  public static readonly ColumnName_SubMatches = new DName(
    BuiltinFunction.ColumnName_SubMatchesStr
  );
  public static readonly ColumnName_StartMatch = new DName(
    BuiltinFunction.ColumnName_StartMatchStr
  );

  constructor(
    theNamespace: DPath = DPath.Root,
    name: string,
    localeSpecificName = '',
    description: StringGetter,
    functionCategories: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number,
    ...paramTypes: DType[] // : base(theNamespace, name, localeSpecificName, description, functionCategories, returnType, maskLambdas, arityMin, arityMax, paramTypes)
  ) {
    super(
      theNamespace,
      name,
      localeSpecificName,
      description,
      functionCategories,
      returnType,
      maskLambdas,
      arityMin,
      arityMax,
      ...paramTypes
    );
  }
}
