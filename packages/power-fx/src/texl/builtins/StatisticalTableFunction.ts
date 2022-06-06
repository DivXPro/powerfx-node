import { TexlBinding } from '../../binding/Binder';
import { DocumentErrorSeverity } from '../../errors';
import { DelegationCapability } from '../../functions/delegation';
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { StringGetter, TexlStrings } from '../../localization';
import {
  DelegationStatus,
  DelegationTelemetryInfo,
  TrackingProvider,
} from '../../logging/trackers';
import { NodeKind } from '../../syntax/NodeKind';
import { CallNode } from '../../syntax/nodes';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { ViewFinderVisitor } from '../ViewFinderVisitor';
import { FunctionWithTableInput } from './FunctionWithTableInput';

export abstract class StatisticalTableFunction extends FunctionWithTableInput {
  public get supportsParamCoercion(): boolean {
    return true;
  }

  public get isSelfContained(): boolean {
    return true;
  }

  constructor(name: string, description: StringGetter, fc: FunctionCategories) {
    super(null, name, description, fc, DType.Number, 0x02, 2, 2, DType.EmptyTable, DType.Number);
    this.scopeInfo = new FunctionScopeInfo(this, false, false);
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding): boolean {
    return false;
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.StatisticalTArg1, TexlStrings.StatisticalTArg2]];
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('_T');
  }

  public isServerDelegatable(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (this.functionDelegationCapability.capabilities == DelegationCapability.None) {
      return false;
    }

    if (!super.checkArgsCount(callNode, binding)) {
      return false;
    }

    let res = super.tryGetValidDataSourceForDelegation(
      callNode,
      binding,
      this.functionDelegationCapability
    );
    let dataSource = res[1];
    if (!res[0]) {
      if (dataSource != null && dataSource.isDelegatable) {
        binding.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Warning,
          callNode,
          TexlStrings.OpNotSupportedByServiceSuggestionMessage_OpNotSupportedByService,
          this.name
        );
      }

      return false;
    }

    let args = callNode.args.children; //.VerifyValue();
    if (
      binding.getType(args[0]).hasExpandInfo ||
      (!binding.isFullRecordRowScopeAccess(args[1]) && args[1].kind != NodeKind.FirstName) ||
      !binding.isRowScope(args[1]) ||
      binding.getType(args[1]) != DType.Number ||
      this.ExpressionContainsView(callNode, binding)
    ) {
      super.suggestDelegationHint(callNode, binding);

      if (binding.getType(args[1]) != DType.Number) {
        TrackingProvider.Instance.setDelegationTrackerStatus(
          DelegationStatus.NotANumberArgType,
          callNode,
          binding,
          this,
          DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo()
        );
      } else {
        TrackingProvider.Instance.setDelegationTrackerStatus(
          DelegationStatus.InvalidArgType,
          callNode,
          binding,
          this,
          DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo()
        );
      }

      return false;
    }

    if (binding.isFullRecordRowScopeAccess(args[1])) {
      return super
        .getDottedNameNodeDelegationStrategy()
        .isValidDottedNameNode(args[1].asDottedName(), binding, null, null);
    }

    var firstNameStrategy = super.getFirstNameNodeDelegationStrategy(); //.VerifyValue();
    return firstNameStrategy.isValidFirstNameNode(args[1].asFirstName(), binding, null);
  }

  private ExpressionContainsView(callNode: CallNode, binding: TexlBinding) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let visitor = new ViewFinderVisitor(binding);
    callNode.accept(visitor);

    return visitor.ContainsView;
  }
}
