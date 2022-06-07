import { IErrorContainer } from '../app/errorContainers'
import { TexlBinding } from '../binding/Binder'
import { BindKind } from '../binding/BindKind'
import { IExternalDataSource } from '../entities/external/IExternalDataSource'
import { DataSourceToQueryOptionsMap } from '../entities/queryOptions/DataSourceToQueryOptionsMap'
import { DocumentErrorSeverity } from '../errors'
import { BinaryOp } from '../lexer/BinaryOp'
import TexlLexer from '../lexer/TexlLexer'
import { UnaryOp } from '../lexer/UnaryOp'
import {
  CurrentLocaleInfo,
  ErrorResourceKey,
  StringGetter,
  StringResources,
  TexlStrings,
} from '../localization'
import { TrackingProvider } from '../logging/trackers'
import {
  BinaryOpNode,
  CallNode,
  FirstNameNode,
  Identifier,
  TexlNode,
} from '../syntax'
import { DKind } from '../types/DKind'
import { DType } from '../types/DType'
import { FunctionCategories } from '../types/FunctionCategories'
import { IExpandInfo } from '../types/IExpandInfo'
import { TypedName } from '../types/TypedName'
import { isNullOrEmpty } from '../utils/CharacterUtils'
import { CollectionUtils } from '../utils/CollectionUtils'
import { Dictionary } from '../utils/Dictionary'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { hashCode } from '../utils/Hash'
import { KeyValuePair } from '../utils/types'
import { DefaultNoOpErrorContainer } from './DefaultNoOpErrorContainer'
import { IDataEntityMetadata } from './delegation/IDataEntityMetadata'
import { IDelegationMetadata } from './delegation/IDelegationMetadata'
import { DelegationCapability } from './delegation/DelegationCapability'
import { RequiredDataSourcePermissions } from './dlp/RequiredDataSourcePermissions'
import { ArgValidators } from './functionArgValidators'
import { FunctionScopeInfo } from './FunctionScopeInfo'
import { IFunction } from './IFunction'
import { OperationCapabilityMetadata } from './delegation/OperationCapabilityMetadata'
import { Capabilities } from './publish'
import { SignatureConstraint } from './SignatureConstraint'
import {
  FunctionInfo,
  FunctionSignature,
  ParameterInfo,
} from './transportSchemas'

import {
  ICallNodeDelegatableNodeValidationStrategy,
  IDottedNameNodeDelegatableNodeValidationStrategy,
  IFirstNameNodeDelegatableNodeValidationStrategy,
  DelegationValidationStrategy,
  DefaultUnaryOpDelegationStrategy,
  DefaultBinaryOpDelegationStrategy,
  InOpDelegationStrategy,
  IOpDelegationStrategy,
} from './delegation/delegationStrategies'
import { IFlowInfo } from '../types/IFlowInfo'

export abstract class TexlFunction implements IFunction {
  // A default "no-op" error container that does not post document errors.
  public static get DefaultErrorContainer(): IErrorContainer {
    return new DefaultNoOpErrorContainer()
  }

  // The information for scope if there is one.
  public scopeInfo: FunctionScopeInfo

  // A description associated with this function.
  private readonly _description: StringGetter

  // Convenience mask that indicates which parameters are to be treated as lambdas.
  // Bit at position K refers to argument of rank K. A bit of 1 denotes a lambda, 0 denotes non-lambda.
  // Overloads may choose to ignore this mask, and override the HasLambdas/IsLambdaParam APIs instead.
  protected readonly _maskLambdas: number

  // The parent namespace for this function. DPath.Root indicates the global namespace.
  public namespace: DPath

  // A DType.Unknown return type means that this function can return any type
  // and the specific return type will depend on the argument types.
  // If the function can return some shape of record, which depends on the argument types,
  // DType.EmptyRecord should be used. Similarly for tables and DType.EmptyTable.
  // CheckInvocation can be used to infer the exact return type of a specific invocation.
  public returnType: DType

  // Function arity (expected min/max number of arguments).
  public minArity: number

  public maxArity: number

  // Parameter types.
  public readonly paramTypes: DType[]

  private _signatureConstraint: SignatureConstraint

  private _cachedFunctionInfo: FunctionInfo

  private _cachedLocaleName: string

  // Return true if the function should be hidden from the formular bar, false otherwise.
  public get isHidden() {
    return false
  }

  // Return true if the function expects lambda arguments, false otherwise.
  public get hasLambdas() {
    return this._maskLambdas !== 0
  }

  // Return true if lambda args should affect ECS, false otherwise.
  public get hasEcsExcemptLambdas() {
    return false
  }

  // Return true if the function is asynchronous, false otherwise.
  public get isAsync() {
    return false
  }

  // Return true if the function is tracked in telemetry.
  public get isTrackedInTelemetry() {
    return true
  }

  // Return true if the function is declared as variadic.
  public get isVariadicFunction() {
    return this.maxArity == Infinity
  }

  // Return true if the function's return value only depends on the global variable
  // e.g. Today(), Now() depend on the system time.
  public get isGlobalReliant() {
    return false
  }

  // Return true if the function is self-contained (no side effects), or false otherwise.
  // This is a decision that developers will need to do for new functions, so making it
  // abstract will force them to do so.
  public abstract get isSelfContained(): boolean

  // Return true if the function is stateless (same result for same input), or false otherwise.
  public get isStateless() {
    return true
  }

  // Return true if the function supports inlining during codegen.
  public get supportsInlining() {
    return false
  }

  // Returns false if we want to block the function within FunctionWithScope calls
  // that have a nondeterministic operation order (due to multiple async calls).
  public get allowedWithinNondeterministicOperationOrder() {
    return true
  }

  // Returns true if the function creates an implicit dependency on the control's parent screen.
  public get createsImplicitScreenDependency() {
    return false
  }

  // Returns true if the function can be used in test cases; all "global" functions should
  // work, functionst that create screen dependencies don't by default (but can be overriden
  // if the function is ready for that)
  public get canBeUsedInTests() {
    return !this.createsImplicitScreenDependency
  }

  /// <summary>
  /// Whether the function always produces a visible error if CheckInvocation returns invalid.
  /// This can be used to prevent the overall "Function has invalid arguments" error.
  /// </summary>
  public get hasPreciseErrors() {
    return false
  }

  // Returns true if the function is disabled for component.
  public get disableForComponent() {
    return false
  }

  // Returns true if the function is disabled for data component.
  public get disableForDataComponent() {
    return false
  }

  // Returns true if the function is disabled for Commmanding
  public get disableForCommanding() {
    return false
  }

  // Returns true if the function should be suppressed in Intellisense for component.
  public get suppressIntellisenseForComponent() {
    return this.disableForComponent
  }

  public get functionPermission() {
    return RequiredDataSourcePermissions.None
  }

  // Return true if the function is pure (stateless with no side effects), or false otherwise.
  public get isPure() {
    return this.isSelfContained && this.isStateless
  }

  // Return true if the function is strict (in all of its parameters), or false otherwise.
  // A strict function is a function that always evaluates all of its arguments (the parameters
  // have to be computed before the function can run). A non-strict function is a function
  // that does not always evaluate all of its arguments. In terms of dependencies, a strict
  // function means that a dependence on the function result implies dependencies on all of its args,
  // whereas a non-strict function means that a dependence on the result implies dependencies
  // on only some of the args.
  public get isStrict() {
    return true
  }

  // Return true if the function can only be used in behavior rules, i.e. rules that run in
  // response to user feedback. Only certain functions fall into this category, e.g. functions
  // with side effects, such as Collect.
  public get isBehaviorOnly() {
    return !this.isSelfContained
  }

  // Return true if the function can only be used as part of test cases. Functions that
  // emulate user interaction fall into this category, such as SetProperty.
  public get isTestOnly() {
    return false
  }

  // Return true if the function manipulates collections.
  public get manipulatesCollections() {
    return false
  }

  // Return true if the function uses an input's column names to inform Intellisense's suggestions.
  public get canSuggestInputColumns() {
    return false
  }

  // Return true if the function expects a screen's context variables to be suggested within a record argument.
  public get canSuggestContextVariables() {
    return false
  }

  // Returns true if it's valid to suggest ThisItem for this function as an argument.
  public get canSuggestThisItem() {
    return false
  }

  // Return true if this function affects collection schemas.
  public get affectsCollectionSchemas() {
    return false
  }

  // Return true if this function affects screen aliases ("context variables").
  public get affectsAliases() {
    return false
  }

  // Return true if this function affects scope variable ("app scope variable or component scope variable").
  public get affectsScopeVariable() {
    return false
  }
  // Return true if this function affects datasource query options.
  public get affectsDataSourceQueryOptions() {
    return false
  }

  // Return true if this function can return a type with ExpandInfo.
  public get canReturnExpandInfo() {
    return false
  }

  // Return true if this function requires error context info.
  public get requiresErrorContext() {
    return false
  }

  // Return true if this function requires binding context info.
  public get requiresBindingContext() {
    return false
  }

  // Return true if this function can generate new data on its own without re-evaluating a rule.
  public get isAutoRefreshable() {
    return false
  }

  // Return true if this function returns dynamic metadata
  public get isDynamic() {
    return false
  }

  // Return the index to be used to provide type recommendations for later arguments
  public get suggestionTypeReferenceParamIndex() {
    return 0
  }

  // Return true if the function uses the parent scope to provide suggestions
  public get useParentScopeForArgumentSuggestions() {
    return false
  }

  // Return true if the function uses the enum namespace for type suggestions
  public get usesEnumNamespace() {
    return false
  }

  // Return true if the function supports parameter coercion.
  public get supportsParamCoercion() {
    return true
  }

  /// <summary>Indicates whether table and record param types require all columns to be specified in the input argument.</summary>
  public get requireAllParamColumns() {
    return false
  }

  /// <summary>
  /// Indicates whether the function sets a value.
  /// </summary>
  public get modifiesValues() {
    return false
  }

  /// <summary>
  /// The function's name as surfaced in / accessible from the language.
  /// Using properties instead of fields here, to account for the fact that subclasses may override LocaleSpecificName.
  /// </summary>
  public name: string

  // The localized version of the namespace for this function.
  public localeSpecificNamespace: DPath

  /// <summary>
  /// The function's locale-specific name.
  /// These should all be defined in the string resources, e.g. Abs_Name, Filter_Name, etc.
  /// The derived classes can pass in the value if needed and in that case, the passed in value is directly used.
  /// </summary>
  public localeSpecificName: string

  // The function's English / locale-invariant name.
  public localeInvariantName: string

  // A description associated with this function.
  public get description() {
    return this._description(null)
  }

  // A forward link to the function help.
  public get helpLink() {
    // The invariant name is used to form a URL. It cannot contain spaces and other
    // funky characters. We have tests that enforce this constraint. If we ever need
    // such characters (#, &, %, ?), they need to be encoded here, e.g. %20, etc.
    return (
      StringResources.Get('FunctionReference_Link') +
      this.localeInvariantName[0].toLowerCase()
    )
  }

  /// <summary>
  /// Might need to reset if Function is variadic function.
  /// </summary>
  public get signatureConstraint() {
    if (this.maxArity == Infinity && this._signatureConstraint == null) {
      this._signatureConstraint = new SignatureConstraint(
        this.minArity + 1,
        1,
        0,
        this.minArity + 3
      )
    }
    return this._signatureConstraint
  }

  protected set signatureConstraint(value: SignatureConstraint) {
    this._signatureConstraint = value
  }

  // Mask indicating the function categories the function belongs to.
  public functionCategoriesMask: FunctionCategories

  // Mask indicating the function delegation capabilities.
  public get functionDelegationCapability() {
    return new DelegationCapability(DelegationCapability.None)
  }

  // Mask indicating the function capabilities.
  public get capabilities() {
    return Capabilities.None
  }

  // The function's fully qualified locale-specific name, including the namespace.
  // If the function is in the global namespace, this.QualifiedName is the same as this.Name.
  public get qualifiedName() {
    return this.namespace.isRoot
      ? this.name
      : this.namespace.toDottedSyntax(TexlLexer.PunctuatorDot, true) +
          TexlLexer.PunctuatorDot +
          TexlLexer.EscapeName(this.name)
  }

  constructor(
    theNamespace: DPath,
    name: string,
    localeSpecificName: string,
    description: StringGetter,
    functionCategories: FunctionCategories,
    returnType: DType,
    maskLambdas: number,
    arityMin: number,
    arityMax: number,
    ...paramTypes: DType[]
  ) {
    // Contracts.Assert(theNamespace.IsValid);
    // Contracts.AssertNonEmpty(name);
    // Contracts.AssertValue(localeSpecificName);
    // Contracts.Assert((uint)functionCategories > 0);
    // Contracts.Assert(returnType.IsValid);
    // Contracts.AssertValue(paramTypes);
    // Contracts.AssertAllValid(paramTypes);
    // Contracts.Assert(maskLambdas.Sign >= 0 || arityMax == int.MaxValue);
    // Contracts.Assert(arityMax >= 0 && paramTypes.Length <= arityMax);
    // Contracts.AssertIndexInclusive(arityMin, arityMax);

    this.namespace = theNamespace
    this.localeInvariantName = name
    this.functionCategoriesMask = functionCategories
    this._description = description
    this.returnType = returnType
    this._maskLambdas = maskLambdas
    this.minArity = arityMin
    this.maxArity = arityMax
    this.paramTypes = paramTypes

    // Locale Specific Name is a legacy piece of code only used by ServiceFunctions.
    // For all other instances, the name is the same as the En-Us name
    if (!isNullOrEmpty(localeSpecificName)) {
      this.localeSpecificNamespace = new DPath().append(
        new DName(localeSpecificName)
      )
      this.localeSpecificName = localeSpecificName
    } else {
      this.localeSpecificName = this.localeInvariantName
    }
    this.name = this.localeSpecificName
  }

  // Return all signatures for this function.
  // Functions with optional parameters have more than one signature.
  public abstract getSignatures(): Array<StringGetter[]>

  // Return all signatures with at most 'arity' parameters.
  public getSignaturesAtArity(arity: number): Array<StringGetter[]> {
    // Contracts.Assert(arity >= 0);
    return this.getSignatures().filter((signature) => signature.length >= arity)
  }

  // Return a unique name for this function (useful in the presence of overloads).
  // This is used for name mangling and Texl -> runtime function mapping.
  // TASK: 68797: We need a TexlFunction name -> JS/runtime function name map.
  public getUniqueTexlRuntimeName(isPrefetching = false) {
    return this.getUniqueTexlRuntimeNameInner('')
  }

  // TODO:
  protected getUniqueTexlRuntimeNameInner(
    suffix: string,
    suppressAsync = false
  ) {
    const name = this.namespace.isRoot
      ? this.localeInvariantName
      : this.namespace.name + '__' + this.localeInvariantName
    if (name.length <= 1) {
      return name.toLowerCase()
    }

    return (
      name[0].toLowerCase() +
      name.substring(1) +
      suffix +
      (this.isAsync && !suppressAsync ? 'Async' : '')
    )
  }

  // public checkInvocation(
  //   args: TexlNode[],
  //   argTypes: DType[],
  //   errors: IErrorContainer,
  // ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }]
  // public checkInvocation(
  //   args: TexlNode[],
  //   argTypes: DType[],
  //   errors: IErrorContainer,
  //   binding: TexlBinding,
  // ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }]
  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding?: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // return checkInvocation(args, argTypes, errors);
    return this.checkInvocationCore(args, argTypes, errors)
  }

  // Type check an invocation of the function with the specified args (and their corresponding types).
  // Return true if everything aligns even with coercion, false otherwise.
  // By default, the out returnType will be the one advertised via the constructor. If this.ReturnType
  // is either Unknown or an aggregate type, this method needs to be specialized.
  // public checkInvocation(args: TexlNode[], argTypes: DType[], errors: IErrorContainer): [boolean, { returnType: DType, nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }]
  // {
  //     return CheckInvocationCore(args, argTypes, errors);
  // }

  public checkForDynamicReturnType(
    binding: TexlBinding,
    args: TexlNode[]
  ): boolean {
    return false
  }

  protected static ComputeArgHash(args: TexlNode[]): string {
    let argHash = ''

    for (let i = 0; i < args.length; i++) {
      argHash += args[i].toString()
    }

    return hashCode(argHash)
  }

  public supportCoercionForArg(argIndex: number) {
    return (
      this.supportsParamCoercion &&
      (argIndex <= this.minArity || argIndex <= this.maxArity)
    )
  }

  private checkInvocationCore(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.AssertAllValid(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.Length && args.Length <= MaxArity);

    let fValid = true
    const count = Math.min(args.length, this.paramTypes.length)

    let nodeToCoercedTypeMap = null
    let returnType: DType

    // Type check the args
    for (let i = 0; i < count; i++) {
      const result = this.checkType(
        args[i],
        argTypes[i],
        this.paramTypes[i],
        errors,
        this.supportCoercionForArg(i)
      )
      const typeChecks = result[0]
      const coercionType = result[1]
      if (typeChecks && coercionType != null) {
        CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[i],
          coercionType
        )
      }

      fValid &&= typeChecks
    }

    for (let i = count; i < args.length; i++) {
      let type = argTypes[i]
      if (type.isError) {
        errors.ensureError(args[i], TexlStrings.ErrBadType)
        fValid = false
      }
    }

    if (!fValid) {
      nodeToCoercedTypeMap = null
    }

    this.scopeInfo?.checkLiteralPredicates(args, errors)

    // Default return type.
    returnType = this.returnType

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  /// <summary>
  /// True if there was any custom post-visit validation errors applied for this function.
  /// </summary>
  public postVisitValidation(
    binding: TexlBinding,
    callNode: CallNode
  ): boolean {
    return false
  }

  // Return true if the parameter at the specified 0-based rank is a lambda parameter, false otherwise.
  public isLambdaParam(index: number): boolean {
    // Contracts.AssertIndexInclusive(index, MaxArity);
    // const bitMaskLambdas = this._maskLambdas.toString(2)
    //
    // return bitMaskLambdas[bitMaskLambdas.length - 0] === '1'
    return !((this._maskLambdas & (1 << index)) == 0)
  }

  /// <summary>
  /// True if the evaluation of the param at the 0-based index is controlled by the function in question
  /// e.g. conditionally evaluated, repeatedly evaluated, etc.., false otherwise
  /// All lambda params are Lazy, but others may also be, including short-circuit booleans, conditionals, etc..
  /// </summary>
  /// <param name="index">Parameter index, 0-based.</param>
  public isLazyEvalParam(index: number) {
    // Contracts.AssertIndexInclusive(index, MaxArity);

    return this.isLambdaParam(index)
  }

  public isEcsExcemptedLambda(index: number) {
    // Contracts.Assert(index >= 0);

    return false
  }

  public allowsRowScopedParamDelegationExempted(index: number) {
    return false
  }

  // Return true if this function requires global binding context info.
  public requiresGlobalBindingContext(args: TexlNode[], binding: TexlBinding) {
    return false
  }

  // Returns true if function requires actual data to be pulled for this arg. This is applicable to pagable args only like datasource object.
  // It's used in codegen in optimizing generated code where there is no data is required to be pulled from server.
  protected requiresPagedDataForParamCore(
    args: TexlNode[],
    paramIndex: number,
    binding: TexlBinding
  ) {
    return true
  }

  public requiresPagedDataForParam(
    callNode: CallNode,
    paramIndex: number,
    binding: TexlBinding
  ) {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(callNode.Args);
    // Contracts.Assert(paramIndex >= 0 && paramIndex < callNode.Args.Children.Count());
    // Contracts.AssertValue(binding);

    //         let child = callNode.args.children[paramIndex].VerifyValue();

    const child = callNode.args.children[paramIndex]
    if (!binding.isPageable(child)) {
      return false
    }

    // If the parent call node is pagable then we don't need to pull the data.
    if (binding.isPageable(callNode)) {
      return false
    }

    // Check with function if we actually need data for this param.
    return this.requiresPagedDataForParamCore(
      callNode.args.children,
      paramIndex,
      binding
    )
  }

  /// <summary>
  /// Provides dataentitymetadata for a callnode.
  /// </summary>
  /// <returns></returns>
  public static TryGetEntityMetadata(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IDataEntityMetadata] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let metadata: IDataEntityMetadata
    const args = callNode.args.children
    const result = binding.tryGetEntityInfo(args[0])
    const entityInfo = result[1]

    if (!binding.isPageable(args[0]) || !result[0]) {
      metadata = null
      return [false, metadata]
    }

    // Contracts.AssertValue(entityInfo.ParentDataSource);
    // Contracts.AssertValue(entityInfo.ParentDataSource.DataEntityMetadataProvider);

    const metadataProvider =
      entityInfo.parentDataSource.dataEntityMetadataProvider

    const result2 = metadataProvider.tryGetEntityMetadata(entityInfo.identity)
    const entityMetadata = result2[1]
    if (!result2[0]) {
      metadata = null
      return [false, metadata]
    }

    metadata = entityMetadata
    return [true, metadata]
  }

  /// <summary>
  /// Provides delegationmetadata for a callnode. It's used by delegable functions to get delegation metadata. For example, Filter, Sort, SortByColumns.
  /// </summary>
  /// <returns></returns>
  public static TryGetDelegationMetadata(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IDelegationMetadata] {
    let metadata: IDelegationMetadata
    const result = TexlFunction.TryGetEntityMetadata(callNode, binding)
    const entityMetadata = result[1]
    if (!result[0]) {
      metadata = null
      return [false, metadata]
    }

    metadata = entityMetadata.delegationMetadata
    return [true, metadata]
  }

  // Fetch the description associated with the specified parameter name (which must be the INVARIANT name)
  // If the param has no description, this will return false.
  public tryGetParamDescription(paramName: string): [boolean, string] {
    // Contracts.AssertNonEmpty(paramName);

    // Fetch it from the string resources by default. Subclasses can override this
    // and use their own dictionaries, etc.
    return StringResources.TryGet(
      'About' + this.localeInvariantName + '_' + paramName
    )
  }

  // Exhaustive list of parameter names, in no guaranteed order.
  // (Used by Tests only)
  public getParamNames() {
    return [
      ...new Set(
        this.getSignatures()
          .map((args) => args.map((arg) => arg(null)))
          .flat()
      ),
    ]
  }

  // Allows a function to determine if a given type is valid for a given parameter index.
  public isSuggestionTypeValid(paramIndex: number, type: DType): boolean {
    // Contracts.Assert(paramIndex >= 0);
    // Contracts.AssertValid(type);

    return paramIndex < this.maxArity
  }

  // Functions can use custom logic to determine if an invocation is inherently async, and therefore requires async codegen.
  public isAsyncInvocation(callNode: CallNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    return this.isAsync || this.isServerDelegatable(callNode, binding)
  }

  // Functions which support server delegation need to override this method to verify server delegation can be supported for this CallNode.
  public isServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding
  ): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    return false
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    return (
      binding.isDelegatable(callNode) ||
      this.isServerDelegatable(callNode, binding)
    )
  }

  // Returns true if function is row scoped and supports delegation.
  // Needs to be overriden by functions (For example, IsBlank) which are not server delegatable themselves but can become one when scoped inside a delegatable function.
  public isRowScopedServerDelegatable(
    callNode: CallNode,
    binding: TexlBinding,
    metadata: OperationCapabilityMetadata
  ): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (!binding.isRowScope(callNode)) {
      return false
    }

    return this.isServerDelegatable(callNode, binding)
  }

  public tryGetDataSource(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    if (callNode.args.count < 1) {
      return [false, dsInfo]
    }

    let args = callNode.args.children
    let arg0 = args[0]
    return ArgValidators.DelegatableDataSourceInfoValidator.tryGetValidValue(
      arg0,
      binding
    )
  }

  // Returns a datasource node for a function if function operates on datasource.
  public tryGetDataSourceNodes(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let dsNodes = new Array<FirstNameNode>()
    if (callNode.args.count < 1) {
      return [false, dsNodes]
    }

    const args = callNode.args.children
    const arg0 = args[0]
    return ArgValidators.DataSourceArgNodeValidator.tryGetValidValue(
      arg0,
      binding
    )
  }

  // Returns a entityInfo for a function if function operates on entity.
  public tryGetEntityInfo(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IExpandInfo] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let entityInfo: IExpandInfo
    if (callNode.args.count < 1) {
      return [false, entityInfo]
    }

    const args = callNode.args.children
    const arg0 = args[0]
    return ArgValidators.EntityArgNodeValidator.tryGetValidValue(arg0, binding)
  }

  // Returns a flowInfo for a function if function operates on entity.
  public tryGetFlowInfo(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IFlowInfo] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let info: IFlowInfo
    if (callNode.args.count < 1) {
      return [false, info]
    }

    const args = callNode.args.children
    const arg0 = args[0]
    return ArgValidators.FlowArgNodeValidator.tryGetValidValue(arg0, binding)
  }

  public getIdentifierOfModifiedValue(
    args: TexlNode[]
  ): [Array<Identifier>, TexlNode] {
    let identifierNode: TexlNode = null

    return [null, identifierNode]
  }

  // Optional Override for functions that affect aliases. Allows functions to specify whether they affect aliases
  // given the specific args and binding.
  // public affectsAliasesWith(args: TexlNode[], binding: TexlBinding) {
  //   // Contracts.AssertValue(args);
  //   // Contracts.AssertValue(binding);
  //
  //   return this.affectsAliases
  // }

  // Override if Function.AffectsAliases is true. Given the args and binding for the call,
  // this should return true if there should be a change to aliases, and return the aliasMap as
  // a record DType that specifies a map from alias to DType. Also should change the parentName
  // if the parent control is something besides the current screen.
  // public tryGetAliasMap(args: TexlNode[], binding: TexlBinding): [boolean, DType] {
  //   // Contracts.AssertValue(args);
  //   // Contracts.AssertValue(binding);
  //
  //   const aliasMapType = DType.Invalid
  //   return [false, aliasMapType]
  // }

  // Override if Function.AffectsScopeVariable is true. Given the args and binding for the call,
  // this should return true if there should be a change to app/component variable,
  // and return the variableName as DName that represents the name of an app/component variable
  // and the variableType as any DType that specifies the value of an app/component variable.
  // public tryGetScopeVariablePair(
  //   args: TexlNode[],
  //   binding: TexlBinding,
  // ): [boolean, { variableName: DName; variableType: DType }] {
  //   // Contracts.AssertValue(args);
  //   // Contracts.AssertValue(binding);
  //
  //   const variableName: DName = null
  //   const variableType: DType = DType.Invalid
  //   return [false, { variableName, variableType }]
  // }

  // Override if Function.AffectsAliases or Function.AffectsScopeVariable is true. Returns a list of variable defintion information
  // public getDefinedVariables(args: TexlNode[], binding: TexlBinding): VariableDefinition[] {
  //   return []
  // }

  // Override if Function.AffectsAliases is true. Returns the index of the arg that contains the aliases.
  // public aliasAffectingArg(): number {
  //   return -1
  // }

  // Override if Function.AffectsScopeVariable is true. Returns the index of the arg that contains the app/component variable names.
  public scopeVariableNameAffectingArg(): number {
    return -1
  }

  public requiresDataSourceScope() {
    return false
  }

  public argMatchesDatasourceType(argNum: number) {
    return false
  }

  /// <summary>
  /// Gets TexlNodes of function argument that need to be processed for tabular datasource
  /// E.g. Filter function will have first argument node that will be associated with tabular datasource,
  /// however With function will have Record type argument that can hold multiple datasource type columns
  /// Functions that have datasource arguments in places ither than first argument need to override this.
  /// </summary>
  /// <param name="callNode">Function Texl Node.</param>
  public getTabularDataSourceArg(callNode: CallNode): TexlNode[] {
    // Contracts.AssertValue(callNode);

    return []
  }

  /// <summary>
  /// If true, the scope this function creates isn't used for field names of inline records.
  /// </summary>
  public get skipScopeForInlineRecords() {
    return false
  }

  protected static Arg0RequiresAsync(
    callNode: CallNode,
    binding: TexlBinding
  ): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    const result = TexlFunction.TryGetArg0AsDsInfo(callNode, binding)
    const dataSource = result[1]
    if (!result[0]) {
      return false
    }

    return dataSource.requiresAsync
  }

  private static TryGetArg0AsDsInfo(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let dsInfo: IExternalDataSource
    if (callNode.args.count < 1) {
      return [false, dsInfo]
    }

    const args = callNode.args.children
    const arg0 = args[0]

    const firstName = arg0.asFirstName()
    if (firstName == null || !binding.getType(firstName).isTable) {
      return [false, dsInfo]
    }

    const firstNameInfo = binding.getInfo(firstName)
    if (firstNameInfo == null || firstNameInfo.kind != BindKind.Data) {
      return [false, dsInfo]
    }

    if (binding.entityScope == null) {
      return [false, dsInfo]
    }
    return binding.entityScope.tryGetEntity(firstNameInfo.name)
  }

  protected setErrorForMismatchedColumns(
    expectedType: DType,
    actualType: DType,
    errorArg: TexlNode,
    errors: IErrorContainer
  ): boolean {
    // Contracts.AssertValid(expectedType);
    // Contracts.AssertValid(actualType);
    // Contracts.AssertValue(errorArg);
    // Contracts.AssertValue(errors);

    return this.setErrorForMismatchedColumnsCore(
      expectedType,
      actualType,
      errorArg,
      errors,
      DPath.Root
    )
  }

  // This function recursively traverses the types to find the first occurence of a type mismatch.
  // DTypes are guaranteed to be finite, so there is no risk of a call stack overflow
  private setErrorForMismatchedColumnsCore(
    expectedType: DType,
    actualType: DType,
    errorArg: TexlNode,
    errors: IErrorContainer,
    columnPrefix: DPath
  ): boolean {
    // Contracts.AssertValid(expectedType);
    // Contracts.AssertValid(actualType);
    // Contracts.AssertValue(errorArg);
    // Contracts.AssertValue(errors);
    // Contracts.AssertValid(columnPrefix);

    // Iterate through the expectedType until an error is found.
    for (const expectedColumn of expectedType.getAllNames(DPath.Root)) {
      // First, set type mismatch message.
      let actualColumnType: DType
      const result = actualType.tryGetType(expectedColumn.name)
      actualColumnType = result[1]
      if (result[0]) {
        const expectedColumnType = expectedColumn.type
        if (expectedColumnType.accepts(actualColumnType)) {
          continue
        }
        let errName: string
        const rst = DType.TryGetDisplayNameForColumn(
          expectedType,
          expectedColumn.name.toString()
        )
        errName = rst[1]
        if (!rst[0]) {
          errName = expectedColumn.name.toString()
        }

        if (
          (expectedColumn.type.isTable && actualColumnType.isTable) ||
          (expectedColumn.type.isRecord && actualColumnType.isRecord)
        ) {
          return this.setErrorForMismatchedColumnsCore(
            expectedColumn.type,
            actualColumnType,
            errorArg,
            errors,
            columnPrefix.append(new DName(errName))
          )
        }

        if (
          expectedColumn.type.isExpandEntity &&
          DType.IsMatchingExpandType(expectedColumn.type, actualColumnType)
        ) {
          continue
        }

        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          errorArg,
          TexlStrings.ErrColumnTypeMismatch_ColName_ExpectedType_ActualType,
          columnPrefix.append(new DName(errName)).toDottedSyntax(),
          expectedColumn.type.getKindString(),
          actualColumnType.getKindString()
        )
        return true
      }

      // Second, set column missing message if applicable
      if (this.requireAllParamColumns && !expectedType.areFieldsOptional) {
        errors.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          errorArg,
          TexlStrings.ErrColumnMissing_ColName_ExpectedType,
          columnPrefix.append(expectedColumn.name).toDottedSyntax(),
          expectedColumn.type.getKindString()
        )
        return true
      }
    }

    return false
  }

  // #region Internal functionality

  public get supportsMetadataTypeArg() {
    return false
  }

  public isMetadataTypeArg(index: number) {
    // Contracts.Assert(!SupportsMetadataTypeArg);

    return this.supportsMetadataTypeArg
  }

  // Return true if the function has special suggestions for the corresponding parameter.
  public hasSuggestionsForParam(index: number) {
    return false
  }

  // protected checkType(node: TexlNode, nodeType: DType, expectedType: DType, errors: IErrorContainer): [boolean, matchedWithCoercion: boolean]
  // {
  //     return checkType(node, nodeType, expectedType, errors, this.supportsParamCoercion);
  // }

  protected checkType(
    node: TexlNode,
    nodeType: DType,
    expectedType: DType,
    errors: IErrorContainer,
    coerceIfSupported: boolean = this.supportsParamCoercion
  ): [boolean, boolean] {
    const typeChecks = this.checkTypeWithCoerce(
      node,
      nodeType,
      expectedType,
      errors,
      coerceIfSupported
    )
    const matchedWithCoercion = typeChecks[0] && typeChecks[1] != null
    return [typeChecks[0], matchedWithCoercion]
  }

  // Check the type of a specified node against an expected type and possibly emit errors
  // accordingly. Returns true if the types align, false otherwise.
  protected checkTypeWithCoerce(
    node: TexlNode,
    nodeType: DType,
    expectedType: DType,
    errors: IErrorContainer,
    coerceIfSupported: boolean
  ): [boolean, DType] {
    // Contracts.AssertValue(node);
    // Contracts.Assert(nodeType.IsValid);
    // Contracts.Assert(expectedType.IsValid);
    // Contracts.AssertValue(errors);

    let coercionType: DType
    const result = expectedType.acceptsOut(nodeType)
    const schemaDifference = result[1].schemaDifference
    const schemaDifferenceType = result[1].schemaDifferenceType
    if (result[0]) {
      return [true, coercionType]
    }

    let coercionDifference: KeyValuePair<string, DType>
    let coercionDifferenceType: DType
    if (coerceIfSupported) {
      const rst = nodeType.coercesTo(expectedType)
      coercionDifference = rst[1].schemaDifference
      coercionDifferenceType = rst[1].schemaDifferenceType
      coercionType = rst[1].coercionType
      return [true, coercionType]
    }

    // If we could coerce some but not all of it we don't want errors for the coercible fields
    const targetType = coercionType ?? nodeType
    const targetDifference =
      coercionType == null ? schemaDifference : coercionDifference
    const targetDifferenceType =
      coercionType == null ? schemaDifferenceType : coercionDifferenceType

    if (
      (targetType.isTable && nodeType.isTable) ||
      (targetType.isRecord && nodeType.isRecord)
    ) {
      if (
        this.setErrorForMismatchedColumns(
          expectedType,
          targetType,
          node,
          errors
        )
      ) {
        return [false, coercionType]
      }
    }

    if (nodeType.kind == expectedType.kind) {
      // If coercion type is non null and coercion difference is, then the node should have been coercible.
      // This likely indicates a bug in CoercesTo, called above
      errors.errors(node, targetType, targetDifference, targetDifferenceType)
    } else {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrBadType_ExpectedType_ProvidedType,
        expectedType.getKindString(),
        nodeType.getKindString()
      )
    }

    return [false, coercionType]
  }

  private checkColumnType(
    type: DType,
    arg: TexlNode,
    expectedType: DType,
    errors: IErrorContainer,
    errKey: ErrorResourceKey,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [boolean, Dictionary<TexlNode, DType>] {
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertValue(arg);
    // Contracts.Assert(expectedType.IsValid);
    // Contracts.AssertValue(errors);

    // IEnumerable<TypedName> columns;
    let columns: TypedName[]
    if (!type.isTable || (columns = type.getNames(DPath.Root)).length != 1) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        arg,
        TexlStrings.ErrInvalidSchemaNeedCol
      )
      return [false, nodeToCoercedTypeMap]
    } else {
      const column = columns.length === 1 ? columns[0] : null
      if (!expectedType.accepts(column.type)) {
        if (this.supportsParamCoercion && column.type.coercesTo(expectedType)) {
          expectedType = DType.CreateTable(
            new TypedName(expectedType, column.name)
          )
          CollectionUtils.AddDictionary(nodeToCoercedTypeMap, arg, expectedType)
        } else {
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            arg,
            errKey,
            column.name.value
          )
          return [false, nodeToCoercedTypeMap]
        }
      }
    }

    return [true, nodeToCoercedTypeMap]
  }

  // Check that the type of a specified node is a numeric column type, and possibly emit errors
  // accordingly. Returns true if the types align, false otherwise. matchedWithCoercion is set
  // to true if the types align only with coercion.
  public checkNumericColumnType(
    type: DType,
    arg: TexlNode,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [boolean, Dictionary<TexlNode, DType>] {
    return this.checkColumnType(
      type,
      arg,
      DType.Number,
      errors,
      TexlStrings.ErrInvalidSchemaNeedNumCol_Col,
      nodeToCoercedTypeMap
    )
  }

  // Check that the type of a specified node is a color column type, and possibly emit errors
  // accordingly. Returns true if the types align, false otherwise.
  protected checkColorColumnType(
    type: DType,
    arg: TexlNode,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [boolean, Dictionary<TexlNode, DType>] {
    return this.checkColumnType(
      type,
      arg,
      DType.Color,
      errors,
      TexlStrings.ErrInvalidSchemaNeedColorCol_Col,
      nodeToCoercedTypeMap
    )
  }

  // Check that the type of a specified node is a string column type, and possibly emit errors
  // accordingly. Returns true if the types align, false otherwise.
  protected checkStringColumnType(
    type: DType,
    arg: TexlNode,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [boolean, Dictionary<TexlNode, DType>] {
    return this.checkColumnType(
      type,
      arg,
      DType.String,
      errors,
      TexlStrings.ErrInvalidSchemaNeedStringCol_Col,
      nodeToCoercedTypeMap
    )
  }

  // Check that the type of a specified node is a date column type, and possibly emit errors
  // accordingly. Returns true if the types align, false otherwise.
  protected checkDateColumnType(
    type: DType,
    arg: TexlNode,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [boolean, Dictionary<TexlNode, DType>] {
    return this.checkColumnType(
      type,
      arg,
      DType.DateTime,
      errors,
      TexlStrings.ErrInvalidSchemaNeedDateCol_Col,
      nodeToCoercedTypeMap
    )
  }

  // Enumerate some of the function signatures for a specified arity and known parameter descriptions.
  // The last parameter may be repeated as many times as necessary in order to satisfy the arity constraint.
  protected getGenericSignatures(
    arity: number,
    ...args: StringGetter[]
  ): Array<StringGetter[]> {
    // Contracts.Assert(MinArity <= arity && arity <= MaxArity);
    // Contracts.AssertValue(args);
    // Contracts.Assert(args.Length > 0);

    let signatureCount = 5
    let argCount = arity

    // Limit the signature length of params descriptions.
    if (
      this.signatureConstraint != null &&
      arity + signatureCount > this.signatureConstraint.repeatTopLength
    ) {
      signatureCount =
        this.signatureConstraint.repeatTopLength - arity > 0
          ? this.signatureConstraint.repeatTopLength - arity
          : 1
      argCount =
        arity < this.signatureConstraint.repeatTopLength
          ? arity
          : this.signatureConstraint.repeatTopLength
    }

    let signatures: Array<StringGetter[]> = []
    let lastArg = args[args.length]

    for (let sigIndex = 0; sigIndex < signatureCount; sigIndex++) {
      const signature: StringGetter[] = []

      // Populate from the given args (as much as possible). The last arg will be repeated.
      for (let i = 0; i < argCount; i++) {
        signature[i] = i < args.length ? args[i] : lastArg
      }

      signatures.push(signature)
      argCount++
    }
    return signatures
  }

  protected addSuggestionMessageToTelemetry(
    telemetryMessage: string,
    node: TexlNode,
    binding: TexlBinding
  ) {
    // Contracts.AssertNonEmpty(telemetryMessage);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);

    const message = `Function:${this.name}, Message:${telemetryMessage}`
    TrackingProvider.Instance.addSuggestionMessage(message, node, binding)
  }

  protected suggestDelegationHint(
    node: TexlNode,
    binding: TexlBinding,
    telemetryMessage?: string
  ) {
    // this.suggestDelegationHint(node, binding);
    binding.errorContainer.ensureErrorWithSeverity(
      DocumentErrorSeverity.Warning,
      node,
      TexlStrings.SuggestRemoteExecutionHint,
      this.name
    )
    if (telemetryMessage != null) {
      this.addSuggestionMessageToTelemetry(telemetryMessage, node, binding)
    }
  }

  // Helper used to provide hints when we detect non-delegable parts of the expression due to server restrictions.
  // protected suggestDelegationHint(node: TexlNode, binding: TexlBinding)
  // {
  //     // Contracts.AssertValue(node);
  //     // Contracts.AssertValue(binding);
  //     binding.errorContainer.ensureErrorWithSeverity(DocumentErrorSeverity.Warning, node, TexlStrings.SuggestRemoteExecutionHint, this.name);
  // }

  protected checkArgsCount(
    callNode: CallNode,
    binding: TexlBinding,
    errorSeverity = DocumentErrorSeverity.Suggestion
  ): boolean {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    if (binding.errorContainer.hasErrors(callNode, errorSeverity)) {
      return false
    }

    const args = callNode.args.children
    const cargs = args.length
    return !(cargs < this.minArity || cargs > this.maxArity)
  }

  // Helper used to validate call node and get delegatable datasource value.
  protected tryGetValidDataSourceForDelegation(
    callNode: CallNode,
    binding: TexlBinding,
    expectedCapability: DelegationCapability
  ): [boolean, IExternalDataSource] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);

    let dataSource: IExternalDataSource

    // Only check for errors with severity more than warning.
    // Ignore warning errors as it's quite possible to have delegation warnings on a node in different call node context.
    // For example, Filter(CDS, A = B) It's possible that B as itself is delegatable but in the context of Filter it's not and could have warning on it.
    if (
      binding.errorContainer.hasErrors(callNode, DocumentErrorSeverity.Moderate)
    ) {
      return [false, dataSource]
    }

    const result = this.tryGetDataSource(callNode, binding)
    dataSource = result[1]
    if (!result[0]) {
      return [false, dataSource]
    }

    // Check if DS is server delegatable.
    return [
      dataSource.isDelegatable &&
        dataSource.delegationMetadata.tableCapabilities.hasCapability(
          expectedCapability.capabilities
        ),
      dataSource,
    ]
  }

  /// <summary>
  /// Removes the Attachments field from <see cref="itemType"/> if it is defined and returns true if
  /// successful and false if an error was present.  If the Attachments field is not defined, does nothing
  /// and returns true.
  /// </summary>
  /// <remarks>
  /// We ignore the Attachments field on all types in the invocation because it is a special column that
  /// is delay loaded.  It is stripped from the type when used in functions like Set and is ignored in
  /// Collect.CheckInvocation.
  /// </remarks>
  /// <param name="itemType">Type that may define Attachments.</param>
  /// <param name="errors">Errors.</param>
  /// <param name="node">Node to which <see cref="itemType"/> is associated.</param>
  /// <returns>
  /// True if operation succeeded, if no Attachments field is defined or the Attachments field
  /// has been successfully removed from <see cref="itemType"/>, false otherwise.
  /// </returns>
  protected dropAttachmentsIfExists(
    itemType: DType,
    errors: IErrorContainer,
    node: TexlNode
  ): [boolean, DType] {
    // Contracts.AssertValid(itemType);
    // Contracts.AssertValue(errors);
    // Contracts.AssertValue(node);

    if (itemType.containsAttachmentType(DPath.Root)) {
      return this.dropAllOfKindNested(itemType, errors, node, DKind.Attachment)
    }

    return [true, itemType]
  }

  // Helper to drop all of a single types from a result type
  protected dropAllOfKindNested(
    itemType: DType,
    errors: IErrorContainer,
    node: TexlNode,
    kind: DKind
  ): [boolean, DType] {
    // Contracts.AssertValid(itemType);
    // Contracts.AssertValue(errors);
    // Contracts.AssertValue(node);

    let fError = false
    const result = itemType.dropAllOfKindNested(fError, DPath.Root, kind)
    itemType = result[0]
    fError = result[1]
    if (fError) {
      errors.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrIncompatibleTypes
      )

      // As DropAllOfKind doesn't set returned type to erroneous in case of failure, explicitly set it here.
      itemType = DType.Error
      return [false, itemType]
    }

    return [true, itemType]
  }

  public tryGetDelegationMetadata(
    node: CallNode,
    binding: TexlBinding
  ): [boolean, IDelegationMetadata] {
    let metadata: IDelegationMetadata = null
    return [false, metadata]
  }

  public getOpDelegationStrategy(
    op: BinaryOp,
    opNode: BinaryOpNode
  ): IOpDelegationStrategy {
    // Contracts.AssertValueOrNull(opNode);
    if (op == BinaryOp.In) {
      // Contracts.AssertValue(opNode);
      // Contracts.Assert(opNode.Op == op);

      return new InOpDelegationStrategy(opNode, this)
    }

    return new DefaultBinaryOpDelegationStrategy(op, this)
  }

  // This updates the field projection info for datasources. For most of the functions, binder takes care of it.
  // But if functions have specific semantics then this allows functions to contribute this information.
  // For example, Search function which references columns as string literals.
  public updateDataQuerySelects(
    node: CallNode,
    binding: TexlBinding,
    dataSourceToQueryOptionsMap: DataSourceToQueryOptionsMap
  ): boolean {
    return false
  }

  public getOpDelegationStrategyOfUnaryOp(op: UnaryOp): IOpDelegationStrategy {
    return new DefaultUnaryOpDelegationStrategy(op, this)
  }

  public getCallNodeDelegationStrategy(): ICallNodeDelegatableNodeValidationStrategy {
    return new DelegationValidationStrategy(this)
  }

  public getDottedNameNodeDelegationStrategy(): IDottedNameNodeDelegatableNodeValidationStrategy {
    return new DelegationValidationStrategy(this)
  }

  public getFirstNameNodeDelegationStrategy(): IFirstNameNodeDelegatableNodeValidationStrategy {
    return new DelegationValidationStrategy(this)
  }

  // Check the type of a specified node against an expected type (either desiredType or DType.Table with a desiredType column)
  // and possibly emit errors accordingly. Returns true if the types align, false otherwise.
  protected checkParamIsTypeOrSingleColumnTable(
    desiredType: DType,
    node: TexlNode,
    nodeType: DType,
    errors: IErrorContainer,
    nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
  ): [
    boolean,
    { isTable: boolean; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.Assert(desiredType.IsValid);
    // Contracts.AssertValue(node);
    // Contracts.Assert(nodeType.IsValid);
    // Contracts.AssertValue(errors);

    let isTable: boolean = false

    if (desiredType.accepts(nodeType)) {
      return [true, { isTable, nodeToCoercedTypeMap }]
    }

    if (this.supportsParamCoercion && nodeType.coercesTo(desiredType)) {
      CollectionUtils.AddDictionary(nodeToCoercedTypeMap, node, desiredType)
      return [true, { isTable, nodeToCoercedTypeMap }]
    }

    if (nodeType.isTable) {
      let count = 0
      isTable = true
      for (const col of nodeType.getNames(DPath.Root)) {
        count++
        if (!desiredType.accepts(col.type)) {
          if (this.supportsParamCoercion && col.type.coercesTo(desiredType)) {
            desiredType = DType.CreateTable(
              new TypedName(desiredType, col.name)
            )
            CollectionUtils.AddDictionary(
              nodeToCoercedTypeMap,
              node,
              desiredType
            )
          } else {
            errors.ensureErrorWithSeverity(
              DocumentErrorSeverity.Severe,
              node,
              TexlStrings.ErrFunctionDoesNotAcceptThisType_Function_Expected,
              this.name,
              desiredType.getKindString()
            )
            return [false, { isTable, nodeToCoercedTypeMap }]
          }
        }
      }

      if (count == 1) {
        return [true, { isTable, nodeToCoercedTypeMap }]
      }
    }

    errors.ensureError(
      node,
      TexlStrings.ErrFunctionDoesNotAcceptThisType_Function_Expected,
      this.name,
      desiredType.getKindString()
    )
    return [false, { isTable, nodeToCoercedTypeMap }]
  }

  protected checkAllParamsAreTypeOrSingleColumnTable(
    desiredType: DType,
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.Length == argTypes.Length);
    // Contracts.AssertValue(errors);

    let fValid = true
    let nodeToCoercedTypeMap = new Dictionary<TexlNode, DType>()

    let returnType = DType.Invalid

    // Type check the args
    for (let i = 0; i < args.length; i++) {
      const result = this.checkParamIsTypeOrSingleColumnTable(
        desiredType,
        args[i],
        argTypes[i],
        errors,
        nodeToCoercedTypeMap
      )
      const isTable = result[1].isTable
      nodeToCoercedTypeMap = result[1].nodeToCoercedTypeMap
      fValid &&= result[0]

      // If there are any table args, the return type depends on the first such arg.
      if (isTable && returnType == DType.Invalid) {
        if (fValid && nodeToCoercedTypeMap.size > 0) {
          returnType = DType.CreateTable(
            new TypedName(
              desiredType,
              argTypes[i].getNames(DPath.Root).length === 1
                ? argTypes[i].getNames(DPath.Root)[0].name
                : undefined
            )
          )
        } else {
          returnType = argTypes[i]
        }
      }
    }

    // If the returnType hasn't been set, we are working with only scalars.
    if (returnType == DType.Invalid) {
      returnType = desiredType
    }

    if (!fValid) {
      nodeToCoercedTypeMap = null
    }

    return [fValid, { returnType, nodeToCoercedTypeMap }]
  }

  // #endregion:

  info(locale: string): FunctionInfo {
    // If the locale has changed, we want to reset the function info to one of the new locale
    if (
      CurrentLocaleInfo.CurrentUILanguageName == this._cachedLocaleName &&
      this._cachedFunctionInfo != null
    ) {
      return this._cachedFunctionInfo
    }

    this._cachedLocaleName = CurrentLocaleInfo.CurrentUILanguageName
    return (this._cachedFunctionInfo = new FunctionInfo(
      this.name,
      this.description,
      null,
      this.getSignatures().map(
        (signature) =>
          new FunctionSignature(
            this.name +
              (signature == null
                ? '()'
                : '(' +
                  signature
                    .map((getter) => getter())
                    .join(
                      TexlLexer.LocalizedInstance
                        .localizedPunctuatorListSeparator + ' '
                    ) +
                  ')'),
            signature?.map((getter) => {
              const description = this.tryGetParamDescription(getter(locale))[1]
              return new ParameterInfo(getter(), description)
            })
          )
      )
    ))
  }
}
