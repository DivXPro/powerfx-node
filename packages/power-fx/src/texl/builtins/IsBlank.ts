import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import {
  DelegationCapability,
  OperationCapabilityMetadata,
} from '../../functions/delegation'
import { BinaryOp } from '../../lexer'
import { StringGetter, TexlStrings } from '../../localization/Strings'
import { CallNode, DottedNameNode, FirstNameNode, TexlNode } from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { IExternalControlType } from '../../types/IExternalControlType'
import { Dictionary } from '../../utils/Dictionary'

export abstract class IsBlankFunctionBase extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get functionDelegationCapability(): DelegationCapability {
    return new DelegationCapability(
      DelegationCapability.Null | DelegationCapability.Filter
    )
  }

  constructor(
    name: string,
    description: StringGetter,
    functionCategories: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number
  ) {
    super(
      undefined,
      name,
      undefined,
      description,
      functionCategories,
      returnType,
      maskLambdas,
      arityMin,
      arityMax
    )
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
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    let baseResult = super.checkInvocation(args, argTypes, errors, binding)
    let fValid = baseResult[0]
    let returnType = baseResult[1].returnType
    let nodeToCoercedTypeMap = baseResult[1].nodeToCoercedTypeMap

    if (!fValid) {
      // return false;
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    // Option Set values need to be checked with their own function since they have a special return for "blank" values.
    if (argTypes[0].kind == DKind.OptionSetValue) {
      return [false, { returnType, nodeToCoercedTypeMap }]
    }

    if (argTypes[0] as unknown as IExternalControlType) {
      let controlType = <IExternalControlType>(<unknown>argTypes[0])
      // A control will never be null. It never worked as intended.
      // We coerce the control to control.primaryOutProperty.
      let primaryOutputProperty =
        controlType.controlTemplate.primaryOutputProperty //VerifyValue().PrimaryOutputProperty;
      // Contracts.AssertValueOrNull(primaryOutputProperty);

      if (primaryOutputProperty != null) {
        if (nodeToCoercedTypeMap == null) {
          nodeToCoercedTypeMap = new Dictionary<TexlNode, DType>()
        }

        nodeToCoercedTypeMap.set(args[0], primaryOutputProperty.getOpaqueType())
      }
    }
    return [true, { returnType, nodeToCoercedTypeMap }]
  }
}

// IsBlank(expression:E)
// Equivalent Excel and DAX function: IsBlank
export class IsBlankFunction extends IsBlankFunctionBase {
  public static IsBlankInvariantFunctionName = 'IsBlank'
  constructor() {
    super(
      IsBlankFunction.IsBlankInvariantFunctionName,
      TexlStrings.AboutIsBlank,
      FunctionCategories.Table | FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1
    )
  }

  public getSignatures() {
    return [[TexlStrings.IsBlankArg1]]
  }

  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    if (binding.errorContainer.hasErrors(callNode)) {
      return false
    }

    if (!super.checkArgsCount(callNode, binding)) {
      return false
    }

    let args = callNode.args.children //.VerifyValue();
    let opStrategy = super.getOpDelegationStrategy(BinaryOp.Equal, null)

    if (binding.isFullRecordRowScopeAccess(args[0])) {
      return super
        .getDottedNameNodeDelegationStrategy()
        .isValidDottedNameNode(
          args[0] as DottedNameNode,
          binding,
          metadata,
          opStrategy
        )
    }

    let node: FirstNameNode = null
    if (!(args[0] instanceof FirstNameNode)) {
      let message = `Arg1 is not a firstname node, instead it is ${args[0].kind}`
      super.addSuggestionMessageToTelemetry(message, args[0], binding)
      return false
    }
    node = args[0] as FirstNameNode
    if (!binding.isRowScope(node)) {
      return false
    }

    let firstNameNodeValidationStrategy =
      super.getFirstNameNodeDelegationStrategy()
    return firstNameNodeValidationStrategy.isValidFirstNameNode(
      node as FirstNameNode,
      binding,
      opStrategy
    )
  }
}

// IsBlank(expression:E)
// Equivalent Excel and DAX function: IsBlank
export class IsBlankOptionSetValueFunction extends BuiltinFunction {
  public get supportsParamCoercion() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  constructor() {
    super(
      undefined,
      IsBlankFunction.IsBlankInvariantFunctionName,
      undefined,
      TexlStrings.AboutIsBlank,
      FunctionCategories.Table | FunctionCategories.Information,
      DType.Boolean,
      0,
      1,
      1,
      DType.OptionSetValue
    )
  }

  public getSignatures() {
    return [[TexlStrings.IsBlankArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return super.getUniqueTexlRuntimeNameInner('OptionSetValue')
  }
}
