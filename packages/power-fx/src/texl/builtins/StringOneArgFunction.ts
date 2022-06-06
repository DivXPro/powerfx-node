import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { DelegationCapability, OperationCapabilityMetadata } from '../../functions/delegation'
import { StringGetter, TexlStrings } from '../../localization'
import { CallNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { Dictionary } from '../../utils/Dictionary'

export abstract class StringOneArgFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(
    name: string,
    description: StringGetter,
    functionCategories: FunctionCategories,
    returnType: DType = DType.String,
  ) {
    super(undefined, name, undefined, description, functionCategories, returnType, 0, 1, 1, DType.String)
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[TexlStrings.StringFuncArg1]]
  }

  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata,
  ): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(metadata);

    if (
      this.functionDelegationCapability.capabilities == DelegationCapability.None ||
      binding.errorContainer.hasErrors(callNode) ||
      !this.checkArgsCount(callNode, binding) ||
      !binding.isRowScope(callNode)
    ) {
      return false
    }

    const args = callNode.args.children
    const argKind = args[0].kind

    switch (argKind) {
      case NodeKind.FirstName: {
        var firstNameStrategy = this.getFirstNameNodeDelegationStrategy()
        return firstNameStrategy.isValidFirstNameNode(args[0].asFirstName(), binding, null)
      }

      case NodeKind.Call: {
        if (!metadata.isDelegationSupportedByTable(this.functionDelegationCapability)) {
          return false
        }

        var cNodeStrategy = this.getCallNodeDelegationStrategy()
        return cNodeStrategy.isValidCallNode(args[0].asCall(), binding, metadata)
      }

      case NodeKind.DottedName: {
        var dottedStrategy = this.getDottedNameNodeDelegationStrategy()
        return dottedStrategy.isValidDottedNameNode(args[0].asDottedName(), binding, metadata, null)
      }

      default:
        break
    }

    return false
  }
}

export abstract class StringOneArgTableFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor(name: string, description: StringGetter, functionCategories: FunctionCategories) {
    super(undefined, name, undefined, description, functionCategories, DType.EmptyTable, 0, 1, 1, DType.EmptyTable)
  }

  public getSignatures() {
    return [[TexlStrings.StringTFuncArg1]]
  }

  public getUniqueTexlRuntimeName(isPrefetching = false): string {
    return this.getUniqueTexlRuntimeNameInner('_T')
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding,
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.Assert(args.Length == 1);
    // Contracts.AssertValue(errors);

    const result = super.checkInvocation(args, argTypes, errors)
    let { returnType, nodeToCoercedTypeMap } = result[1]
    let fValid = result[0]
    // Contracts.Assert(returnType.IsTable);

    // Typecheck the input table
    const checkStringResult = this.checkStringColumnType(argTypes[0], args[0], errors, nodeToCoercedTypeMap)
    nodeToCoercedTypeMap = checkStringResult[1]
    fValid &&= checkStringResult[0]

    if (nodeToCoercedTypeMap?.size > 0 ?? false) {
      // Now set the coerced type to a table with numeric column type with the same name as in the argument.
      returnType = nodeToCoercedTypeMap.get(args[0])
    } else {
      returnType = argTypes[0]
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }
}
