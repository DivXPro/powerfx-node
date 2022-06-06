import { FormulaType } from './FormulaType'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { ITypeVistor } from './ITypeVistor'

export enum ExternalTypeKind {
  Array, // PowerFx only supports single-column tables
  Object, // PowerFx does not support schema-less objects
}

/// <summary>
/// FormulaType that can be used by CustomObject instances to
/// indicate that the type of the data does not exist in PowerFx.
/// </summary>
//
export class ExternalType extends FormulaType {
  public static readonly ObjectType: FormulaType = new ExternalType(ExternalTypeKind.Object)
  public static readonly ArrayType: FormulaType = new ExternalType(ExternalTypeKind.Array)

  public kind: ExternalTypeKind

  constructor(kind: ExternalTypeKind, dkind: DKind = DKind.Unknown) {
    console.log('DType', DType)
    super(new DType(dkind))
    this.kind = kind
  }

  public visit(vistor: ITypeVistor) {
    throw new Error('NotImplementedException')
  }
}
