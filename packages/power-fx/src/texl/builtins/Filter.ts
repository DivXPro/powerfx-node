import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { DelegationCapability } from '../../functions/delegation'
import { FilterOpMetadata } from '../../functions/delegation/delegationMetadata'
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo'
import { TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'
import { ViewFilterDataSourceVisitor } from '../ViewFilterDataSourceVisitor'
import { FilterFunctionBase } from './FilterDelegationBase'

export class FilterFunction extends FilterFunctionBase {
  public get requiresErrorContext() {
    return true
  }

  constructor() {
    super(
      'Filter',
      TexlStrings.AboutFilter,
      FunctionCategories.Table,
      DType.EmptyTable,
      -2,
      2,
      Number.MAX_SAFE_INTEGER,
      DType.EmptyTable
    )
    this.scopeInfo = new FunctionScopeInfo(this, false)
  }

  public get supportsParamCoercion() {
    return true
  }

  public getSignatures() {
    // Enumerate just the base overloads (the first 3 possibilities).
    return [
      [TexlStrings.FilterArg1, TexlStrings.FilterArg2],
      [TexlStrings.FilterArg1, TexlStrings.FilterArg2, TexlStrings.FilterArg2],
      [
        TexlStrings.FilterArg1,
        TexlStrings.FilterArg2,
        TexlStrings.FilterArg2,
        TexlStrings.FilterArg2,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return super.getGenericSignatures(
        arity,
        TexlStrings.FilterArg1,
        TexlStrings.FilterArg2
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
    // Contracts.Assert(args.length == argTypes.length);
    // Contracts.AssertValue(errors);
    // nodeToCoercedTypeMap = null;
    let viewCount = 0

    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fArgsValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    // let fArgsValid = CheckInvocation(args, argTypes, errors, out returnType, out nodeToCoercedTypeMap);

    const dataSourceVisitor = new ViewFilterDataSourceVisitor(binding)

    // Ensure that all the args starting at index 1 are booleans or view
    for (let i = 1; i < args.length; i++) {
      if (argTypes[i].kind == DKind.ViewValue) {
        if (++viewCount > 1) {
          // Only one view expected
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            args[i],
            TexlStrings.ErrOnlyOneViewExpected
          )
          fArgsValid = false
          continue
        }

        // Use the visitor to get the datasource info and if a view was already used anywhere in the node tree.
        args[0].accept(dataSourceVisitor)
        const dataSourceInfo = dataSourceVisitor.CdsDataSourceInfo

        if (dataSourceVisitor.ContainsViewFilter) {
          // Only one view expected
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            args[i],
            TexlStrings.ErrOnlyOneViewExpected
          )
          fArgsValid = false
          continue
        }

        if (dataSourceInfo != null) {
          // Verify the view belongs to the same datasource
          const viewInfo = argTypes[i].viewInfo //.VerifyValue();
          if (viewInfo.relatedEntityName != dataSourceInfo.name) {
            errors.ensureErrorWithSeverity(
              DocumentErrorSeverity.Severe,
              args[i],
              TexlStrings.ErrViewFromCurrentTableExpected,
              dataSourceInfo.name
            )
            fArgsValid = false
          }
        } else {
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            args[i],
            TexlStrings.ErrBooleanExpected
          )
          fArgsValid = false
        }

        continue
      } else if (DType.Boolean.accepts(argTypes[i])) {
        continue
      } else if (!argTypes[i].coercesTo(DType.Boolean)) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[i],
          TexlStrings.ErrBooleanExpected
        )
        fArgsValid = false
        continue
      }
    }

    // The first Texl function arg determines the cursor type, the scope type for the lambda params, and the return type.
    let CheckInput = this.scopeInfo.checkInput(args[0], argTypes[0], errors)
    let typeScope = CheckInput[1]
    fArgsValid = fArgsValid && CheckInput[0]

    // Contracts.Assert(typeScope.IsRecord);
    returnType = typeScope.toTable()

    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  // Verifies if given callnode can be server delegatable or not.
  // Return true if
  //        - Arg0 is delegatable ds and supports filter operation.
  //        - All predicates to filter are delegatable if each firstname/binary/unary/dottedname/call node in each predicate satisfies delegation criteria set by delegation strategy for each node.
  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false
    }

    let metadata: FilterOpMetadata = null
    let TryGetEntityMetadata = super.tryGetDelegationMetadata(callNode, binding)
    let delegationMetadata = TryGetEntityMetadata[1]
    if (TryGetEntityMetadata[0]) {
      let TryGetValidDataSourceForDelegation =
        super.tryGetValidDataSourceForDelegation(
          callNode,
          binding,
          new DelegationCapability(DelegationCapability.ArrayLookup)
        )

      if (
        !binding.document.properties.enabledFeatures
          .isEnhancedDelegationEnabled ||
        !TryGetValidDataSourceForDelegation[0]
      ) {
        super.suggestDelegationHint(callNode, binding)
        return false
      }

      metadata = delegationMetadata.filterDelegationMetadata //.VerifyValue();
    } else {
      let TryGetValidDataSourceForDelegation =
        super.tryGetValidDataSourceForDelegation(
          callNode,
          binding,
          this.functionDelegationCapability
        )
      let dataSource = TryGetValidDataSourceForDelegation[1]
      if (!TryGetValidDataSourceForDelegation[0]) {
        return false
      }

      metadata = dataSource.delegationMetadata.filterDelegationMetadata
    }

    const args = callNode.args.children //.VerifyValue();

    // Validate for each predicate node.
    for (let i = 1; i < args.length; i++) {
      if (
        !super.isValidDelegatableFilterPredicateNode(args[i], binding, metadata)
      ) {
        return false
      }
    }

    return true
  }

  public isEcsExcemptedLambda(index: number) {
    // All lambdas in filter can be excluded from ECS.
    return super.isLambdaParam(index)
  }
}
