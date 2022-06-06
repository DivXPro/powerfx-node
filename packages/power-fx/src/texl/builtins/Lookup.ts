import { CollectionUtils } from '../../utils';
import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { DelegationCapability, IDelegationMetadata } from '../../functions/delegation';
import { FilterOpMetadata } from '../../functions/delegation/delegationMetadata';
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { TexlFunction } from '../../functions/TexlFunction';
import { TexlStrings } from '../../localization';
import { CallNode, TexlNode } from '../../syntax';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { Dictionary } from '../../utils/Dictionary';
import { FilterFunctionBase } from './FilterDelegationBase';

export class LookUpFunction extends FilterFunctionBase {
  public get requiresErrorContext() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      'LookUp',
      TexlStrings.AboutLookUp,
      FunctionCategories.Table,
      DType.Unknown,
      0x6,
      2,
      3,
      DType.EmptyTable,
      DType.Boolean
    );
    this.scopeInfo = new FunctionScopeInfo(this);
  }

  public getSignatures() {
    return [
      [TexlStrings.LookUpArg1, TexlStrings.LookUpArg2],
      [TexlStrings.LookUpArg1, TexlStrings.LookUpArg2, TexlStrings.LookUpArg3],
    ];
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
    // Contracts.Assert(args.Length >= 2 && args.Length <= 3);
    // Contracts.AssertValue(errors);

    let baseResult = super.checkInvocation(args, argTypes, errors);
    let fValid = baseResult[0];
    let returnType = baseResult[1].returnType;
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap;

    // var fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    // The return type is dictated by the last argument (projection) if one exists. Otherwise it's based on first argument (source).
    returnType = args.length == 2 ? argTypes[0].toRecord() : argTypes[2];

    // Ensure that the arg at index 1 is boolean or can be coersed.
    const checkResult = this.checkType(
      args[1],
      argTypes[1],
      DType.Boolean,
      TexlFunction.DefaultErrorContainer
    );
    const matchedWithCoercion = checkResult[1];
    if (checkResult[0]) {
      if (matchedWithCoercion) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[1],
          DType.Boolean,
          true
        );
      }
    } else {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        args[1],
        TexlStrings.ErrBooleanExpected
      );
      fValid = false;
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }];

    // return fValid;
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding) {
    // LookUp always generates non-pageable result.
    return false;
  }

  // Verifies if given callnode can be server delegatable or not.
  // Return true if
  //        - Arg0 is delegatable ds and supports filter operation.
  //        - All predicates to filter are delegatable if each firstname/binary/unary/dottedname/call node in each predicate satisfies delegation criteria set by delegation strategy for each node.
  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false;
    }

    let metadata: FilterOpMetadata = null;
    let TryGetEntityMetadata = super.tryGetDelegationMetadata(callNode, binding);
    let delegationMetadata: IDelegationMetadata = TryGetEntityMetadata[1];
    if (TryGetEntityMetadata[0]) {
      let TryGetValidDataSourceForDelegation = super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        new DelegationCapability(DelegationCapability.ArrayLookup)
      );

      if (
        !binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled ||
        !TryGetValidDataSourceForDelegation[0]
      ) {
        super.suggestDelegationHint(callNode, binding);
        return false;
      }

      metadata = delegationMetadata.filterDelegationMetadata; //.VerifyValue();
    } else {
      let TryGetValidDataSourceForDelegation = super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        this.functionDelegationCapability
      );
      let dataSource = TryGetValidDataSourceForDelegation[1];
      if (!TryGetValidDataSourceForDelegation[0]) {
        return false;
      }

      metadata = dataSource.delegationMetadata.filterDelegationMetadata;
    }

    let args = callNode.args.children; //.VerifyValue();
    if (args.length > 2 && binding.isDelegatable(args[2])) {
      super.suggestDelegationHint(args[2], binding);
      return false;
    }

    if (args.length < 2) {
      return false;
    }

    return super.isValidDelegatableFilterPredicateNode(args[1], binding, metadata);
  }

  public isEcsExcemptedLambda(index: number) {
    // Only the second argument for lookup is an ECS excempted lambda
    return index == 1;
  }
}
