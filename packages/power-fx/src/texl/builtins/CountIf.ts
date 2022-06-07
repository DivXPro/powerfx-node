import { CollectionUtils } from '../../utils'
import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { IExternalDataSource } from '../../entities/external/IExternalDataSource'
import { DocumentErrorSeverity } from '../../errors'
import { DelegationCapability } from '../../functions/delegation'
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo'
import { TexlFunction } from '../../functions/TexlFunction'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { FilterFunctionBase } from './FilterDelegationBase'

export class CountIfFunction extends FilterFunctionBase {
  public get requiresErrorContext() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  public get functionDelegationCapability(): DelegationCapability {
    // return DelegationCapability.Filter | DelegationCapability.Count;
    return new DelegationCapability(
      DelegationCapability.Filter | DelegationCapability.Count
    )
  }

  constructor() {
    super(
      'CountIf',
      TexlStrings.AboutCountIf,
      FunctionCategories.Table | FunctionCategories.MathAndStat,
      DType.Number,
      -2,
      2,
      Number.MAX_VALUE,
      DType.EmptyTable,
      DType.Boolean
    )
    this.scopeInfo = new FunctionScopeInfo(this, false)
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding) {
    return false
  }

  public getSignatures() {
    return [
      [TexlStrings.CountIfArg1, TexlStrings.CountIfArg2],
      [
        TexlStrings.CountIfArg1,
        TexlStrings.CountIfArg2,
        TexlStrings.CountIfArg2,
      ],
      [
        TexlStrings.CountIfArg1,
        TexlStrings.CountIfArg2,
        TexlStrings.CountIfArg2,
        TexlStrings.CountIfArg2,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return super.getGenericSignatures(
        arity,
        TexlStrings.CountIfArg1,
        TexlStrings.CountIfArg2
      )
    }

    return super.getSignaturesAtArity(arity)
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);

    // let fValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // Contracts.Assert(returnType == DType.Number);

    // Ensure that all the args starting at index 1 are booleans or can be coersed.
    for (let i = 1; i < args.length; i++) {
      const checkResult = this.checkType(
        args[i],
        argTypes[i],
        DType.Boolean,
        TexlFunction.DefaultErrorContainer
      )
      const matchedWithCoercion = checkResult[1]
      if (checkResult[0]) {
        if (matchedWithCoercion) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
            nodeToCoercedTypeMap,
            args[i],
            DType.Boolean,
            true
          )
        }
      } else {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[i],
          TexlStrings.ErrBooleanExpected
        )
        fValid = false
      }
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false
    }

    let dataSource: IExternalDataSource = null
    let TryGetValidDataSourceForDelegation =
      super.tryGetValidDataSourceForDelegation(
        callNode,
        binding,
        this.functionDelegationCapability
      )
    dataSource = TryGetValidDataSourceForDelegation[1]

    // We ensure Document is available because some tests run with a null Document.
    if (
      (binding.document != null &&
        !binding.document.properties.enabledFeatures
          .isEnhancedDelegationEnabled) ||
      !TryGetValidDataSourceForDelegation[0]
    ) {
      if (dataSource != null && dataSource.isDelegatable) {
        binding.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Warning,
          callNode,
          TexlStrings.OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService,
          this.name
        )
      }

      return false
    }

    const args = callNode.args.children //.VerifyValue();

    if (args.length == 0) {
      return false
    }

    // Don't delegate 1-N/N-N counts
    // TASK 9966488: Enable CountRows/CountIf delegation for table relationships
    if (binding.getType(args[0]).hasExpandInfo) {
      super.suggestDelegationHint(callNode, binding)
      return false
    }

    const metadata = dataSource.delegationMetadata.filterDelegationMetadata

    // Validate for each predicate node.
    for (let i = 1; i < args.length; i++) {
      if (
        !super.isValidDelegatableFilterPredicateNode(args[i], binding, metadata)
      ) {
        super.suggestDelegationHint(callNode, binding)
        return false
      }
    }

    return true
  }
}
