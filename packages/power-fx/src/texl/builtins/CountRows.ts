import { TexlBinding } from '../../binding';
import { IExternalDataSource } from '../../entities/external/IExternalDataSource';
import { DocumentErrorSeverity } from '../../errors';
import { DelegationCapability } from '../../functions/delegation';
import { TexlStrings } from '../../localization';
import { CallNode } from '../../syntax';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { ViewFinderVisitor } from '../ViewFinderVisitor';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export class CountRowsFunction extends FunctionWithTableInput {
  public get requiresErrorContext() {
    return true;
  }

  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  public get functionDelegationCapability(): DelegationCapability {
    // return DelegationCapability.Count
    return new DelegationCapability(DelegationCapability.Count);
  }

  constructor() {
    super(
      undefined,
      'CountRows',
      TexlStrings.AboutCountRows,
      FunctionCategories.Table | FunctionCategories.MathAndStat,
      DType.Number,
      0,
      1,
      1,
      DType.EmptyTable
    );
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding) {
    return false;
  }

  public getSignatures() {
    return [[TexlStrings.CountArg1]];
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!super.checkArgsCount(callNode, binding)) {
      return false;
    }

    return this.TryGetValidDataSourceForDelegation(callNode, binding)[0]; //
  }

  // See if CountDistinct delegation is available. If true, we can make use of it on primary key as a workaround for CountRows delegation
  TryGetValidDataSourceForDelegation(
    callNode: CallNode,
    binding: TexlBinding
  ): [
    boolean,
    { dataSource: IExternalDataSource; preferredFunctionDelegationCapability: DelegationCapability }
  ] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    let dataSource = null;
    let preferredFunctionDelegationCapability = this.functionDelegationCapability;

    // We ensure Document is available because some tests run with a null Document.
    let tryGetDataSourceForDelegation = this.tryGetValidDataSourceForDelegation(
      callNode,
      binding,
      this.functionDelegationCapability
    );
    dataSource = tryGetDataSourceForDelegation[1];
    if (
      binding.document != null &&
      binding.document.properties.enabledFeatures.isEnhancedDelegationEnabled &&
      tryGetDataSourceForDelegation[0] &&
      !this.ExpressionContainsView(callNode, binding)
    ) {
      // Check that target table is not an expanded entity (1-N/N-N relationships)
      // TASK 9966488: Enable CountRows/CountIf delegation for table relationships
      const args = callNode.args.children; //.VerifyValue();
      if (args.length > 0) {
        if (binding.getType(args[0]).hasExpandInfo) {
          super.suggestDelegationHint(callNode, binding);
          return [false, { dataSource, preferredFunctionDelegationCapability }];
        } else {
          return [true, { dataSource, preferredFunctionDelegationCapability }];
        }
      }
    }

    let tryGetDataSource = super.tryGetValidDataSourceForDelegation(
      callNode,
      binding,
      new DelegationCapability(DelegationCapability.CountDistinct)
    );
    dataSource = tryGetDataSource[1];
    if (dataSource != null && dataSource.isDelegatable) {
      binding.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        callNode,
        TexlStrings.OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService,
        this.name
      );
    }

    return [false, { dataSource, preferredFunctionDelegationCapability }];
  }

  private ExpressionContainsView(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    const viewFinderVisitor = new ViewFinderVisitor(binding);
    callNode.accept(viewFinderVisitor);

    return viewFinderVisitor.ContainsView;
  }
}
