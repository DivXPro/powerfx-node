import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode, TexlNode, VariadicBase } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import IEnumerable from '../../utils/typescriptNet/Collections/Enumeration/IEnumerable'

export class WithFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return false
  }

  constructor() {
    // : base("With", TexlStrings.AboutWith, FunctionCategories.Table, DType.Unknown, 0x2, 2, 2, DType.EmptyRecord)
    super(
      undefined,
      'With',
      undefined,
      TexlStrings.AboutWith,
      FunctionCategories.Table,
      DType.Unknown,
      0x2,
      2,
      2,
      DType.EmptyRecord,
    )
    this.scopeInfo = new FunctionScopeInfo(this, undefined, undefined, undefined, false)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.WithArg1, TexlStrings.WithArg2]]
  }

  // `with` is a keyword in javascript so the typescript function name is suffixed with `_R`
  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return super.getUniqueTexlRuntimeNameInner('_R')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);

    // Base call yields unknown return type, so we set it accordingly below
    const result = super.checkInvocation(args, argTypes, errors)
    let { returnType, nodeToCoercedTypeMap } = result[1]
    const fArgsValid = result[0]

    // Return type determined by second argument (function)
    // Since CheckInvocation is called on partial functions, return type should be error when a second argument is undefined
    if (argTypes.length >= 2) {
      returnType = argTypes[1]
    } else {
      returnType = DType.Error
    }

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  /// <summary>
  /// With function has special syntax where datasource can be provided as scope parameter argument.
  /// </summary>
  /// <param name="node"></param>
  /// <returns>TexlNode for argument that can be used to determine tabular datasource.</returns>
  public getTabularDataSourceArg(node: CallNode): Array<TexlNode> {
    // Contracts.AssertValue(node);

    const dsArg = node.args.children[0]

    if (dsArg instanceof VariadicBase) {
      return dsArg.children
    }

    return [dsArg]
  }
}
