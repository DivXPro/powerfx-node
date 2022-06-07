import {
  IExternalControl,
  IsIExternalControl,
} from '../app/controls/IExternalControl'
import { IExternalControlProperty } from '../app/controls/IExternalControlProperty'
import {
  ErrorContainer,
  IErrorContainer,
  LimitedSeverityErrorContainer,
} from '../app/errorContainers'
import { IExternalRule } from '../app/controls/IExternalRule'
import {
  IExternalTabularDataSource,
  IsIExternalTabularDataSource,
} from '../entities/external/IExternalTabularDataSource'
import { DataSourceToQueryOptionsMap } from '../entities/queryOptions/DataSourceToQueryOptionsMap'
import { TexlFunction } from '../functions/TexlFunction'
import { IBinderGlue } from '../glue/BinderGlue'
import { BinaryOp } from '../lexer/BinaryOp'
import { Token } from '../lexer/tokens'
import { ErrorResourceKey, Span, TexlStrings } from '../localization'
import {
  AsNode,
  BinaryOpNode,
  BlankNode,
  BoolLitNode,
  CallNode,
  DottedNameNode,
  ErrorNode,
  FirstNameNode,
  Identifier,
  ListNode,
  NumLitNode,
  ParentNode,
  RecordNode,
  ReplaceableNode,
  SelfNode,
  StrInterpNode,
  StrLitNode,
  TableNode,
  TexlNode,
  TexlVisitor,
  UnaryOpNode,
  VariadicBase,
  VariadicOpNode,
} from '../syntax'
import { NodeKind } from '../syntax/NodeKind'
import { BuiltinFunctionsCore } from '../texl/BuiltinFunctionsCore'
import { DType } from '../types/DType'
import { IExpandInfo, IsIExpandInfo } from '../types/IExpandInfo'
import {
  IExternalControlType,
  IsIExternalControlType,
} from '../types/IExternalControlType'
import { BitArray } from '../utils/BitArray'
import { Dictionary } from '../utils/Dictionary'
import { DName, DPath } from '../utils'
import { KeyValuePair } from '../utils/types'
import { BinderNodesVisitor } from './BinderNodesVisitor'
import {
  AsInfo,
  CallInfo,
  ControlKeywordInfo,
  DottedNameInfo,
  FirstNameInfo,
  NameInfo,
  NameLookupInfo,
  ParentInfo,
  SelfInfo,
} from './bindingInfo'
import { BindKind } from './BindKind'
import { INameResolver, NameLookupPreferences } from './INameResolver'
import { ScopeUseSet } from './ScopeUseSet'
import { DKind } from '../types/DKind'
import { LeafNodeType, NonLeafNodeType } from '../syntax/visitors/types'
import { DataSourceKind } from '../entities/DataSourceKind'
import { IExternalCdsDataSource } from '../entities/external/IExternalCdsDataSource'
import { TokKind } from '../lexer/TokKind'
import { IExternalRuleScopeResolver } from '../app/controls/IExternalRuleScopeResolver'
import { DocumentErrorSeverity } from '../errors'
import { IQualifiedValuesInfo } from '../entities/IQualifiedValuesInfo'
import { IExternalControlTemplate } from '../app/controls/IExternalControlTemplate'
import { PropertyRuleCategory } from '../app/controls/PropertyRuleCategory'
import { UnaryOp } from '../lexer/UnaryOp'
import { BinderUtils } from './BinderUtils'
import { IExternalDataSource } from '../entities/external/IExternalDataSource'
import { PropertyRuleCategoryExtensions } from '../app/controls/PropertyRuleCategoryExtensions'
import { ComponentType } from '../app/components/ComponentType'
import { TypedName } from '../types/TypedName'
import { VariadicOp } from '../lexer/VariadicOp'
import { FieldNameKind } from '../types/FieldNameKind'
import { IDelegationMetadata } from '../functions/delegation/IDelegationMetadata'
import { IExternalColumnMetadata } from '../entities/external/IExternalColumnMetadata'
import { DataFormat } from '../app/DataFormat'
import { IExternalTableMetadata } from '../entities/external/IExternalTableMetadata'
import { DataTableMetadata } from '../entities/DataTableMetadata'
import { DataColumnMetadata } from '../entities/DataColumnMetadata'
import { ExpandPath } from '../types'
import { IFlowInfo, IsIFlowInfo } from '../types/IFlowInfo'

export class TexlBinding {
  private readonly _glue: IBinderGlue

  public get glue() {
    return this._glue
  }

  // The parse tree for this binding.
  public readonly top: TexlNode

  // Path of entity where this formula was bound.
  public readonly entityPath: DPath

  // Name of entity where this formula was bound.
  public readonly entityName: DName

  // The name resolver associated with this binding.
  public readonly nameResolver: INameResolver

  // The local scope resolver associated with this binding.
  public readonly localRuleScopeResolver: IExternalRuleScopeResolver

  // Maps Ids to Types, where the Id is an index in the array.
  public _typeMap: DType[]
  private _coerceMap: DType[]

  // Maps Ids to whether the node/subtree is async or not. A subtree
  // that has async components is itself async, so the async aspect of an expression
  // propagates up the parse tree all the way to the root.
  private _asyncMap: boolean[]

  // Used to mark nodes as delegatable or not.
  private _isDelegatable: BitArray

  // Used to mark node as pageable or not.
  private _isPageable: BitArray

  // Extra information. We have a slot for each node.
  // Maps Ids to Info, where the Id is an index in the array.
  public _infoMap: any[]

  private _lambdaParams: Dictionary<number, Array<FirstNameInfo>>

  // Whether a node is stateful or has side effects or is contextual or is constant.
  private _isStateful: BitArray
  private _hasSideEffects: BitArray
  private _isContextual: BitArray
  private _isConstant: BitArray
  private _isSelfContainedConstant: BitArray

  // Whether a node supports its rowscoped param exempted from delegation check. e.g. The 3rd argument in AddColumns function
  private _supportsRowScopedParamDelegationExempted: BitArray
  // Whether a node is an ECS excempt lambda. e.g. filter lambdas
  private _isEcsExcemptLambda: BitArray
  // Whether a node is inside delegable function but its value only depends on the outer scope(higher than current scope)
  private _isBlockScopedConstant: BitArray

  // Property to which current rule is being bound to. It could be null in the absence of NameResolver.
  private readonly _property: IExternalControlProperty
  private readonly _control: IExternalControl

  // Whether a node is scoped to app or not. Used by translator for component scoped variable references.
  private _isAppScopedVariable: BitArray

  // The scope use sets associated with all the nodes.
  private _lambdaScopingMap: ScopeUseSet[]

  private _typesNeedingMetadata: Array<DType>
  private _hasThisItemReference: boolean

  private _forceUpdateDisplayNames: boolean

  get forceUpdateDisplayNames() {
    return this._forceUpdateDisplayNames
  }

  private _hasLocalReferences: boolean

  get hasLocalReferences() {
    return this._hasLocalReferences
  }

  set hasLocalReferences(val: boolean) {
    this._hasLocalReferences = val
  }

  // If As is used at the toplevel, contains the rhs value of the As operand;
  private _renamedOutputAccessor: DName

  // A mapping of node ids to lists of variable identifiers that are to have been altered in runtime prior
  // to the node of the id, e.g. Set(x, 1); Set(y, x + 1);
  // All child nodes of the chaining operator that come after Set(x, 1); will have a variable weight that
  // contains x
  private _volatileVariables: Set<string>[]

  // This is set when a First Name node or child First Name node contains itself in its variable weight
  // and can be read by the back end to determine whether it may generate code that lifts or caches an
  // expression
  private _isUnliftable: BitArray

  public get hasLocalScopeReferences() {
    return this._hasLocalReferences
  }

  public readonly errorContainer: ErrorContainer = new ErrorContainer()

  /// <summary>
  /// The maximum number of selects in a table that will be included in data call.
  /// </summary>
  public static MaxSelectsToInclude = 100

  /// <summary>
  /// Default name used to access a Lambda scope
  /// </summary>
  public thisRecordDefaultName = new DName('ThisRecord')

  // Property to which current rule is being bound to. It could be null in the absence of NameResolver.
  public get property() {
    //         get
    //         {
    // #if DEBUG
    //             if (NameResolver?.CurrentEntity?.IsControl == true && NameResolver.CurrentProperty.IsValid && NameResolver.TryGetCurrentControlProperty(out let currentProperty)
    //                 Contracts.Assert(_property == currentProperty);
    // #endif
    return this._property
    // }
  }

  // Control to which current rule is being bound to. It could be null in the absence of NameResolver.
  public get control() {
    //         get
    //         {
    // #if DEBUG
    //             if (NameResolver != null && NameResolver.CurrentEntity != null && NameResolver.CurrentEntity.IsControl)
    //                 Contracts.Assert(NameResolver.CurrentEntity == _control);
    // #endif
    return this._control
    // }
  }

  // We store this information here instead of on TabularDataSourceInfo is that this information should change as the rules gets edited
  // and we shouldn't store information about the fields user tried but didn't end up in final rule.
  private _queryOptions: DataSourceToQueryOptionsMap
  public get queryOptions() {
    return this._queryOptions
  }

  public usesGlobals: boolean
  public usesAliases: boolean
  public usesScopeVariables: boolean
  public usesScopeCollections: boolean
  public usesThisItem: boolean
  public usesResources: boolean
  public usesOptionSets: boolean
  public usesViews: boolean
  public transitionsFromAsyncToSync: boolean
  public get idLim() {
    return this._infoMap == null ? 0 : this._infoMap.length
  }
  public get resultType() {
    return this.getType(this.top)
  }

  // The coerced type of the rule after name-mapping.
  public coercedToplevelType: DType
  public get hasThisItemReference() {
    return this._hasThisItemReference || this.usesThisItem
  }
  public set hasThisItemReference(val: boolean) {
    this._hasThisItemReference = val
  }
  public hasParentItemReference: boolean
  public hasSelfReference: boolean
  public get isBehavior() {
    return (
      this.nameResolver != null && this.nameResolver.currentPropertyIsBehavior
    )
  }
  public get isConstantData() {
    return (
      this.nameResolver != null &&
      this.nameResolver.currentPropertyIsConstantData
    )
  }
  public get isNavigationAllowed() {
    return (
      this.nameResolver != null &&
      this.nameResolver.currentPropertyAllowsNavigation
    )
  }
  public get document() {
    return this.nameResolver != null ? this.nameResolver.document : undefined
  }

  public affectsAliases: boolean
  public affectsScopeVariable: boolean
  public affectsScopeVariableName: boolean
  public affectsTabularDataSources: boolean = false
  public hasControlReferences: boolean

  /// <summary>
  /// UsedControlProperties  is for processing edges required for indirect control property references
  /// </summary>
  public readonly usedControlProperties = new Set<DName>()

  public hasSelectFunc: boolean
  public hasReferenceToAttachment: boolean
  public get isGloballyPure() {
    return (
      !(
        this.usesGlobals ||
        this.usesThisItem ||
        this.usesAliases ||
        this.usesScopeVariables ||
        this.usesResources ||
        this.usesScopeCollections
      ) && this.isPure(this.top)
    )
  }
  public get isCurrentPropertyPageable() {
    return this.property != null && this.property.supportsPaging
  }
  public get currentPropertyRequiresDefaultableReferences() {
    return (
      this.property != null &&
      this.property.requiresDefaultablePropertyReferences
    )
  }
  public get containsAnyPageableNode() {
    for (const isPageable of this._isPageable) {
      if (isPageable[1] === true) {
        return true
      }
    }
    return false
  }
  public get entityScope() {
    return this.nameResolver?.entityScope
  }
  public get topParentUniqueId() {
    return this.entityPath.isRoot ? '' : this.entityPath.at(0)
  }

  // Stores tokens that need replacement (Display Name -> Logical Name) for serialization
  // Replace Nodes (Display Name -> Logical Name) for serialization
  public nodesToReplace: Array<KeyValuePair<Token, string>>
  public updateDisplayNames: boolean
  /// <summary>
  /// The fields of this type are defined as valid keywords for this binding.
  /// </summary>
  public contextScope: DType

  public rule: IExternalRule

  constructor(
    glue: IBinderGlue,
    scopeResolver: IExternalRuleScopeResolver,
    queryOptions: DataSourceToQueryOptionsMap,
    node: TexlNode,
    resolver: INameResolver,
    ruleScope: DType,
    useThisRecordForRuleScope: boolean,
    updateDisplayNames = false,
    forceUpdateDisplayNames = false,
    rule?: IExternalRule
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValueOrNull(resolver);
    // Contracts.AssertValueOrNull(scopeResolver);

    this._queryOptions = queryOptions
    this._glue = glue
    this.top = node
    this.nameResolver = resolver
    this.localRuleScopeResolver = scopeResolver

    const idLim = node.id + 1
    this._typeMap = []
    this._coerceMap = []
    this._lambdaScopingMap = []
    this._infoMap = []
    this._asyncMap = []
    this._lambdaParams = new Dictionary<number, Array<FirstNameInfo>>()
    this._isStateful = new BitArray()
    this._hasSideEffects = new BitArray()
    this._isAppScopedVariable = new BitArray()
    this._isContextual = new BitArray()
    this._isConstant = new BitArray()
    this._isSelfContainedConstant = new BitArray()
    this._isDelegatable = new BitArray()
    this._isPageable = new BitArray()
    this._isEcsExcemptLambda = new BitArray()
    this._supportsRowScopedParamDelegationExempted = new BitArray()
    this._isBlockScopedConstant = new BitArray()
    this._volatileVariables = []
    this._isUnliftable = new BitArray()
    for (let i = 0; i < idLim; ++i) {
      this._typeMap[i] = DType.Invalid
      this._coerceMap[i] = DType.Invalid

      //初始化指定长度的数组
      this._lambdaScopingMap.push(new ScopeUseSet(undefined))
      this._infoMap.push(null)
      this._asyncMap.push(false)
      this._isStateful.set(i, false)
      this._hasSideEffects.set(i, false)
      this._isAppScopedVariable.set(i, false)
      this._isContextual.set(i, false)
      this._isConstant.set(i, false)
      this._isSelfContainedConstant.set(i, false)
      this._isDelegatable.set(i, false)
      this._isPageable.set(i, false)
      this._isEcsExcemptLambda.set(i, false)
      this._supportsRowScopedParamDelegationExempted.set(i, false)
      this._isBlockScopedConstant.set(i, false)
      this._volatileVariables.push(null)
      this._isUnliftable.set(i, false)
    }
    this.coercedToplevelType = DType.Invalid

    this._hasThisItemReference = false
    this._renamedOutputAccessor = DName.Default()

    this.hasParentItemReference = false

    this.contextScope = ruleScope
    this.binderNodeMetadataArgTypeVisitor =
      new BinderNodesMetadataArgTypeVisitor(
        this,
        resolver,
        ruleScope,
        useThisRecordForRuleScope
      )
    this.hasReferenceToAttachment = false
    this.nodesToReplace = []
    this.updateDisplayNames = updateDisplayNames
    this._forceUpdateDisplayNames = forceUpdateDisplayNames
    this._hasLocalReferences = false
    this.transitionsFromAsyncToSync = false
    this.rule = rule
    if (resolver != null) {
      this.entityPath = resolver.currentEntityPath
      this.entityName =
        resolver.currentEntity == null
          ? DName.Default()
          : resolver.currentEntity.entityName
    }

    if (resolver) {
      const result = resolver?.tryGetCurrentControlProperty()
      this._property = result[1]
    }
    this._control = resolver?.currentEntity as IExternalControl
  }

  // Binds a Texl parse tree.
  // * resolver provides the name context used to bind names to globals, resources, etc. This may be null.
  public static Run(props: {
    glue: IBinderGlue
    scopeResolver?: IExternalRuleScopeResolver
    queryOptionsMap: DataSourceToQueryOptionsMap
    node: TexlNode
    resolver: INameResolver
    updateDisplayNames?: boolean
    ruleScope?: DType
    forceUpdateDisplayNames?: boolean
    rule?: IExternalRule
    useThisRecordForRuleScope?: boolean
    path?: ExpandPath
  }): TexlBinding {
    // Contracts.AssertValue(node);
    // Contracts.AssertValueOrNull(resolver);
    const {
      glue,
      scopeResolver,
      queryOptionsMap,
      node,
      resolver,
      updateDisplayNames = false,
      ruleScope,
      forceUpdateDisplayNames = false,
      rule = undefined,
      useThisRecordForRuleScope = false,
      path,
    } = props
    const txb = new TexlBinding(
      glue,
      scopeResolver,
      queryOptionsMap,
      node,
      resolver,
      ruleScope,
      useThisRecordForRuleScope,
      updateDisplayNames,
      forceUpdateDisplayNames,
      rule
    )
    const vis = new Visitor(txb, resolver, ruleScope, useThisRecordForRuleScope)
    vis.run()
    // Determine if a rename has occured at the top level
    if (txb.top instanceof AsNode) {
      txb._renamedOutputAccessor = (txb.getInfo(txb.top) as AsInfo).asIdentifier
    }
    return txb
  }

  // public static Run(glue: IBinderGlue, node: TexlNode, resolver: INameResolver, updateDisplayNames = false, ruleScope: DType = null, forceUpdateDisplayNames = false, rule: IExternalRule = null): TexlBinding
  // {
  //     return TexlBinding.Run(glue, null, new DataSourceToQueryOptionsMap(), node, resolver, updateDisplayNames, ruleScope, forceUpdateDisplayNames, rule);
  // }

  // public static Run(glue: IBinderGlue, node: TexlNode, resolver: INameResolver, ruleScope: DType, useThisRecordForRuleScope = false): TexlBinding
  // {
  //     return TexlBinding.Run(glue, null, new DataSourceToQueryOptionsMap(), node, resolver, false, ruleScope, false, null, useThisRecordForRuleScope);
  // }

  public widenResultType() {
    this.setType(this.top, DType.Error)
    this.errorContainer.ensureErrorWithSeverity(
      DocumentErrorSeverity.Severe,
      this.top,
      TexlStrings.ErrTypeError
    )
  }

  public getType(node: TexlNode): DType {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(_typeMap[node.Id].IsValid);
    return this._typeMap[node.id]
  }

  public setType(node: TexlNode, type: DType) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(_typeMap[node.Id] == null || !_typeMap[node.Id].IsValid || type.IsError);

    this._typeMap[node.id] = type
  }

  public setContextual(node: TexlNode, isContextual: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(isContextual || !_isContextual.Get(node.Id));

    this._isContextual.set(node.id, isContextual)
  }

  public setConstant(node: TexlNode, isConstant: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(isConstant || !_isConstant.Get(node.Id));

    this._isConstant.set(node.id, isConstant)
  }

  public setSelfContainedConstant(node: TexlNode, isConstant: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(isConstant || !_isSelfContainedConstant.Get(node.Id));

    this._isSelfContainedConstant.set(node.id, isConstant)
  }

  public setSideEffects(node: TexlNode, hasSideEffects: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(hasSideEffects || !_hasSideEffects.Get(node.Id));

    this._hasSideEffects.set(node.id, hasSideEffects)
  }

  public setStateful(node: TexlNode, isStateful: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(isStateful || !_isStateful.Get(node.Id));

    this._isStateful.set(node.id, isStateful)
  }

  public setAppScopedVariable(
    node: FirstNameNode,
    isAppScopedVariable: boolean
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.Assert(isAppScopedVariable || !_isAppScopedVariable.Get(node.Id));

    this._isAppScopedVariable.set(node.id, isAppScopedVariable)
  }

  public isAppScopedVariable(node: FirstNameNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    return this._isAppScopedVariable.get(node.id)
  }

  /// <summary>
  /// See documentation for <see cref="GetVolatileVariables"/> for more information
  /// </summary>
  /// <param name="node">
  /// Node to which volatile variables are being added
  /// </param>
  /// <param name="variables">
  /// The variables that are to be added to the list associated with <see cref="node"/>
  /// </param>
  public addVolatileVariables(node: TexlNode, variables: Set<string>) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _volatileVariables.Length);
    const volatileVariables =
      this._volatileVariables[node.id] ?? new Set<string>()
    this._volatileVariables[node.id] = new Set([
      ...volatileVariables,
      ...variables,
    ])
  }
  /// <summary>
  /// See documentation for <see cref="GetVolatileVariables"/> for more information.
  /// </summary>
  /// <param name="node">
  /// Node whose liftability will be altered by this invocation
  /// </param>
  /// <param name="value">
  /// The value that the node's liftability should assume by the invocation of this method
  /// </param>
  public setIsUnliftable(node: TexlNode, value: boolean) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isUnliftable.Length);

    this._isUnliftable.set(node.id, value)
  }

  private supportsServerDelegation(node: CallNode): boolean {
    // Contracts.AssertValue(node);

    // CallInfo info = GetInfo(node).VerifyValue();
    const info = this.getInfo(node)
    const fn = info.function
    if (fn == null) return false

    const isServerDelegatable = fn.isServerDelegatable(node, this)
    BinderUtils.LogTelemetryForFunction(fn, node, this, isServerDelegatable)
    return isServerDelegatable
  }

  private supportsPagingForFirstNameNode(node: FirstNameNode): boolean {
    // Contracts.AssertValue(node);
    const info = this.getInfo(node)
    let dataSourceInfo: IExternalDataSource
    if (
      info.kind == BindKind.Data &&
      (dataSourceInfo = info.data as IExternalDataSource) != null &&
      dataSourceInfo.isPageable
    ) {
      return true
    }

    // One To N Relationships are pagable using nextlinks
    if (
      info.kind == BindKind.DeprecatedImplicitThisItem &&
      (this.getType(node).expandInfo?.isTable ?? false)
    ) {
      return true
    }

    return false
  }

  private supportsPagingForDottedNameNode(node: DottedNameNode): boolean {
    // Contracts.AssertValue(node);

    if (this.hasExpandInfo(node) && this.supportsPaging(node.left)) {
      return true
    }

    const result = this.tryGetEntityInfo(node)
    result[0] && result[1].isTable
  }

  private supportsPagingForCallNode(node: CallNode): boolean {
    // Contracts.AssertValue(node);

    let info = this.getInfo(node)
    return info?.function?.supportsPaging(node, this) ?? false
  }

  private supportsPaging(
    node: TexlNode | CallNode | DottedNameNode | FirstNameNode
  ): boolean {
    // Contracts.AssertValue(node);

    switch (node.kind) {
      case NodeKind.FirstName:
        return this.supportsPagingForFirstNameNode(node.asFirstName())
      case NodeKind.DottedName:
        return this.supportsPagingForDottedNameNode(node.asDottedName())
      case NodeKind.Call:
        return this.supportsPagingForCallNode(node.asCall())
      default:
        // Contracts.Assert(false, "This should only be called for FirstNameNode, DottedNameNode and CallNode.");
        return false
    }
  }

  private tryGetEntityInfoForDottedName(
    node: DottedNameNode
  ): [boolean, IExpandInfo] {
    // Contracts.AssertValue(node);

    let info: IExpandInfo = undefined
    const dottedNameNode = node.asDottedName()
    if (dottedNameNode == null) return [false, info]

    info = this.getInfo(dottedNameNode)?.data as IExpandInfo
    return [info != null, info]
  }

  private tryGetEntityInfoForFirstName(
    node: FirstNameNode
  ): [boolean, IExpandInfo] {
    // Contracts.AssertValue(node);

    let info: IExpandInfo
    const firstNameNode = node.asFirstName()
    if (firstNameNode == null) return [false, info]

    info = this.getInfo(firstNameNode)?.data

    return [IsIExpandInfo(info), IsIExpandInfo(info) ? info : undefined]
  }

  private tryGetEntityInfoForCall(node: CallNode): [boolean, IExpandInfo] {
    // Contracts.AssertValue(node);

    let info = undefined
    const callNode = node.asCall()
    if (callNode == null) return [false, info]

    // It is possible for function to be null here if it referred to
    // a service function from a service we are in the process of
    // deregistering.
    const result = this.getInfo(callNode).function?.tryGetEntityInfo(node, this)
    return result[0] ? result : [false, info]
  }

  private tryGetFlowInfoForDottedName(
    node: DottedNameNode
  ): [boolean, IFlowInfo] {
    let info: IFlowInfo
    const firstNameNode = node.asDottedName()
    if (firstNameNode == null) return [false, info]

    info = this.getInfo(firstNameNode)?.data

    return [IsIFlowInfo(info), IsIFlowInfo(info) ? info : undefined]
  }

  private tryGetFlowInfoForFirstName(
    node: FirstNameNode
  ): [boolean, IFlowInfo] {
    let info: IFlowInfo
    const firstNameNode = node.asFirstName()
    if (firstNameNode == null) return [false, info]

    info = this.getInfo(firstNameNode)?.data

    return [IsIFlowInfo(info), IsIFlowInfo(info) ? info : undefined]
  }

  private tryGetFlowInfoForCall(node: CallNode): [boolean, IFlowInfo] {
    // Contracts.AssertValue(node);

    let info: IFlowInfo
    const callNode = node.asCall()
    if (callNode == null) return [false, info]

    // It is possible for function to be null here if it referred to
    // a service function from a service we are in the process of
    // deregistering.
    const result = this.getInfo(callNode).function?.tryGetFlowInfo(node, this)
    return [IsIFlowInfo(info), IsIFlowInfo(info) ? info : undefined]
  }

  // When getting projections from a chain rule, ensure that the projection belongs to the same DS as the one we're operating on (using match param)
  tryGetDataQueryOptions(
    node: TexlNode = this.top,
    forCodegen: boolean = false
  ): [boolean, DataSourceToQueryOptionsMap] {
    // Contracts.AssertValue(node);
    let tabularDataQueryOptionsMap: DataSourceToQueryOptionsMap
    if (node.kind == NodeKind.As) {
      node = node.asAsNode().left
    }

    if (node.kind == NodeKind.Call) {
      if (node.asCall().args.children.length == 0) {
        tabularDataQueryOptionsMap = null
        return [false, tabularDataQueryOptionsMap]
      }
      node = node.asCall().args.children[0]

      // Call nodes may have As nodes as the lhs, make sure query options are pulled from the lhs of the as node
      if (node.kind == NodeKind.As) {
        node = node.asAsNode().left
      }
    }

    if (!this.rule.texlNodeQueryOptions.has(node.id)) {
      tabularDataQueryOptionsMap = null
      return [false, tabularDataQueryOptionsMap]
    }

    let topNode: TexlNode = null
    for (const top of this.topChain) {
      if (!node.inTree(top)) continue

      topNode = top
      break
    }

    // Contracts.AssertValue(topNode);

    if (
      node.kind == NodeKind.FirstName &&
      this.rule.texlNodeQueryOptions.size > 1
    ) {
      const tabularDs = this.rule.document.globalScope.getTabularDataSource(
        node.asFirstName().ident.name.toString()
      )
      if (!IsIExternalTabularDataSource(tabularDs)) {
        tabularDataQueryOptionsMap = this.rule.texlNodeQueryOptions.get(node.id)
        return [true, tabularDataQueryOptionsMap]
      }

      tabularDataQueryOptionsMap = new DataSourceToQueryOptionsMap()
      tabularDataQueryOptionsMap.addDataSource(tabularDs)

      for (const x of this.rule.texlNodeQueryOptions) {
        if (topNode.MinChildID > x[0] || x[0] > topNode.id) continue

        let qo = x[1].getQueryOptions(tabularDs)

        if (qo == null) continue

        tabularDataQueryOptionsMap.getQueryOptions(tabularDs).merge(qo)
      }
      return [true, tabularDataQueryOptionsMap]
    } else {
      tabularDataQueryOptionsMap = this.rule.texlNodeQueryOptions.get(node.id)
      return [true, tabularDataQueryOptionsMap]
    }
  }

  private static GetParentControl(
    parent: ParentNode,
    nameResolver: INameResolver
  ): IExternalControl {
    // Contracts.AssertValue(parent);
    // Contracts.AssertValueOrNull(nameResolver);

    if (nameResolver == null || nameResolver.currentEntity == null) return null

    const result = nameResolver.lookupParent()
    if (!IsIExternalControl(nameResolver.currentEntity) || !result[0]) {
      return null
    }
    const lookupInfo = result[1]
    return lookupInfo.data as IExternalControl
  }

  private static GetSelfControl(
    self: SelfNode,
    nameResolver: INameResolver
  ): IExternalControl {
    // Contracts.AssertValue(self);
    // Contracts.AssertValueOrNull(nameResolver);

    if (nameResolver == null || nameResolver.currentEntity == null) return null

    let lookupInfo: NameLookupInfo
    const result = nameResolver.lookupSelf()
    lookupInfo = result[1]
    if (!result[0]) return null

    return lookupInfo.data as IExternalControl
  }

  private isDataComponentDataSource(lookupInfo: NameLookupInfo): boolean {
    return (
      lookupInfo.kind == BindKind.Data &&
      this._glue.isComponentDataSource(lookupInfo.data)
    )
  }

  private isDataComponentDefinition(lookupInfo: NameLookupInfo): boolean {
    return (
      lookupInfo.kind == BindKind.Control &&
      this._glue.isDataComponentDefinition(lookupInfo.data)
    )
  }

  private isDataComponentInstance(lookupInfo: NameLookupInfo): boolean {
    return (
      lookupInfo.kind == BindKind.Control &&
      this._glue.isDataComponentInstance(lookupInfo.data)
    )
  }

  private getDataComponentControl(
    dottedNameNode: DottedNameNode,
    nameResolver: INameResolver,
    visitor: TexlVisitor
  ): IExternalControl {
    // Contracts.AssertValue(dottedNameNode);
    // Contracts.AssertValueOrNull(nameResolver);
    // Contracts.AssertValueOrNull(visitor);
    if (nameResolver == null || !(dottedNameNode.left instanceof FirstNameNode))
      return null

    const lhsNode = dottedNameNode.left
    let lookupInfo: NameLookupInfo
    if (
      !nameResolver.lookupGlobalEntity(lhsNode.ident.name) ||
      (!this.isDataComponentDataSource(lookupInfo) &&
        !this.isDataComponentDefinition(lookupInfo) &&
        !this.isDataComponentInstance(lookupInfo))
    ) {
      return null
    }

    if (this.getInfo(lhsNode) == null) lhsNode.accept(visitor)

    const lhsInfo = this.getInfo(lhsNode)
    const dataCtrlInfo = lhsInfo?.data
    if (IsIExternalControlType(lhsInfo?.data)) return dataCtrlInfo

    const result = this._glue.tryGetCdsDataSourceByBind(lhsInfo.data)
    const info = result[1]
    if (lhsInfo?.kind == BindKind.Data && result[0]) {
      return info
    }
    return null
  }

  public getFunctionNamespace(node: CallNode, visitor: TexlVisitor): DPath {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(visitor);

    const leftNode = (node.headNode as DottedNameNode)?.left
    let ctrlInfo: IExternalControl
    if (leftNode instanceof ParentNode) {
      ctrlInfo = TexlBinding.GetParentControl(leftNode, this.nameResolver)
    } else if (leftNode instanceof SelfNode) {
      ctrlInfo = TexlBinding.GetSelfControl(leftNode, this.nameResolver)
    } else if (leftNode instanceof FirstNameInfo) {
      ctrlInfo = this.getDataComponentControl(
        leftNode,
        this.nameResolver,
        visitor
      )
    } else {
      ctrlInfo = undefined
    }

    return ctrlInfo != null
      ? DPath.Root.append(new DName(ctrlInfo.displayName))
      : node.head.namespace
    // const ctrlInfo = leftNode switch
    // {
    //     ParentNode parentNode => GetParentControl(parentNode, NameResolver),
    //     SelfNode selfNode => GetSelfControl(selfNode, NameResolver),
    //     FirstNameNode firstNameNode => GetDataComponentControl(node.HeadNode.AsDottedName(), NameResolver, visitor),
    //     _ => null,
    // };

    // return ctrlInfo != null
    //     ? DPath.Root.Append(new DName(ctrlInfo.DisplayName))
    //     : node.Head.Namespace;
  }

  //   tryGetDataQueryOptions(): [boolean, DataSourceToQueryOptionsMap] {
  //     return this.tryGetDataQueryOptions(this.top, false)
  //   }

  getDataQuerySelects(node: TexlNode) {
    if (!this.document.properties.enabledFeatures.isProjectionMappingEnabled)
      return []

    const result = this.tryGetDataQueryOptions(node, true)
    const tabularDataQueryOptionsMap = result[1]
    if (!result[0]) return []

    const currNodeQueryOptions =
      tabularDataQueryOptionsMap.getQueryOptionsArray()

    if (currNodeQueryOptions.length == 0) return []

    if (currNodeQueryOptions.length == 1) {
      const ds = currNodeQueryOptions[0].tabularDataSourceInfo

      if (!ds.isSelectable) return []

      const ruleQueryOptions =
        this.rule.binding.queryOptions.getQueryOptions(ds)
      if (ruleQueryOptions != null) {
        for (const nodeQO of this.rule.texlNodeQueryOptions) {
          const nodeQOSelects = nodeQO[1].getQueryOptions(ds)?.selects
          ruleQueryOptions.addSelectMultiple(nodeQOSelects)
        }
        ruleQueryOptions.addRelatedColumns()

        if (ruleQueryOptions.hasNonKeySelects) return ruleQueryOptions.selects
      } else {
        if (ds.queryOptions.hasNonKeySelects) {
          ds.queryOptions.addRelatedColumns()
          return ds.queryOptions.selects
        }
      }
    }

    return []
  }

  getExpandQuerySelects(
    node: TexlNode,
    expandEntityLogicalName: string
  ): Array<string> {
    if (this.document.properties.enabledFeatures.isProjectionMappingEnabled) {
      const result = this.tryGetDataQueryOptions(node, true)
      const tabularDataQueryOptionsMap = result[1]
      if (result[0]) {
        const currNodeQueryOptions =
          tabularDataQueryOptionsMap.getQueryOptionsArray()

        for (const qoItem of currNodeQueryOptions) {
          for (const expandQueryOptions of qoItem.expands) {
            if (
              expandQueryOptions[1].expandInfo.identity ==
              expandEntityLogicalName
            ) {
              if (
                !expandQueryOptions[1].selectsEqualKeyColumns() &&
                expandQueryOptions[1].selects.size <=
                  TexlBinding.MaxSelectsToInclude
              ) {
                const selects: string[] = []
                for (const select of expandQueryOptions[1].selects) {
                  selects.push(select)
                }
                return selects
              } else {
                return []
              }
            }
          }
        }
      }
    }

    return []
  }

  public tryGetEntityInfo(node: TexlNode): [boolean, IExpandInfo] {
    // Contracts.AssertValue(node);

    switch (node.kind) {
      case NodeKind.DottedName:
        return this.tryGetEntityInfoForDottedName(node.asDottedName())
      case NodeKind.FirstName:
        return this.tryGetEntityInfoForFirstName(node.asFirstName())
      case NodeKind.Call:
        return this.tryGetEntityInfoForCall(node.asCall())
      default:
        return [false, undefined]
    }
  }

  public tryGetFlowInfo(node: TexlNode): [boolean, IFlowInfo] {
    switch (node.kind) {
      case NodeKind.DottedName:
        return this.tryGetFlowInfoForDottedName(node.asDottedName())
      case NodeKind.FirstName:
        return this.tryGetFlowInfoForFirstName(node.asFirstName())
      case NodeKind.Call:
        return this.tryGetFlowInfoForCall(node.asCall())
      default:
        return [false, undefined]
    }
  }

  public hasExpandInfo(node: TexlNode): boolean {
    // Contracts.AssertValue(node);
    let data: any
    switch (node.kind) {
      case NodeKind.DottedName:
        data = this.getInfo(node.asDottedName())?.data
        break
      case NodeKind.FirstName:
        data = this.getInfo(node.asFirstName())?.data
        break
      default:
        data = null
        break
    }

    return data != null && IsIExpandInfo(data)
  }

  public tryGetDataSourceInfo(node: TexlNode): [boolean, IExternalDataSource] {
    // Contracts.AssertValue(node);

    const kind = node.kind

    let dataSourceInfo: IExternalDataSource
    switch (kind) {
      case NodeKind.Call:
        const callNode = node.asCall()
        const callFunction = this.getInfo(callNode)?.function
        if (callFunction != null)
          return callFunction.tryGetDataSource(callNode, this)
        break
      case NodeKind.FirstName:
        const firstNameNode = node.asFirstName()
        dataSourceInfo = this.getInfo(firstNameNode)
          ?.data as IExternalDataSource
        return [dataSourceInfo != null, dataSourceInfo]
      case NodeKind.DottedName:
        const result = this.tryGetEntityInfo(node.asDottedName())
        const info = result[1]
        if (result[0]) {
          dataSourceInfo = info.parentDataSource
          return [dataSourceInfo != null, dataSourceInfo]
        }
        break
      case NodeKind.As:
        return this.tryGetDataSourceInfo(node.asAsNode().left)
      default:
        break
    }

    dataSourceInfo = undefined
    return [false, dataSourceInfo]
  }

  public checkAndMarkAsDelegatable(node: CallNode | AsNode | DottedNameNode) {
    switch (node.kind) {
      case NodeKind.Call:
        this.checkAndMarkAsDelegatableForCall(node as CallNode)
        break
      case NodeKind.As:
        this.checkAndMarkAsDelegatableForAs(node as AsNode)
        break
      case NodeKind.DottedName:
        this.checkAndMarkAsDelegatableForDottedName(node as DottedNameNode)
        break
      default:
        break
    }
  }

  public checkAndMarkAsDelegatableForCall(node: CallNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this.supportsServerDelegation(node)) {
      this._isDelegatable.set(node.id, true)

      // Delegatable calls are async as well.
      this.flagPathAsAsync(node)
    }
  }

  public checkAndMarkAsDelegatableForAs(node: AsNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this._isDelegatable.get(node.left.id)) {
      this._isDelegatable.set(node.id, true)
      // Mark this as async, as this may result in async invocation.
      this.flagPathAsAsync(node)
    }
  }

  public checkAndMarkAsDelegatableForDottedName(node: DottedNameNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this.supportsPaging(node)) {
      this._isDelegatable.set(node.id, true)
      // Mark this as async, as this may result in async invocation.
      this.flagPathAsAsync(node)

      // Pageable nodes are also stateful as data is always pulled from outside.
      this.setStateful(node, true)
    }
  }

  public checkAndMarkAsPageable(
    node: CallNode | FirstNameNode | AsNode | DottedNameNode,
    func?: TexlFunction
  ) {
    switch (node.kind) {
      case NodeKind.Call:
        this.checkAndMarkAsPageableForCall(node as CallNode, func)
        break
      case NodeKind.FirstName:
        this.checkAndMarkAsPageableForFirstName(node as FirstNameNode)
        break
      case NodeKind.As:
        this.checkAndMarkAsPageableForAs(node as AsNode)
        break
      case NodeKind.DottedName:
        this.checkAndMarkAsDelegatableForDottedName(node as DottedNameNode)
        break
      default:
        break
    }
  }

  private checkAndMarkAsPageableForCall(node: CallNode, func: TexlFunction) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);
    // Contracts.AssertValue(func);

    // Server delegatable call always returns a pageable object.
    if (func.supportsPaging(node, this)) {
      this._isPageable.set(node.id, true)
    } else {
      // If we are transitioning from pageable call node to non-pageable node then it results in an
      // async call. So mark the path as async if current node is non-pageable with pageable child.
      // This also means that we will need an error context
      const args = node.args.children
      if (args.some((cnode) => this.isPageable(cnode))) {
        this.flagPathAsAsync(node)
        this.transitionsFromAsyncToSync = true
      }
    }
  }

  private checkAndMarkAsPageableForFirstName(node: FirstNameNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this.supportsPaging(node)) {
      this._isPageable.set(node.id, true)
      // Mark this as async, as this may result in async invocation.
      this.flagPathAsAsync(node)

      // Pageable nodes are also stateful as data is always pulled from outside.
      this.setStateful(node, true)
    }
  }

  private checkAndMarkAsPageableForAs(node: AsNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this._isPageable.get(node.left.id)) {
      this._isPageable.set(node.id, true)
      // Mark this as async, as this may result in async invocation.
      this.flagPathAsAsync(node)

      // Pageable nodes are also stateful as data is always pulled from outside.
      this.setStateful(node, true)
    }
  }

  private checkAndMarkAsPageableForDottedName(node: DottedNameNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _typeMap.Length);

    if (this.supportsPaging(node)) {
      this._isPageable.set(node.id, true)
      // Mark this as async, as this may result in async invocation.
      this.flagPathAsAsync(node)

      // Pageable nodes are also stateful as data is always pulled from outside.
      this.setStateful(node, true)
    }
  }

  public isDelegatable(node: TexlNode): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isDelegatable.Length);

    return this._isDelegatable.get(node.id)
  }

  public isPageable(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isPageable.Length);

    return this._isPageable.get(node.id)
  }

  public hasSideEffects(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _hasSideEffects.Length);

    return this._hasSideEffects.get(node.id)
  }

  public isContextual(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isContextual.Length);

    return this._isContextual.get(node.id)
  }

  public isConstant(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isConstant.Length);

    return this._isConstant.get(node.id)
  }

  public isSelfContainedConstant(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isSelfContainedConstant.Length);

    return this._isSelfContainedConstant.get(node.id)
  }

  public tryGetConstantValue(node: TexlNode): [boolean, string] {
    // Contracts.AssertValue(node);
    let nodeValue: string
    let left: string
    let right: string
    switch (node.kind) {
      case NodeKind.StrLit:
        nodeValue = node.asStrLit().value
      case NodeKind.BinaryOp:
        const binaryOpNode = node.asBinaryOp()
        if (binaryOpNode.op == BinaryOp.Concat) {
          const leftResult = this.tryGetConstantValue(binaryOpNode.left)
          left = leftResult[1]
          const rightResult = this.tryGetConstantValue(binaryOpNode.right)
          right = rightResult[1]
          if (leftResult[0] && rightResult[0]) {
            nodeValue = left + right
            return [true, nodeValue]
          }
        }

        break
      case NodeKind.Call:
        const callNode = node.asCall()
        if (callNode.head.name.value == BuiltinFunctionsCore.Concatenate.name) {
          const parameters: Array<string> = []
          for (const argNode of callNode.args.children) {
            let argValue: string
            const rst = this.tryGetConstantValue(argNode)
            argValue = rst[1]
            if (rst[0]) {
              parameters.push(argValue)
            } else {
              break
            }
          }

          if (parameters.length == callNode.args.count) {
            nodeValue = parameters.join('')
            return [true, nodeValue]
          }
        }

        break
      case NodeKind.FirstName:
        // Possibly a non-qualified enum value
        let firstNameNode = node.asFirstName()
        let firstNameInfo = this.getInfo(firstNameNode)
        if (firstNameInfo.kind == BindKind.Enum) {
          const enumValue = firstNameInfo.data as string
          if (enumValue != null) {
            nodeValue = enumValue
            return [true, nodeValue]
          }
        }

        break
      case NodeKind.DottedName:
        // Possibly an enumeration
        const dottedNameNode = node.asDottedName()
        if (dottedNameNode.left.kind == NodeKind.FirstName) {
          // let enumType: DType
          const namedEnumResult = this.document.globalScope.tryGetNamedEnum(
            dottedNameNode.left.asFirstName().ident.name
          )
          const enumType = namedEnumResult[1]
          if (namedEnumResult[0]) {
            // object enumValue;
            const enumValueResult = enumType.tryGetEnumValue(
              dottedNameNode.right.name
            )
            const enumValue = enumValueResult[1]
            if (enumValueResult[0]) {
              const strValue = enumValue as string
              if (strValue != null) {
                nodeValue = strValue
                return [true, nodeValue]
              }
            }
          }
        }

        break
    }

    return [false, nodeValue]
  }

  /// <summary>
  /// A node's "volatile variables" are the names whose values may at runtime have be modified at some
  /// point before the node to which these variables pertain is executed.
  ///
  /// e.g. <code>Set(w, 1); Set(x, w); Set(y, x); Set(z, y);</code>
  /// The call node Set(x, w); will have an entry in volatile variables containing just "w", Set(y, x); will
  /// have [w, x], and Set(z, y); will have [w, x, y].
  ///
  /// <see cref="TexlFunction.GetIdentifierOfModifiedValue"/> reports which variables may be
  /// changed by a call node, and they are recorded when the call node is analyzed and a reference to
  /// its TexlFunction is acquired. They are propagated to subsequent nodes in the variadic operator as
  /// the children of the variadic node are being accepted by the visitor.
  ///
  /// When the children of the variadic expression are visited, the volatile variables are transferred to the
  /// children's children, and so on and so forth, in a manner obeying that which is being commented.
  /// As the tree is descended, the visitor may encounter a first name node that will receive itself among
  /// the volatile variables of its parent. In such a case, neither this node nor any of its ancestors up to
  /// the root of the chained node may be lifted during code generation.
  ///
  /// The unliftability propagates back to the ancestors during the post visit traversal of the tree, and is
  /// ultimately read by the code generator when it visits these nodes and may attempt to lift their
  /// expressions.
  /// </summary>
  /// <param name="node">
  /// The node of which volatile variables are being requested
  /// </param>
  /// <returns>
  /// A list containing the volatile variables of <see cref="node"/>
  /// </returns>
  public getVolatileVariables(node: TexlNode) {
    // Contracts.AssertValue(node);

    return this._volatileVariables[node.id] ?? new Set()
  }

  public isFullRecordRowScopeAccess(node: TexlNode) {
    return this.tryGetFullRecordRowScopeAccessInfo(node)[0]
  }

  public tryGetFullRecordRowScopeAccessInfo(
    node: TexlNode
  ): [boolean, FirstNameInfo] {
    // Contracts.CheckValue(node, nameof(node));
    let firstNameInfo: FirstNameInfo

    if (!(node instanceof DottedNameNode)) return [false, firstNameInfo]

    if (!(node.left instanceof FirstNameNode)) return [false, firstNameInfo]

    const info = this.getInfo(node.left) as FirstNameInfo
    if (info?.kind != BindKind.LambdaFullRecord) return [false, firstNameInfo]

    firstNameInfo = info
    return [true, firstNameInfo]
  }

  /// <summary>
  /// Gets the renamed ident and returns true if the node is an AsNode
  /// Otherwise returns false and sets scopeIdent to the default
  /// </summary>
  /// <returns></returns>
  public getScopeIdent(node: TexlNode): [boolean, DName] {
    let scopeIdent = this.thisRecordDefaultName
    if (node instanceof AsNode) {
      scopeIdent = this.getInfo(node).asIdentifier
      return [true, scopeIdent]
    }
    return [false, scopeIdent]
  }

  public isRowScope(node: TexlNode): boolean {
    // Contracts.AssertValue(node);

    return this.getScopeUseSet(node).isLambdaScope
  }

  public setEcsExcemptLambdaNode(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isEcsExcemptLambda.Length);
    this._isEcsExcemptLambda.set(node.id, true)
  }

  // Some lambdas don't need to be propagated to ECS (for example when used as filter predicates within Filter or LookUp)
  public isInECSExcemptLambda(node: TexlNode) {
    // Contracts.AssertValue(node);

    if (node == null) return false

    // No need to go further if node is outside row scope.
    if (!this.isRowScope(node)) return false

    let parentNode = node
    while ((parentNode = parentNode.parent) != null) {
      if (this._isEcsExcemptLambda.get(parentNode.id)) return true
    }

    return false
  }

  public isStateful(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isStateful.Length);

    return this._isStateful.get(node.id)
  }

  public isPure(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isStateful.Length);
    // Contracts.AssertIndex(node.Id, _hasSideEffects.Length);

    return !this._isStateful.get(node.id) && !this._hasSideEffects.get(node.id)
  }

  public isGlobal(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _lambdaScopingMap.Length);

    return this._lambdaScopingMap[node.id].isGlobalOnlyScope
  }

  public isLambdaScoped(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _lambdaScopingMap.Length);

    return this._lambdaScopingMap[node.id].isLambdaScope
  }

  public getInnermostLambdaScopeLevel(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _lambdaScopingMap.Length);

    return this._lambdaScopingMap[node.id].getInnermost()
  }

  public setLambdaScopeLevel(node: TexlNode, upCount: number) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, IdLim);
    // Contracts.Assert(IsGlobal(node) || upCount >= 0);

    // Ensure we don't exceed the supported up-count limit.
    if (upCount > ScopeUseSet.MaxUpCount)
      this.errorContainer.error(node, TexlStrings.ErrTooManyUps)

    this.setScopeUseSet(node, new ScopeUseSet(upCount))
  }

  public getScopeUseSet(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, IdLim);

    return this._lambdaScopingMap[node.id]
  }

  public setScopeUseSet(node: TexlNode, set: ScopeUseSet) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, IdLim);
    // Contracts.Assert(IsGlobal(node) || set.IsLambdaScope);

    this._lambdaScopingMap[node.id] = set
  }

  public setSupportingRowScopedDelegationExemptionNode(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _supportsRowScopedParamDelegationExempted.Length);

    this._supportsRowScopedParamDelegationExempted.set(node.id, true)
  }

  isDelegationExempted(node: FirstNameNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _lambdaScopingMap.Length);

    if (node == null) return false

    // No need to go further if the lambda scope is global.
    if (!this.isLambdaScoped(node)) return false

    let info: FirstNameInfo
    const result = this.tryGetFirstNameInfo(node.id)
    info = result[1]
    let upCount = info.upCount
    let parentNode: TexlNode = node
    while ((parentNode = parentNode.parent) != null) {
      let callInfo: CallInfo
      const callResult = this.tryGetCall(parentNode.id)
      callInfo = callResult[1]
      if (
        callResult[0] &&
        callInfo.function != null &&
        callInfo.function.hasLambdas
      ) {
        upCount--
      }

      if (upCount < 0) return false

      if (
        this._supportsRowScopedParamDelegationExempted.get(parentNode.id) &&
        upCount == 0
      )
        return true
    }

    return false
  }

  setBlockScopedConstantNode(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, IdLim);

    this._isBlockScopedConstant.set(node.id, true)
  }

  public isBlockScopedConstant(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isBlockScopedConstant.Length);

    return this._isBlockScopedConstant.get(node.id)
  }

  public CanCoerce(node: TexlNode) {
    // Contracts.AssertValue(node);
    const result = this.tryGetCoercedType(node)
    const toType = result[1]
    if (!result[0]) {
      return false
    }

    const fromType = this.getType(node)
    // Contracts.Assert(fromType.IsValid);
    // Contracts.Assert(!toType.IsError);

    if (fromType.isUniversal) {
      return false
    }

    return true
  }

  public tryGetCoercedType(node: TexlNode): [boolean, DType] {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _coerceMap.Length);

    const coercedType = this._coerceMap[node.id]
    return [coercedType.isValid, coercedType]
  }

  public setCoercedType(node: TexlNode, type: DType) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertIndex(node.Id, _coerceMap.Length);
    // Contracts.Assert(!_coerceMap[node.Id].IsValid);

    this._coerceMap[node.id] = type
  }

  public setCoercedToplevelType(type: DType) {
    // Contracts.Assert(type.IsValid);
    // Contracts.Assert(!CoercedToplevelType.IsValid);

    this.coercedToplevelType = type
  }

  // public getInfo(node: FirstNameNode): FirstNameInfo
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is FirstNameInfo);

  //     return this._infoMap[node.id] as FirstNameInfo;
  // }

  private _lazyInitializedBinderNodesVisitor: BinderNodesVisitor = null
  private get _binderNodesVisitor(): BinderNodesVisitor {
    if (this._lazyInitializedBinderNodesVisitor == null) {
      this._lazyInitializedBinderNodesVisitor = BinderNodesVisitor.Run(this.top)
    }
    return this._lazyInitializedBinderNodesVisitor
  }

  public binderNodeMetadataArgTypeVisitor: BinderNodesMetadataArgTypeVisitor

  public getBinaryOperators() {
    return this._binderNodesVisitor.binaryOperators
  }
  public getVariadicOperators() {
    return this._binderNodesVisitor.variadicOperators
  }
  public getKeywords() {
    return this._binderNodesVisitor.keywords
  }
  public getBooleanLiterals() {
    return this._binderNodesVisitor.booleanLiterals
  }
  public getNumericLiterals() {
    return this._binderNodesVisitor.numericLiterals
  }
  public getStringLiterals() {
    return this._binderNodesVisitor.stringLiterals
  }
  public getStringInterpolations() {
    return this._binderNodesVisitor.stringInterpolations
  }
  public getUnaryOperators() {
    return this._binderNodesVisitor.unaryOperators
  }

  public get isEmpty() {
    return !this._infoMap.some((info) => info != null)
  }

  public get topChain(): TexlNode[] {
    if (this.isEmpty) {
      return []
    }
    if (this.top instanceof VariadicBase) {
      return this.top.children
    }
    return [this.top]
  }

  public getFirstNamesInTree(node: TexlNode) {
    const firstNames: FirstNameInfo[] = []
    for (let id = 0; id < this.idLim; id++) {
      let info: FirstNameInfo
      if (
        (info = this._infoMap[id] as FirstNameInfo) != null &&
        info.node.inTree(node)
      )
        firstNames.push(info)
    }
    return firstNames
  }

  public getFirstNames(): FirstNameInfo[] {
    return this._infoMap.filter((info) => info instanceof FirstNameInfo)
  }

  public getGlobalNames() {
    if (!this.usesGlobals && !this.usesResources) return [] as FirstNameInfo[]

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter(
        (info) =>
          info.Kind == BindKind.Control ||
          info.Kind == BindKind.Data ||
          info.Kind == BindKind.Resource ||
          info.Kind == BindKind.NamedValue ||
          info.Kind == BindKind.ComponentNameSpace ||
          info.Kind == BindKind.WebResource ||
          info.Kind == BindKind.QualifiedValue
      )
  }

  public getGlobalControlNames() {
    if (!this.usesGlobals) return []

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter((info) => (info as FirstNameInfo).kind === BindKind.Control)
  }

  public getControlKeywordInfos() {
    if (!this.usesGlobals) return []

    return this._infoMap.filter((info) => info instanceof ControlKeywordInfo)
  }

  public tryGetGlobalNameNode(globalName: string): [boolean, TexlNode] {
    // Contracts.AssertNonEmpty(globalName);

    let firstName: TexlNode = null
    if (!this.usesGlobals && !this.usesResources) return [false, firstName]

    for (const info of this._infoMap.filter(
      (info) => info instanceof FirstNameInfo
    ) as FirstNameInfo[]) {
      const kind = info.kind
      if (
        info.name.value === globalName &&
        (kind == BindKind.Control ||
          kind == BindKind.Data ||
          kind == BindKind.Resource ||
          kind == BindKind.QualifiedValue ||
          kind == BindKind.WebResource)
      ) {
        firstName = info.node
        return [true, firstName]
      }
    }
    return [false, firstName]
  }

  public getAliasNames() {
    if (!this.usesAliases) return [] as FirstNameInfo[]

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter((info) => (info as FirstNameInfo).kind == BindKind.Alias)
  }

  public getScopeVariableNames() {
    if (!this.usesScopeVariables) return []

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter((info) => (info as FirstNameInfo).kind == BindKind.ScopeVariable)
  }

  public getScopeCollectionNames() {
    if (!this.usesScopeCollections) return []

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter(
        (info) => (info as FirstNameInfo).kind == BindKind.ScopeCollection
      )
  }

  public getThisItemFirstNames() {
    if (!this.hasThisItemReference) return []
    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter((info) => (info as FirstNameInfo).kind == BindKind.ThisItem)
  }

  public getImplicitThisItemFirstNames() {
    if (!this.hasThisItemReference) return []

    return this._infoMap
      .filter((info) => info instanceof FirstNameInfo)
      .filter(
        (info) =>
          (info as FirstNameInfo).kind == BindKind.DeprecatedImplicitThisItem
      )

    // return _infoMap.OfType<FirstNameInfo>().Where((info) => info.Kind == BindKind.DeprecatedImplicitThisItem)
  }

  public getLambdaParamNames(nest: number) {
    // Contracts.Assert(nest >= 0);
    let infos: Array<FirstNameInfo>
    const result = this._lambdaParams.tryGetValue(nest)
    infos = result[1]
    if (result[0]) return infos

    return []
  }

  getDottedNamesInTree(node: TexlNode): DottedNameInfo[] {
    const dottedNames: DottedNameInfo[] = []
    for (let id = 0; id < this.idLim; id++) {
      let info: DottedNameInfo
      if (
        (info = this._infoMap[id] as DottedNameInfo) != null &&
        info.node.inTree(node)
      ) {
        dottedNames.push(info)
      }
    }
    return dottedNames
  }

  public getDottedNames() {
    const dottedNames: DottedNameInfo[] = []
    for (let id = 0; id < this.idLim; id++) {
      let info: DottedNameInfo
      if ((info = this._infoMap[id] as DottedNameInfo) != null) {
        dottedNames.push(info)
      }
    }
    return dottedNames
  }

  getCallsInTree(node: TexlNode) {
    const calls: CallInfo[] = []
    for (let id = 0; id < this.idLim; id++) {
      let info: CallInfo
      if (
        (info = this._infoMap[id] as CallInfo) != null &&
        info.node.inTree(node)
      ) {
        calls.push(info)
      }
    }
    return calls
  }

  public getCalls(fn?: TexlFunction) {
    const calls: CallInfo[] = []
    for (let id = 0; id < this.idLim; id++) {
      let info: CallInfo
      if ((info = this._infoMap[id] as CallInfo) != null) {
        if (fn == null) {
          calls.push(info)
        } else if (fn && fn === info.function) {
          calls.push(info)
        }
      }
    }
    return calls
  }

  public tryGetCall(nodeId: number): [boolean, CallInfo] {
    // Contracts.AssertIndex(nodeId, IdLim);

    const callInfo = this._infoMap[nodeId] as CallInfo
    return [callInfo != null, callInfo]
  }

  // Try to get the text span from a give nodeId
  // The node could be CallInfo, FirstNameInfo or DottedNameInfo
  public tryGetTextSpan(nodeId: number): [boolean, Span] {
    // Contracts.AssertIndex(nodeId, IdLim);

    let span: Span
    const node = this._infoMap[nodeId]
    let callInfo = node as CallInfo
    if (callInfo != null) {
      span = callInfo.node.getTextSpan()
      return [true, span]
    }

    const firstNameInfo = node as FirstNameInfo
    if (firstNameInfo != null) {
      span = firstNameInfo.node.getTextSpan()
      return [true, span]
    }

    const dottedNameInfo = node as DottedNameInfo
    if (dottedNameInfo != null) {
      span = dottedNameInfo.node.getTextSpan()
      return [true, span]
    }

    span = null
    return [false, span]
  }

  public tryGetFirstNameInfo(nodeId: number): [boolean, FirstNameInfo] {
    let info: FirstNameInfo
    if (nodeId < 0) {
      info = null
      return [false, info]
    }

    // Contracts.AssertIndex(nodeId, IdLim);

    info = this._infoMap[nodeId] as FirstNameInfo
    return [info != null, info]
  }

  public tryGetInfo<T>(nodeId: number): [boolean, T] {
    let info: T
    if (nodeId < 0 || nodeId > this.idLim) {
      info = null
      return [false, info]
    }

    info = this._infoMap[nodeId] as T
    return [info != null, info]
  }

  // Returns all scope fields consumed by this rule that match the given scope type.
  // This is always a subset of the scope type.
  // Returns DType.EmptyRecord if no scope fields are consumed by the rule.
  public getTopUsedScopeFields(
    sourceControlName: DName,
    outputTablePropertyName: DName
  ): DType {
    // Contracts.AssertValid(sourceControlName);
    // Contracts.AssertValid(outputTablePropertyName);

    // Begin with an empty record until we find an access to the specified output table.
    let accumulatedType = DType.EmptyRecord

    // Identify all accesses to the specified output table in this rule.
    const sourceTableAccesses = this.getDottedNames().filter((d) =>
      d.node.matches(sourceControlName, outputTablePropertyName)
    )

    for (const sourceTableAccess of sourceTableAccesses) {
      // Start with the type of the table access.
      let currentRecordType = this.getType(sourceTableAccess.node).toRecord()

      let node: TexlNode = sourceTableAccess.node

      // Reduce the type if the table is being sliced.
      if (node.parent != null && node.parent.kind == NodeKind.DottedName)
        currentRecordType = this.getType(node.parent).toRecord()

      // Walk up the parse tree to find the first CallNode, then determine if the
      // required type can be reduced to scope fields.
      for (
        ;
        node.parent != null && node.parent.parent != null;
        node = node.parent
      ) {
        if (node.parent.parent.kind == NodeKind.Call) {
          const callInfo = this.getInfo(
            node.parent.parent as CallNode
          ) as CallInfo

          if (callInfo.function.scopeInfo != null) {
            let scopeFunction = callInfo.function

            // Contracts.Assert(callInfo.Node.Args.Children.Length > 0);
            const firstArg = callInfo.node.args.children[0]

            // Determine if we arrived as the first (scope) argument of the function call
            // and whether we can reduce the type to contain only the used scope fields
            // for the call.
            if (
              firstArg == node &&
              !scopeFunction.scopeInfo.usesAllFieldsInScope
            ) {
              // The cursor type must be the same as the current type.
              //   Contracts.Assert(currentRecordType.Accepts(callInfo.CursorType))
              currentRecordType = this.getUsedScopeFields(callInfo)
            }
          }

          // Always break if we have reached a CallNode.
          break
        }
      }

      // Accumulate the current type.
      accumulatedType = DType.Union(accumulatedType, currentRecordType)
    }

    return accumulatedType
  }

  // Returns the scope fields used by the lambda parameters in the given invocation.
  // This is always a subset of the scope type (call.CursorType).
  // Returns DType.Error for anything other than invocations of functions with scope.
  public getUsedScopeFields(call: CallInfo): DType {
    // Contracts.AssertValue(call);

    if (
      this.errorContainer.hasErrors() ||
      call.function == null ||
      call.function.scopeInfo == null ||
      !call.cursorType.isAggregate ||
      call.node.args.count < 1
    ) {
      return DType.Error
    }

    let fields: DType = DType.EmptyRecord
    let arg0: TexlNode = call.node.args.children[0]

    for (const name of this.getLambdaParamNames(call.scopeNest + 1)) {
      let lambdaParamType: DType
      let fError = false
      if (!name.node.inTree(arg0) && name.node.inTree(call.node)) {
        const rst = call.cursorType.tryGetType(name.name)
        lambdaParamType = rst[1]
        if (rst[0]) {
          const dotted = name.node.parent
          if (dotted instanceof DottedNameNode) {
            let accParamType: DType
            let propertyType: DType

            // DType accParamType, propertyType;
            // Get the param type accumulated so far
            const typeResult1 = fields.tryGetType(name.name)
            accParamType = typeResult1[1]
            if (!typeResult1[0]) accParamType = DType.EmptyRecord
            // Get the RHS property type reported by the scope
            let tempRhsType: DType = lambdaParamType.isControl
              ? lambdaParamType.toRecord()
              : lambdaParamType

            const typeResult2 = tempRhsType.tryGetType(dotted.right.name)
            if (!typeResult2[0]) {
              propertyType = DType.Unknown
            }

            // Accumulate into the param type
            const addResult = accParamType.tryAdd(
              fError,
              DPath.Root,
              dotted.right.name,
              propertyType
            )
            accParamType = addResult[0]
            fError = addResult[1]
            lambdaParamType = accParamType
          }
          const recordAddResult = DType.EmptyRecord.tryAdd(
            fError,
            DPath.Root,
            name.name,
            lambdaParamType
          )
          fError = recordAddResult[1]
          fields = DType.Union(fields, recordAddResult[0])
        }
      }
    }

    // Contracts.Assert(fields.IsRecord);
    return fields
  }

  public getInfo(node: FirstNameNode): FirstNameInfo
  public getInfo(node: DottedNameNode): DottedNameInfo
  public getInfo(node: AsNode): AsInfo
  public getInfo(node: CallNode): CallInfo
  public getInfo(node: ParentNode): ParentInfo
  public getInfo(node: SelfNode): SelfInfo
  public getInfo(node: SelfNode): SelfInfo
  public getInfo(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _infoMap.Length);
    // Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is DottedNameInfo);
    // const nodeInfo = this._infoMap[node.id]
    // if (node.kind === nodeInfo?.kind) {
    //   return nodeInfo
    // }
    // return undefined
    return this._infoMap[node.id]
  }

  public setInfoFirstName(node: FirstNameNode, info: FirstNameInfo) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(info);
    // Contracts.AssertIndex(node.Id, _infoMap.Length);
    // Contracts.Assert(_infoMap[node.Id] == null);
    if (
      info.kind == BindKind.LambdaField ||
      info.kind == BindKind.LambdaFullRecord
    ) {
      if (!this._lambdaParams.has(info.nestDst)) {
        this._lambdaParams.set(info.nestDst, [])
      }
      this._lambdaParams.get(info.nestDst).push(info)
    }
    this._infoMap[node.id] = info
  }

  // public DottedNameInfo GetInfo(DottedNameNode node)
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is DottedNameInfo);

  //     return _infoMap[node.Id] as DottedNameInfo;
  // }

  public setInfoDottedName(node: DottedNameNode, info: DottedNameInfo) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(info);
    // Contracts.AssertIndex(node.Id, _infoMap.Length);
    // Contracts.Assert(_infoMap[node.Id] == null);

    this._infoMap[node.id] = info
  }

  // public AsInfo GetInfo(AsNode node)
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is AsInfo);

  //     return _infoMap[node.Id] as AsInfo;
  // }

  public setInfoForAs(node: AsNode, info: AsInfo) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(info);
    // Contracts.AssertIndex(node.Id, _infoMap.Length);
    // Contracts.Assert(_infoMap[node.Id] == null);

    this._infoMap[node.id] = info
  }

  // public CallInfo GetInfo(CallNode node)
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is CallInfo);

  //     return _infoMap[node.Id] as CallInfo;
  // }

  public setInfoForCall(node: CallNode, info: CallInfo, markIfAsync = true) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(info);
    // Contracts.AssertIndex(node.Id, _infoMap.Length);
    // Contracts.Assert(_infoMap[node.Id] == null);

    this._infoMap[node.id] = info

    const fn = info.function
    if (fn != null) {
      // If the invocation is async then the whole call path is async.
      if (markIfAsync && fn.isAsyncInvocation(node, this)) {
        this.flagPathAsAsync(node)
      }

      // If the invocation affects aliases, cache that info.
      if (fn.affectsAliases) this.affectsAliases = true

      // If the invocation affects scope varialbe, cache that info.
      if (fn.affectsScopeVariable) this.affectsScopeVariable = true

      if (fn.affectsDataSourceQueryOptions)
        this.affectsTabularDataSources = true
    }
  }

  addFieldToQuerySelects(type: DType, fieldName: string): boolean {
    // Contracts.AssertValid(type);
    // Contracts.AssertNonEmpty(fieldName);
    // Contracts.AssertValue(QueryOptions);

    let retVal = false

    if (type.associatedDataSources == null) return retVal

    for (const associatedDataSource of type.associatedDataSources) {
      if (!associatedDataSource.isSelectable) continue

      // If this is accessing datasource itself then we don't need to capture this.
      if (associatedDataSource.name == fieldName) continue

      retVal ||= this.queryOptions.addSelect(
        associatedDataSource,
        new DName(fieldName)
      )

      this.affectsTabularDataSources = true
    }

    return retVal
  }

  getFieldLogicalName(ident: Identifier): DName {
    let rhsName: DName = ident.name
    if (!this.updateDisplayNames) {
      const rst = this.tryGetReplacedIdentName(ident)
      const rhsLogicalName = rst[1]
      if (rst[0]) {
        rhsName = new DName(rhsLogicalName)
      }
    }
    return rhsName
  }

  tryGetReplacedIdentName(ident: Identifier): [boolean, string] {
    let replacedIdent = ''
    // Check if the access was renamed:
    if (this.nodesToReplace != null) {
      // Token equality doesn't work here, compare the spans to be certain
      const newName =
        this.nodesToReplace.find(
          (kvp) =>
            kvp.key.span.min == ident.token.span.min &&
            kvp.key.span.lim == ident.token.span.lim
        ) || ({ key: undefined, value: null } as KeyValuePair<Token, string>)
      if (newName.value != null && newName.key != null) {
        replacedIdent = newName.value
        return [true, replacedIdent]
      }
    }

    return [false, replacedIdent]
  }

  // public ParentInfo GetInfo(ParentNode node)
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is ParentInfo);

  //     return _infoMap[node.Id] as ParentInfo;
  // }

  // public SelfInfo GetInfo(SelfNode node)
  // {
  //     Contracts.AssertValue(node);
  //     Contracts.AssertIndex(node.Id, _infoMap.Length);
  //     Contracts.Assert(_infoMap[node.Id] == null || _infoMap[node.Id] is SelfInfo);

  //     return _infoMap[node.Id] as SelfInfo;
  // }

  public setInfoParentNode(node: ParentNode, info: ParentInfo) {
    //   Contracts.AssertValue(node);
    //   Contracts.AssertValue(info);
    //   Contracts.AssertIndex(node.Id, _infoMap.Length);
    //   Contracts.Assert(_infoMap[node.Id] == null);

    this._infoMap[node.id] = info
  }

  public setInfoSelfNode(node: SelfNode, info: SelfInfo) {
    //   Contracts.AssertValue(node);
    //   Contracts.AssertValue(info);
    //   Contracts.AssertIndex(node.Id, _infoMap.Length);
    //   Contracts.Assert(_infoMap[node.Id] == null);

    this._infoMap[node.id] = info
  }

  public flagPathAsAsync(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _asyncMap.Length);

    while (node != null && !this._asyncMap[node.id]) {
      this._asyncMap[node.id] = true
      node = node.parent
    }
  }

  public isAsync(node: TexlNode): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _asyncMap.Length);

    return this._asyncMap[node.id]
  }

  /// <summary>
  /// See documentation for <see cref="GetVolatileVariables"/> for more information.
  /// </summary>
  /// <param name="node">
  /// Node whose liftability is questioned.
  /// </param>
  /// <returns>
  /// Whether the current node is liftable.
  /// </returns>
  public isUnliftable(node: TexlNode) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _isUnliftable.Length);

    return this._isUnliftable.get(node.id)
  }

  public isInfoKindDataSource(info: NameInfo): boolean {
    return info.kind == BindKind.Data || info.kind == BindKind.ScopeCollection
  }

  public tryCastToFirstName(node: TexlNode): [boolean, FirstNameInfo] {
    // Contracts.AssertValue(node);

    let firstNameInfo: FirstNameInfo
    if (node instanceof FirstNameInfo) {
      firstNameInfo = this.getInfo(node)
      if (firstNameInfo != null) {
        return [true, firstNameInfo]
      }
    }
    return [false, firstNameInfo]
  }

  declareMetadataNeeded(type: DType) {
    // Contracts.AssertValid(type);

    if (this._typesNeedingMetadata == null) {
      this._typesNeedingMetadata = []
    }

    if (!this._typesNeedingMetadata.includes(type))
      this._typesNeedingMetadata.push(type)
  }

  getExpandEntitiesMissingMetadata(): Array<DType> {
    return this._typesNeedingMetadata
  }

  tryGetRenamedOutput(outputName: DName): [boolean, DName] {
    outputName = this._renamedOutputAccessor
    return [!outputName.equals(DName.Default()), outputName]
  }

  public isAsyncWithNoSideEffects(node: TexlNode) {
    return this.isAsync(node) && !this.hasSideEffects(node)
  }
}

export class Visitor implements TexlVisitor {
  private readonly _nameResolver: INameResolver
  private readonly _topScope: Scope
  protected _txb: TexlBinding
  private _currentScope: Scope
  private _currentScopeDsNodeId: number

  constructor(
    txb: TexlBinding,
    resolver: INameResolver,
    topScope: DType,
    useThisRecordForRuleScope: boolean
  ) {
    // Contracts.AssertValue(txb);
    // Contracts.AssertValueOrNull(resolver);
    this._txb = txb
    this._nameResolver = resolver

    this._topScope = new Scope(
      undefined,
      undefined,
      topScope ?? DType.Error,
      useThisRecordForRuleScope ? txb.thisRecordDefaultName : DName.Default()
    )
    this._currentScope = this._topScope
    this._currentScopeDsNodeId = -1
  }

  // [Conditional("DEBUG")]
  private assertValid() {
    // #if DEBUG
    //         Contracts.AssertValueOrNull(_nameResolver);
    //         Contracts.AssertValue(_topScope);
    //         Contracts.AssertValue(_currentScope);
    //         Scope scope = _currentScope;
    //         while (scope != null && scope != _topScope)
    //             scope = scope.Parent;
    //         Contracts.Assert(scope == _topScope, "_topScope should be in the parent chain of _currentScope.");
    // #endif
  }

  public run() {
    this._txb.top.accept(this)
    // Contracts.Assert(_currentScope == _topScope);
  }

  /// <summary>
  /// Helper for Lt/leq/geq/gt type checking. Restricts type to be one of the provided set, without coercion (except for primary output props).
  /// </summary>
  /// <param name="node">Node for which we are checking the type</param>
  /// <param name="alternateTypes">List of acceptable types for this operation, in order of suitability</param>
  /// <returns></returns>
  private checkComparisonTypeOneOf(
    node: TexlNode,
    ...alternateTypes: DType[]
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(alternateTypes);
    // Contracts.Assert(alternateTypes.Any());

    let type: DType = this._txb.getType(node)
    for (const altType of alternateTypes) {
      if (!altType.accepts(type)) continue
      return true
    }

    // If the node is a control, we may be able to coerce its primary output property
    // to the desired type, and in the process support simplified syntax such as: slider2 <= slider4
    let primaryOutProp: IExternalControlProperty
    const controlType = type
    if (
      IsIExternalControlType(controlType) &&
      node.asFirstName() != null &&
      (primaryOutProp = controlType.controlTemplate.primaryOutputProperty) !=
        null
    ) {
      let outType: DType = primaryOutProp.getOpaqueType()
      // let acceptedType =  (alternateTypes[0] || DType.Default()).accepts(outType)
      let acceptedType =
        alternateTypes.find((alt) => alt.accepts(outType)) || null
      if (acceptedType != null) {
        // We'll coerce the control to the desired type, by pulling from the control's
        // primary output property. See codegen for details.
        this._txb.setCoercedType(node, acceptedType)
        return true
      }
    }

    this._txb.errorContainer.ensureErrorWithSeverity(
      DocumentErrorSeverity.Severe,
      node,
      TexlStrings.ErrBadType_ExpectedTypesCSV,
      alternateTypes.map((t) => t.getKindString()).join(', ')
    )
    return false
  }

  // Returns whether the node was of the type wanted, and reports appropriate errors.
  // A list of allowed alternate types specifies what other types of values can be coerced to the wanted type.
  private checkType(
    node: TexlNode,
    typeWant: DType,
    ...alternateTypes: DType[]
  ) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(typeWant.IsValid);
    // Contracts.Assert(!typeWant.IsError);
    // Contracts.AssertValue(alternateTypes);

    let type: DType = this._txb.getType(node)
    if (typeWant.accepts(type)) {
      if (type.requiresExplicitCast(typeWant))
        this._txb.setCoercedType(node, typeWant)
      return true
    }

    // Normal (non-control) coercion
    for (const altType of alternateTypes) {
      if (!altType.accepts(type)) continue

      // Ensure that booleans only match bool valued option sets
      if (
        typeWant.kind == DKind.Boolean &&
        altType.kind == DKind.OptionSetValue &&
        !(type.optionSetInfo?.isBooleanValued ?? false)
      )
        continue

      // We found an alternate type that is accepted and will be coerced.
      this._txb.setCoercedType(node, typeWant)
      return true
    }

    // If the node is a control, we may be able to coerce its primary output property
    // to the desired type, and in the process support simplified syntax such as: label1 + slider4
    let primaryOutProp: IExternalControlProperty
    const controlType = type
    if (
      IsIExternalControlType(controlType) &&
      node.asFirstName() != null &&
      (primaryOutProp = controlType.controlTemplate.primaryOutputProperty) !=
        null
    ) {
      const outType = primaryOutProp.getOpaqueType()
      if (
        typeWant.accepts(outType) ||
        alternateTypes.some((alt) => alt.accepts(outType))
      ) {
        // We'll "coerce" the control to the desired type, by pulling from the control's
        // primary output property. See codegen for details.
        this._txb.setCoercedType(node, typeWant)
        return true
      }
    }

    const messageKey =
      alternateTypes.length == 0
        ? TexlStrings.ErrBadType_ExpectedType
        : TexlStrings.ErrBadType_ExpectedTypesCSV
    const messageArg =
      alternateTypes.length == 0
        ? typeWant.getKindString()
        : [typeWant, ...alternateTypes].map((t) => t.getKindString()).join(', ')

    this._txb.errorContainer.ensureErrorWithSeverity(
      DocumentErrorSeverity.Severe,
      node,
      messageKey,
      messageArg
    )
    return false
  }

  // Performs type checking for the arguments passed to the membership "in"/"exactin" operators.
  private checkInArgTypes(left: TexlNode, right: TexlNode): boolean {
    // Contracts.AssertValue(left);
    // Contracts.AssertValue(right);

    const typeLeft = this._txb.getType(left)
    if (!typeLeft.isValid || typeLeft.isUnknown || typeLeft.isError) {
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        left,
        TexlStrings.ErrTypeError
      )
      return false
    }

    const typeRight = this._txb.getType(right)
    if (!typeRight.isValid || typeRight.isUnknown || typeRight.isError) {
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        right,
        TexlStrings.ErrTypeError
      )
      return false
    }

    // Contracts.Assert(!typeLeft.IsAggregate || typeLeft.IsTable || typeLeft.IsRecord);
    // Contracts.Assert(!typeRight.IsAggregate || typeRight.IsTable || typeRight.IsRecord);

    if (!typeLeft.isAggregate) {
      // scalar in scalar: RHS must be a string (or coercible to string when LHS type is string). We'll allow coercion of LHS.
      // This case deals with substring matches, e.g. 'FirstName in "Aldous Huxley"' or "123" in 123.
      if (!typeRight.isAggregate) {
        if (!DType.String.accepts(typeRight)) {
          if (
            typeRight.coercesTo(DType.String) &&
            DType.String.accepts(typeLeft)
          ) {
            // Coerce RHS to a string type.
            this._txb.setCoercedType(right, DType.String)
          } else {
            this._txb.errorContainer.ensureErrorWithSeverity(
              DocumentErrorSeverity.Severe,
              right,
              TexlStrings.ErrStringExpected
            )
            return false
          }
        }
        if (DType.String.accepts(typeLeft)) return true
        if (!typeLeft.coercesTo(DType.String)) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            left,
            TexlStrings.ErrCannotCoerce_SourceType_TargetType,
            typeLeft.getKindString(),
            DType.String.getKindString()
          )
          return false
        }
        // Coerce LHS to a string type, to facilitate subsequent substring checks.
        this._txb.setCoercedType(left, DType.String)
        return true
      }

      // scalar in table: RHS must be a one column table. We'll allow coercion.
      if (typeRight.isTable) {
        const names = typeRight.getNames(DPath.Root)
        if (names.length != 1) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            right,
            TexlStrings.ErrInvalidSchemaNeedCol
          )
          return false
        }

        const typedName = names.length === 1 ? names[0] : undefined
        if (
          typedName.type.accepts(typeLeft) ||
          typeLeft.accepts(typedName.type)
        ) {
          return true
        }
        if (!typeLeft.coercesTo(typedName.type)) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            left,
            TexlStrings.ErrCannotCoerce_SourceType_TargetType,
            typeLeft.getKindString(),
            typedName.type.getKindString()
          )
          return false
        }
        // Coerce LHS to the table column type, to facilitate subsequent comparison.
        this._txb.setCoercedType(left, typedName.type)
        return true
      }

      // scalar in record: not supported. Flag an error on the RHS.
      // Contracts.Assert(typeRight.IsRecord);
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        right,
        TexlStrings.ErrBadType_Type,
        typeRight.getKindString()
      )
      return false
    }

    if (typeLeft.isRecord) {
      // record in scalar: not supported
      if (!typeRight.isAggregate) {
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          right,
          TexlStrings.ErrBadType_Type,
          typeRight.getKindString()
        )
        return false
      }

      // record in table: RHS must be a table with a compatible schema. No coercion is allowed.
      if (typeRight.isTable) {
        const typeLeftAsTable: DType = typeLeft.toTable()

        let typeRightDifferingSchema
        let typeRightDifferingSchemaType
        let typeLeftDifferingSchema
        let typeLeftDifferingSchemaType
        const acc1 = typeLeftAsTable.acceptsOut(typeRight)
        typeRightDifferingSchema = acc1[1].schemaDifference
        typeRightDifferingSchemaType = acc1[1].schemaDifferenceType
        if (acc1[0]) {
          return true
        } else {
          const acc2 = typeRight.acceptsOut(typeLeftAsTable)
          typeLeftDifferingSchema = acc1[1].schemaDifference
          typeLeftDifferingSchemaType = acc1[1].schemaDifferenceType
          if (acc2[0]) {
            return true
          }
        }

        // if (typeLeftAsTable.Accepts(typeRight, out let typeRightDifferingSchema, out let typeRightDifferingSchemaType) ||
        //     typeRight.Accepts(typeLeftAsTable, out let typeLeftDifferingSchema, out let typeLeftDifferingSchemaType))
        //     return true;

        this._txb.errorContainer.errors(
          left,
          typeLeft,
          typeLeftDifferingSchema,
          typeLeftDifferingSchemaType
        )
        this._txb.errorContainer.errors(
          right,
          typeRight,
          typeRightDifferingSchema,
          typeRightDifferingSchemaType
        )

        return false
      }

      // record in record: not supported. Flag an error on the RHS.
      // Contracts.Assert(typeRight.IsRecord);
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        right,
        TexlStrings.ErrBadType_Type,
        typeRight.getKindString()
      )
      return false
    }

    // table in anything: not supported
    this._txb.errorContainer.ensureErrorWithSeverity(
      DocumentErrorSeverity.Severe,
      left,
      TexlStrings.ErrBadType_Type,
      typeLeft.getKindString()
    )
    return false
  }

  private joinScopeUseSets(...nodes: TexlNode[]): ScopeUseSet {
    // Contracts.AssertValue(nodes);
    // Contracts.AssertAllValues(nodes);

    let set = ScopeUseSet.GlobalsOnly
    for (const node of nodes) set = set.union(this._txb.getScopeUseSet(node))

    return set
  }

  public visit(node: LeafNodeType) {
    // console.log('visit', NodeKind[node.kind], node.toString())
    switch (node.kind) {
      case NodeKind.Replaceable:
        this.visitReplaceableNode(node as ReplaceableNode)
        break
      case NodeKind.Error:
        this.visitErrorNode(node as ErrorNode)
        break
      case NodeKind.Blank:
        this.visitBlankNode(node as BlankNode)
        break
      case NodeKind.BoolLit:
        this.visitBoolLitNode(node as BoolLitNode)
        break
      case NodeKind.StrLit:
        this.visitStrLitNode(node as StrLitNode)
        break
      case NodeKind.NumLit:
        this.visitNumLitNode(node as NumLitNode)
        break
      case NodeKind.FirstName:
        this.visitFirstNameNode(node as FirstNameNode)
        break
      case NodeKind.Parent:
        this.visitParentNode(node as ParentNode)
        break
      case NodeKind.Self:
        this.visitSelfNode(node as SelfNode)
        break
      default:
        break
    }
  }

  private visitReplaceableNode(node: ReplaceableNode) {
    throw new Error('replaceable nodes are not supported')
    // throw new NotSupportedException("Replaceable nodes are not supported");
  }

  private visitErrorNode(node: ErrorNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    this._txb.setType(node, DType.Error)

    // Note that there is no need to log a binding error for this node. The fact that
    // an ErrorNode exists in the parse tree ensures that a parse/syntax error was
    // logged for it, and there is no need to duplicate it.
  }

  private visitBlankNode(node: BlankNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    this._txb.setConstant(node, true)
    this._txb.setSelfContainedConstant(node, true)
    this._txb.setType(node, DType.ObjNull)
  }

  private visitBoolLitNode(node: BoolLitNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    this._txb.setConstant(node, true)
    this._txb.setSelfContainedConstant(node, true)
    this._txb.setType(node, DType.Boolean)
  }

  private visitStrLitNode(node: StrLitNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    this._txb.setConstant(node, true)
    this._txb.setSelfContainedConstant(node, true)
    this._txb.setType(node, DType.String)

    // For Data Table Scenario Only
    if (
      this._txb.property != null &&
      this._txb.property.useForDataQuerySelects
    ) {
      // Lookup ThisItem info
      if (this._nameResolver == null) {
        return
      }

      const result = this._nameResolver.tryGetInnermostThisItemScope()
      const lookupInfo = result[1]

      if (!result[0]) {
        return
      }

      this._txb.addFieldToQuerySelects(lookupInfo.type, node.value)
    }
  }

  private visitNumLitNode(node: NumLitNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    this._txb.setConstant(node, true)
    this._txb.setSelfContainedConstant(node, true)
    this._txb.setType(node, DType.Number)
  }

  public getLogicalNodeNameAndUpdateDisplayNames(
    type: DType,
    ident: Identifier,
    isThisItem = false
  ): DName {
    return this.getLogicalNodeNameAndUpdateDisplayNamesOut(
      type,
      ident,
      isThisItem
    )[0]
  }

  public getLogicalNodeNameAndUpdateDisplayNamesOut(
    type: DType,
    ident: Identifier,
    isThisItem = false
  ): [DName, string] {
    // Contracts.AssertValid(type);
    // Contracts.AssertValue(ident);

    let logicalNodeName: DName = ident.name
    let newDisplayName = logicalNodeName.value

    if (
      type == DType.Invalid ||
      (!type.isOptionSet && !type.isView && type.associatedDataSources == null)
    )
      return [logicalNodeName, newDisplayName]

    // Skip trying to match display names if the type isn't associated with a data source, an option set or view
    if (
      type.associatedDataSources.size == 0 &&
      !type.isOptionSet &&
      !type.isView &&
      !type.hasExpandInfo
    )
      return [logicalNodeName, newDisplayName]

    const firstOrDefault = type.associatedDataSources.values().next()
      .value as IExternalTabularDataSource
    let useUpdatedDisplayNames =
      (firstOrDefault?.isConvertingDisplayNameMapping ?? false) ||
      (type.optionSetInfo?.isConvertingDisplayNameMapping ?? false) ||
      (type.viewInfo?.isConvertingDisplayNameMapping ?? false) ||
      this._txb.forceUpdateDisplayNames
    let updatedDisplayNamesType = type

    if (
      !useUpdatedDisplayNames &&
      type.hasExpandInfo &&
      type.expandInfo.parentDataSource.kind == DataSourceKind.CdsNative
    ) {
      const rst =
        this._txb.document.globalScope.tryGetCdsDataSourceWithLogicalName(
          (type.expandInfo.parentDataSource as IExternalCdsDataSource)
            .datasetName,
          type.expandInfo.identity
        )
      const relatedDataSource = rst[1]
      if (rst[0] && relatedDataSource.isConvertingDisplayNameMapping) {
        useUpdatedDisplayNames = true
        updatedDisplayNamesType = relatedDataSource.schema
      }
    }

    if (this._txb.updateDisplayNames && useUpdatedDisplayNames) {
      // Either we need to go Display Name -> Display Name here
      // Or we need to go Logical Name -> Display Name
      let maybeDisplayName: string
      let maybeLogicalName: string
      const result = DType.TryGetConvertedDisplayNameAndLogicalNameForColumn(
        updatedDisplayNamesType,
        ident.name.value
      )
      maybeDisplayName = result[1].newDisplayName
      maybeLogicalName = result[1].logicalName
      if (result[0]) {
        logicalNodeName = new DName(maybeLogicalName)
        this._txb.nodesToReplace.push({
          key: ident.token,
          value: maybeDisplayName,
        })
      } else {
        const rst = DType.TryGetDisplayNameForColumn(
          updatedDisplayNamesType,
          ident.name.value
        )
        maybeDisplayName = rst[1]
        if (rst[0]) {
          this._txb.nodesToReplace.push({
            key: ident.token,
            value: maybeDisplayName,
          })
        }
      }

      if (maybeDisplayName != null) {
        newDisplayName = new DName(maybeDisplayName).value
      }
    } else {
      let maybeLogicalName: string
      const rst = DType.TryGetLogicalNameForColumn(
        updatedDisplayNamesType,
        ident.name.value,
        isThisItem
      )
      maybeLogicalName = rst[1]
      if (rst[0]) {
        logicalNodeName = new DName(maybeLogicalName)
        this._txb.nodesToReplace.push({
          key: ident.token,
          value: maybeLogicalName,
        })
      }
    }

    return [logicalNodeName, newDisplayName]
  }

  public visitFirstNameNode(node: FirstNameNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    let info: FirstNameInfo
    let haveNameResolver = this._nameResolver != null

    // Reset name lookup preferences.
    let lookupPrefs: NameLookupPreferences = NameLookupPreferences.None
    let nodeName: DName = node.ident.name
    let fError = false

    // If node is a global variable but it appears in its own weight table, we know its state has changed
    // in a "younger" sibling or cousin node, vis. some predecessor statement in a chained operation
    // changed the value of this variable, and we must ensure that it is not lifted by the back end.
    // e.g. With({}, Set(x, 1); Set(y, x + 1)) -- we need to indicate that "x + 1" cannot be cached and
    // expect to retain the same value throughout the chained operator's scope.
    if (this._txb.getVolatileVariables(node).has(node.ident.name.toString())) {
      this._txb.setIsUnliftable(node, true)
    }

    // [@name]
    if (node.ident.atToken != null) {
      if (haveNameResolver) lookupPrefs |= NameLookupPreferences.GlobalsOnly
    } else {
      let scope: Scope
      const rst = this.isRowScopeAlias(node)
      scope = rst[1]

      if (rst[0]) {
        // Contracts.Assert(scope.Type.IsRecord);
        info = FirstNameInfo.Create6(
          BindKind.LambdaFullRecord,
          node,
          scope.nest,
          this._currentScope.nest,
          scope.data
        )
        // Contracts.Assert(info.Kind == BindKind.LambdaFullRecord);

        nodeName = this.getLogicalNodeNameAndUpdateDisplayNames(
          scope.type,
          node.ident
        )

        if (scope.nest < this._currentScope.nest) {
          this._txb.setBlockScopedConstantNode(node)
        }
        this._txb.setType(node, scope.type)
        this._txb.setInfoFirstName(node, info)
        this._txb.setLambdaScopeLevel(node, info.upCount)
        this._txb.addFieldToQuerySelects(scope.type, nodeName.toString())
        return
      } else {
        const rst2 = this.isRowScopeField(node)
        scope = rst2[1]?.scope
        fError = rst2[1]?.fError
        const isWholeScope = rst2[1]?.isWholeScope
        if (rst2[0]) {
          // Contracts.Assert(scope.Type.IsRecord);

          // Detected access to a pageable dataEntity in row scope, error was set
          if (fError) return

          let nodeType = scope.type

          if (!isWholeScope) {
            info = FirstNameInfo.Create6(
              BindKind.LambdaField,
              node,
              scope.nest,
              this._currentScope.nest,
              scope.data
            )
            nodeName = this.getLogicalNodeNameAndUpdateDisplayNames(
              scope.type,
              node.ident
            )
            nodeType = scope.type.getType(nodeName)
          } else {
            info = FirstNameInfo.Create6(
              BindKind.LambdaFullRecord,
              node,
              scope.nest,
              this._currentScope.nest,
              scope.data
            )
            if (scope.nest < this._currentScope.nest) {
              this._txb.setBlockScopedConstantNode(node)
            }
          }

          // Contracts.Assert(info.UpCount >= 0);

          this._txb.setType(node, nodeType)
          this._txb.setInfoFirstName(node, info)
          this._txb.setLambdaScopeLevel(node, info.upCount)
          this._txb.addFieldToQuerySelects(nodeType, nodeName.toString())
          return
        }
      }
    }

    // Look up a global variable with this name.
    let lookupInfo: NameLookupInfo = NameLookupInfo.Default()
    if (this._txb.affectsScopeVariableName) {
      if (haveNameResolver && this._nameResolver.currentEntity != null) {
        const scopedControl: IExternalControl =
          this._txb.glue.getVariableScopedControlFromTexlBinding(this._txb)
        // App variable name cannot conflict with any existing global entity name, eg. control/data/table/enum.
        const rst =
          scopedControl.isAppInfoControl &&
          this._nameResolver.lookupGlobalEntity(node.ident.name)
        lookupInfo = rst[1]
        if (rst[0]) {
          this._txb.errorContainer.error(
            node,
            TexlStrings.ErrExpectedFound_Ex_Fnd,
            TokKind.Ident,
            lookupInfo.kind
          )
        }
        this._txb.setAppScopedVariable(node, scopedControl.isAppInfoControl)
      }

      // Set the variable name node as DType.String.
      this._txb.setType(node, DType.String)
      this._txb.setInfoFirstName(
        node,
        FirstNameInfo.Create1(node, NameLookupInfo.Default())
      )
      return
    }

    if (node.parent instanceof DottedNameNode) {
      lookupPrefs |= NameLookupPreferences.HasDottedNameParent
    }

    // Check if this control property has local scope name resolver.
    const localScopeNameResolver = this._txb.localRuleScopeResolver
    if (localScopeNameResolver != null) {
      const rst = localScopeNameResolver.lookup(node.ident.name)
      const scopedInfo = rst[1]
      if (rst[0]) {
        this._txb.setType(node, scopedInfo.type)
        this._txb.setInfoFirstName(
          node,
          FirstNameInfo.Create4(node, scopedInfo)
        )
        this._txb.setStateful(node, scopedInfo.isStateful)
        this._txb.hasLocalReferences = true
        return
      }
    }

    if (!haveNameResolver) {
      this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
      this._txb.setType(node, DType.Error)
      this._txb.setInfoFirstName(
        node,
        FirstNameInfo.Create1(node, NameLookupInfo.Default())
      )
      return
    } else {
      const rst = this._nameResolver.lookup(node.ident.name, lookupPrefs)
      lookupInfo = rst[1]
      if (!rst[0]) {
        this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
        this._txb.setType(node, DType.Error)
        this._txb.setInfoFirstName(
          node,
          FirstNameInfo.Create1(node, NameLookupInfo.Default())
        )
        return
      }
    }
    // Contracts.Assert(lookupInfo.Kind != BindKind.LambdaField);
    // Contracts.Assert(lookupInfo.Kind != BindKind.LambdaFullRecord);
    // Contracts.Assert(lookupInfo.Kind != BindKind.Unknown);

    let fnInfo: FirstNameInfo = FirstNameInfo.Create1(node, lookupInfo)
    let lookupType = lookupInfo.type

    // Internal control references are not allowed in component input properties.
    if (
      IsIExternalControl(lookupInfo.data) &&
      this.checkComponentProperty(lookupInfo.data as IExternalControl)
    ) {
      this._txb.errorContainer.error(
        node,
        TexlStrings.ErrInternalControlInInputProperty
      )
      this._txb.setType(node, DType.Error)
      this._txb.setInfoFirstName(
        node,
        fnInfo ?? FirstNameInfo.Create1(node, NameLookupInfo.Default())
      )
      return
    }
    if (lookupInfo.kind == BindKind.ThisItem) {
      this._txb.hasThisItemReference = true
      const rst = this.tryProcessFirstNameNodeForThisItemAccess(
        node,
        lookupInfo
      )
      lookupType = rst[1].nodeType
      fnInfo = rst[1].info
      if (!rst[0] || lookupType.isError) {
        this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
        this._txb.setType(node, DType.Error)
        this._txb.setInfoFirstName(
          node,
          fnInfo ?? FirstNameInfo.Create1(node, NameLookupInfo.Default())
        )
        return
      }
      this._txb.setContextual(node, true)
    } else if (lookupInfo.kind == BindKind.DeprecatedImplicitThisItem) {
      this._txb.hasThisItemReference = true

      // Even though lookupInfo.Type isn't the full data source type, it still is tagged with the full datasource info if this is a thisitem node
      nodeName = this.getLogicalNodeNameAndUpdateDisplayNames(
        lookupType,
        node.ident,
        /* isThisItem */ true
      )

      // If the ThisItem reference is an entity, the type should be expanded.
      if (lookupType.isExpandEntity) {
        let parentEntityPath = ''

        let thisItemType: DType = undefined /* default(DType); */
        const outerControl = lookupInfo.data
        if (IsIExternalControl(lookupInfo.data)) {
          thisItemType = (outerControl as IExternalControl).thisItemType
        }
        if (thisItemType != null && thisItemType.hasExpandInfo)
          parentEntityPath = thisItemType.expandInfo.expandPath.toString()

        lookupType = this.getExpandedEntityType(lookupType, parentEntityPath)
        fnInfo = FirstNameInfo.Create2(
          node,
          lookupInfo,
          lookupInfo.type.expandInfo
        )
      }
    }

    // Make a note of this global's type, as identifier by the resolver.
    this._txb.setType(node, lookupType)

    // If this is a reference to an Enum, it is constant.
    this._txb.setConstant(node, lookupInfo.kind == BindKind.Enum)
    this._txb.setSelfContainedConstant(node, lookupInfo.kind == BindKind.Enum)

    // Create a name info with an appropriate binding, defaulting to global binding in error cases.
    this._txb.setInfoFirstName(node, fnInfo)

    // If the firstName is a standalone global control reference (i.e. not a LHS for a property access)
    // make sure to record this, as it's something that is needed later during codegen.
    if (
      lookupType.isControl &&
      (node.parent == null || node.parent.asDottedName() == null)
    ) {
      this._txb.hasControlReferences = true

      // If the current property doesn't support global control references, set an error
      if (this._txb.currentPropertyRequiresDefaultableReferences)
        this._txb.errorContainer.ensureError(
          node,
          TexlStrings.ErrInvalidControlReference
        )
    }

    // Update _usesGlobals, _usesResources, etc.
    this.updateBindKindUseFlags(lookupInfo.kind)

    // Update statefulness of global datasources excluding dynamic datasources.
    if (
      lookupInfo.kind == BindKind.Data &&
      !this._txb.glue.isDynamicDataSourceInfo(lookupInfo.data)
    ) {
      this._txb.setStateful(node, true)
    }

    if (
      lookupInfo.kind == BindKind.WebResource ||
      (lookupInfo.kind == BindKind.QualifiedValue &&
        ((lookupInfo.data as IQualifiedValuesInfo)?.isAsyncAccess ?? false))
    ) {
      this._txb.flagPathAsAsync(node)
      this._txb.setStateful(node, true)
    }

    this._txb.checkAndMarkAsPageable(node)

    if (
      (lookupInfo.kind == BindKind.WebResource ||
        lookupInfo.kind == BindKind.QualifiedValue) &&
      !(node.parent instanceof DottedNameNode)
    ) {
      this._txb.errorContainer.ensureError(
        node,
        TexlStrings.ErrValueMustBeFullyQualified
      )
    }
    // Any connectedDataSourceInfo or option set or view needs to be accessed asynchronously to allow data to be loaded.
    if (
      IsIExternalTabularDataSource(lookupInfo.data) ||
      lookupInfo.kind == BindKind.OptionSet ||
      lookupInfo.kind == BindKind.View
    ) {
      this._txb.flagPathAsAsync(node)
    }
  }

  private tryProcessFirstNameNodeForThisItemAccess(
    node: FirstNameNode,
    lookupInfo: NameLookupInfo
  ): [boolean, { nodeType: DType; info: FirstNameInfo }] {
    let nodeType: DType
    let info: FirstNameInfo
    if (IsIExternalControl(this._nameResolver.currentEntity)) {
      // Check to see if we only want to include ThisItem in specific
      // properties of this Control
      const result = this._nameResolver.entityScope.tryGetEntity(
        this._nameResolver.currentEntity.entityName
      )
      const nodeAssociatedControl = result[1] as IExternalControl
      if (
        result[0] &&
        nodeAssociatedControl.template.includesThisItemInSpecificProperty
      ) {
        let nodeAssociatedProperty: IExternalControlProperty
        const rst = nodeAssociatedControl.template.tryGetProperty(
          this._nameResolver.currentProperty.toString()
        )
        nodeAssociatedProperty = rst[1]
        if (rst[0] && !nodeAssociatedProperty.shouldIncludeThisItemInFormula) {
          nodeType = null
          info = null
          return [false, { nodeType, info }]
        }
      }
    }

    // Check to see if ThisItem is used in a DottedNameNode and if there is a data control
    // accessible from this rule.
    let dataControlName: DName = DName.Default()
    let result = this._nameResolver.lookupDataControl(node.ident.name)

    if (node.parent instanceof DottedNameNode && result[0]) {
      const dataControlLookupInfo = result[1].lookupInfo
      dataControlName = result[1].dataControlName
      // Get the property name being accessed by the parent dotted name.
      let rightName: DName = node.parent.right.name

      // Contracts.AssertValid(rightName);
      // Contracts.Assert(dataControlLookupInfo.Type.IsControl);

      // Check to see if the dotted name is accessing a property of the data control.
      if (
        (
          dataControlLookupInfo.type as unknown as IExternalControlType
        ).controlTemplate.hasOutput(rightName)
      ) {
        // Set the result type to the data control type.
        nodeType = dataControlLookupInfo.type
        info = FirstNameInfo.Create3(node, lookupInfo, dataControlName, true)
        return [true, { nodeType, info }]
      }
    }

    nodeType = lookupInfo.type
    info = FirstNameInfo.Create3(node, lookupInfo, dataControlName, false)
    return [true, { nodeType, info }]
  }

  private isRowScopeField(
    node: FirstNameNode
  ): [boolean, { scope: Scope; fError: boolean; isWholeScope: boolean }] {
    // Contracts.AssertValue(node);

    let fError = false
    let isWholeScope = false
    let scope: Scope

    // [@foo] cannot be a scope field.
    if (node.ident.atToken != null) {
      scope = undefined
      return [false, { scope, fError, isWholeScope }]
    }

    let nodeName: DName = node.ident.name
    // Look up the name in the current scopes, innermost to outermost.
    // The logic here is as follows:
    // We need to find the innermost row scope where the FirstName we're searching for is present in the scope
    // Either as a field in the type, or as the scope identifier itself
    // We check the non-reqired identifier case first to preserve existing behavior when the field name is 'ThisRecord'
    for (scope = this._currentScope; scope != null; scope = scope.parent) {
      // Contracts.AssertValue(scope);
      if (!scope.createsRowScope) continue

      // If the scope identifier isn't required, look up implicit accesses
      if (!scope.requireScopeIdentifier) {
        // If scope type is a data source, the node may be a display name instead of logical.
        // Attempt to get the logical name to use for type checking.
        // If this is executed amidst a metadata refresh then the reference may refer to an old
        // display name, so we need to check the old mapping as well as the current mapping.
        let usesDisplayName: boolean
        let maybeLogicalName: string
        const rst = DType.TryGetConvertedDisplayNameAndLogicalNameForColumn(
          scope.type,
          nodeName.value
        )
        maybeLogicalName = rst[1].logicalName
        if (rst[0]) {
          usesDisplayName = true
        } else {
          const rst2 = DType.TryGetLogicalNameForColumn(
            scope.type,
            nodeName.value
          )
          maybeLogicalName = rst2[1]
          usesDisplayName = rst2[0]
        }
        // let usesDisplayName =
        //     DType.TryGetConvertedDisplayNameAndLogicalNameForColumn(scope.Type, nodeName.Value, out let maybeLogicalName, out _) ||
        //     DType.TryGetLogicalNameForColumn(scope.Type, nodeName.Value, out maybeLogicalName);
        if (usesDisplayName) nodeName = new DName(maybeLogicalName)

        let typeTmp: DType
        const typeResult = scope.type.tryGetType(nodeName)
        typeTmp = typeResult[1]
        if (typeResult[0]) {
          // Expand the entity type here.
          if (typeTmp.isExpandEntity) {
            let parentEntityPath = ''
            if (scope.type.hasExpandInfo)
              parentEntityPath = scope.type.expandInfo.expandPath.toString()

            // We cannot access pageable entities in row-scope, as it will generate too many calls to the connector
            // Set an error and skip it.
            if (typeTmp.expandInfo.isTable) {
              if (
                this._txb.document != null &&
                this._txb.document.properties.enabledFeatures
                  .isEnableRowScopeOneToNExpandEnabled
              ) {
                this._txb.errorContainer.ensureErrorWithSeverity(
                  DocumentErrorSeverity.Warning,
                  node,
                  TexlStrings.WrnRowScopeOneToNExpandNumberOfCalls
                )
              } else {
                this._txb.errorContainer.error(
                  node,
                  TexlStrings.ErrColumnNotAccessibleInCurrentContext
                )
                this._txb.setType(node, DType.Error)
                fError = true
                return [true, { scope, fError, isWholeScope }]
              }
            }

            let expandedEntityType: DType = this.getExpandedEntityType(
              typeTmp,
              parentEntityPath
            )
            const rst = scope.type.setType(
              fError,
              DPath.Root.append(nodeName),
              expandedEntityType
            )
            let type: DType = rst[0]
            fError = rst[1]
            scope = new Scope(
              scope.call,
              scope.parent,
              type,
              scope.scopeIdentifier,
              scope.requireScopeIdentifier,
              expandedEntityType.expandInfo
            )
          }
          return [true, { scope, fError, isWholeScope }]
        }
      }

      if (scope.scopeIdentifier?.equals(nodeName)) {
        isWholeScope = true
        return [true, { scope, fError, isWholeScope }]
      }
    }

    scope = undefined
    return [false, { scope, fError, isWholeScope }]
  }

  private isRowScopeAlias(node: FirstNameNode): [boolean, Scope] {
    // Contracts.AssertValue(node);

    let scope: Scope = undefined

    if (!node.isLhs) return [false, scope]

    let dotted: DottedNameNode = node.parent.asDottedName()
    if (!dotted.usesBracket) return [false, scope]

    // Look up the name as a scope alias.
    for (scope = this._currentScope; scope != null; scope = scope.parent) {
      // Contracts.AssertValue(scope);

      if (!scope.createsRowScope || scope.call == null) continue

      // There is no row scope alias, so we have to rely on a heuristic here.
      // Look for the first scope whose parent call specifies a matching FirstName arg0.
      let arg0: FirstNameNode
      if (
        scope.call.args.count > 0 &&
        (arg0 = scope.call.args.children[0].asFirstName()) != null &&
        arg0.ident.name == node.ident.name &&
        arg0.ident.namespace == node.ident.namespace
      ) {
        return [true, scope]
      }
    }

    scope = undefined
    return [false, scope]
  }

  public visitParentNode(node: ParentNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    if (
      this._nameResolver == null ||
      this._nameResolver.currentEntity == null
    ) {
      this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
      this._txb.setType(node, DType.Error)
      return
    }

    let lookupInfo: NameLookupInfo
    if (!IsIExternalControl(this._nameResolver.currentEntity)) {
      this._txb.errorContainer.error(node, TexlStrings.ErrInvalidParentUse)
      this._txb.setType(node, DType.Error)
      return
    } else {
      const rst = this._nameResolver.lookupParent()
      lookupInfo = rst[1]
      if (!rst[0]) {
        this._txb.errorContainer.error(node, TexlStrings.ErrInvalidParentUse)
        this._txb.setType(node, DType.Error)
        return
      }
    }

    // if (!this._nameResolver.currentEntity.isControl || !this._nameResolver.lookupParent(out lookupInfo))
    // {
    //     _txb.ErrorContainer.Error(node, TexlStrings.ErrInvalidParentUse);
    //     _txb.SetType(node, DType.Error);
    //     return;
    // }

    // Treat this as a standard access to the parent control ("v" type).
    this._txb.setType(node, lookupInfo.type)
    this._txb.setInfoParentNode(
      node,
      new ParentInfo(node, lookupInfo.path, lookupInfo.data as IExternalControl)
    )
    this._txb.hasParentItemReference = true

    this.updateBindKindUseFlags(lookupInfo.kind)
  }

  public visitSelfNode(node: SelfNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    if (
      this._nameResolver == null ||
      this._nameResolver.currentEntity == null
    ) {
      this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
      this._txb.setType(node, DType.Error)
      return
    }

    let lookupInfo: NameLookupInfo
    const rst = this._nameResolver.lookupSelf()
    lookupInfo = rst[1]
    if (!rst[0]) {
      this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
      this._txb.setType(node, DType.Error)
      return
    }

    // Treat this as a standard access to the current control ("v" type).
    this._txb.setType(node, lookupInfo.type)
    this._txb.setInfoSelfNode(
      node,
      new SelfInfo(node, lookupInfo.path, lookupInfo.data as IExternalControl)
    )
    this._txb.hasSelfReference = true

    this.updateBindKindUseFlags(lookupInfo.kind)
  }

  private updateBindKindUseFlags(bindKind: BindKind) {
    // Contracts.Assert(BindKind._Min <= bindKind && bindKind < BindKind._Lim);

    switch (bindKind) {
      case BindKind.Condition:
      case BindKind.Control:
      case BindKind.Data:
      case BindKind.PowerFxResolvedObject:
      case BindKind.NamedValue:
      case BindKind.QualifiedValue:
      case BindKind.WebResource:
        this._txb.usesGlobals = true
        break
      case BindKind.Alias:
        this._txb.usesAliases = true
        break
      case BindKind.ScopeCollection:
        this._txb.usesScopeCollections = true
        break
      case BindKind.ScopeVariable:
        this._txb.usesScopeVariables = true
        break
      case BindKind.DeprecatedImplicitThisItem:
      case BindKind.ThisItem:
        this._txb.usesThisItem = true
        break
      case BindKind.Resource:
        this._txb.usesResources = true
        this._txb.usesGlobals = true
        break
      case BindKind.OptionSet:
        this._txb.usesGlobals = true
        this._txb.usesOptionSets = true
        break
      case BindKind.View:
        this._txb.usesGlobals = true
        this._txb.usesViews = true
        break
      default:
        // Contracts.Assert(bindKind == BindKind.LambdaField || bindKind == BindKind.LambdaFullRecord || bindKind == BindKind.Enum || bindKind == BindKind.Unknown);
        break
    }
  }

  public preVisit(node: NonLeafNodeType): boolean {
    // console.log('preVisit', NodeKind[node.kind], node.toString())
    switch (node.kind) {
      case NodeKind.Record:
        return this.preVisitRecordNode(node as RecordNode)
      case NodeKind.Table:
        return this.preVisitTableNode(node as TableNode)
      case NodeKind.DottedName:
        return this.preVisitDottedNameNode(node as DottedNameNode)
      case NodeKind.Call:
        return this.preVisitCallNode(node as CallNode)
      case NodeKind.VariadicOp:
        return this.preVisitVariadicOpNode(node as VariadicOpNode)
      case NodeKind.BinaryOp:
        return this.preVisitBinaryOpNode(node as BinaryOpNode)
      case NodeKind.UnaryOp:
        return this.preVisitUnaryOpNode(node as UnaryOpNode)
      case NodeKind.List:
        return this.preVisitVariadicBase(node as ListNode)
      case NodeKind.StrInterp:
        return this.preVisitStrInterpNode(node as StrInterpNode)
      default:
        return true
    }
  }

  private preVisitRecordNode(node: RecordNode) {
    return this.preVisitVariadicBase(node)
  }

  private preVisitTableNode(node: TableNode) {
    return this.preVisitVariadicBase(node)
  }

  private preVisitVariadicBase(node: VariadicBase) {
    // Contracts.AssertValue(node);

    const volatileVariables = this._txb.getVolatileVariables(node)
    for (const child of node.children)
      this._txb.addVolatileVariables(child, volatileVariables)

    return true
  }

  private preVisitDottedNameNode(node: DottedNameNode) {
    // Contracts.AssertValue(node);

    this._txb.addVolatileVariables(
      node.left,
      this._txb.getVolatileVariables(node)
    )
    if (node.left instanceof FirstNameNode && node.parent == null) {
      node.left.parent = node
    }
    return true
  }

  private preVisitStrInterpNode(node: StrInterpNode) {
    let runningWeight = this._txb.getVolatileVariables(node)
    let isUnliftable = false

    const args = node.children
    const argTypes: DType[] = []

    for (let i = 0; i < args.length; i++) {
      const child = args[i]
      this._txb.addVolatileVariables(child, runningWeight)
      child.accept(this)
      argTypes[i] = this._txb.getType(args[i])
      runningWeight = new Set([
        ...runningWeight,
        ...this._txb.getVolatileVariables(child),
      ])
      isUnliftable ||= this._txb.isUnliftable(child)
    }

    // Typecheck the node's children against the built-in Concatenate function
    const result = BuiltinFunctionsCore.Concatenate.checkInvocation(
      args,
      argTypes,
      this._txb.errorContainer,
      this._txb
    )
    const fArgsValid = result[0]
    const { returnType, nodeToCoercedTypeMap } = result[1]
    if (!fArgsValid) {
      this._txb.errorContainer.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrInvalidStringInterpolation
      )
    }

    if (fArgsValid && nodeToCoercedTypeMap != null) {
      for (const nodeToCoercedTypeKvp of nodeToCoercedTypeMap) {
        this._txb.setCoercedType(
          nodeToCoercedTypeKvp[0],
          nodeToCoercedTypeKvp[1]
        )
      }
    }

    this._txb.setType(node, returnType)

    this._txb.addVolatileVariables(node, runningWeight)
    this._txb.setIsUnliftable(node, isUnliftable)

    this.postVisit(node)
    return false
  }

  public postVisitStrInterpNode(node: StrInterpNode) {
    // AssertValid();
    // Contracts.AssertValue(node);

    // Determine constancy.
    let isConstant = true
    let isSelfContainedConstant = true

    for (const child of node.children) {
      isConstant &&= this._txb.isConstant(child)
      isSelfContainedConstant &&= this._txb.isSelfContainedConstant(child)
      if (!isConstant && !isSelfContainedConstant) {
        break
      }
    }

    this._txb.setConstant(node, isConstant)
    this._txb.setSelfContainedConstant(node, isSelfContainedConstant)

    this.setVariadicNodePurity(node)
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(...node.children))
  }

  public postVisitDottedNameNode(node: DottedNameNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    let leftType: DType = this._txb.getType(node.left)

    if (
      !leftType.isControl &&
      !leftType.isAggregate &&
      !leftType.isEnum &&
      !leftType.isOptionSet &&
      !leftType.isView &&
      !leftType.isUntypedObject
    ) {
      this.setDottedNameError(node, TexlStrings.ErrInvalidDot)
      return
    }

    let value: any = null
    let typeRhs = DType.Invalid
    let nameRhs = node.right.name

    nameRhs = this.getLogicalNodeNameAndUpdateDisplayNames(leftType, node.right)

    // In order for the node to be constant, it must be a member of an enum,
    // a member of a constant aggregate,
    // or a reference to a constant rule (checked later).
    let isConstant =
      leftType.isEnum ||
      (leftType.isAggregate && this._txb.isConstant(node.left))

    // Some nodes are never pageable, use this to
    // skip the check for pageability and default to non-pageable;
    let canBePageable = true

    if (leftType.isEnum) {
      if (this._nameResolver == null) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }

      // The RHS is a locale-specific name (straight from the parse tree), so we need
      // to look things up accordingly. If the LHS is a FirstName, fetch its embedded
      // EnumInfo and look in it for a value with the given locale-specific name.
      // This should be a fast O(1) lookup that covers 99% of all cases, such as
      // Couleur!Rouge, Align.Droit, etc.
      let firstNodeLhs = node.left.asFirstName()
      let firstInfoLhs =
        firstNodeLhs == null ? null : this._txb.getInfo(firstNodeLhs)
      const rstOne = this._nameResolver.lookupEnumValueByInfoAndLocName(
        firstInfoLhs.data,
        nameRhs
      )
      const rstLast = this._nameResolver.lookupEnumValueByTypeAndLocName(
        leftType,
        nameRhs
      )

      if (firstInfoLhs != null && rstOne[0]) {
        typeRhs = leftType.getEnumSupertype()
      }
      // ..otherwise do a slower lookup by type for the remaining 1% of cases,
      // such as text1!Fill!Rouge, etc.
      // This is O(n) in the number of registered enums.
      else if (rstLast[0]) {
        typeRhs = leftType.getEnumSupertype()
      } else {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }
    } else if (leftType.isOptionSet || leftType.isView) {
      const rst = leftType.tryGetType(nameRhs)
      typeRhs = rst[1]
      if (!rst[0]) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }
    } else if (leftType.isAttachment) {
      // Error: Attachment Type should never be the left hand side of dotted name node
      this.setDottedNameError(node, TexlStrings.ErrInvalidName)
    } else if (IsIExternalControlType(leftType)) {
      const leftControl: IExternalControlType = leftType
      // const result = this.getLHSControlInfo(node)
      let { controlInfo, isIndirectPropertyUsage } =
        this.getLHSControlInfo(node)
      if (isIndirectPropertyUsage) {
        this._txb.usedControlProperties.add(nameRhs)
      }

      // Explicitly block accesses to the parent's nested-aware property.
      if (
        controlInfo != null &&
        this.usesParentsNestedAwareProperty(controlInfo, nameRhs)
      ) {
        this.setDottedNameError(
          node,
          TexlStrings.ErrNotAccessibleInCurrentContext
        )
        return
      }

      // The RHS is a control property name (locale-specific).
      let template: IExternalControlTemplate = leftControl.controlTemplate

      const rst = template.tryGetOutputProperty(nameRhs.toString())
      let property = rst[1]
      if (!rst[0]) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }

      // We block the property access usage for behavior component properties.
      if (
        template.isComponent &&
        PropertyRuleCategoryExtensions.IsBehavioral(property.propertyCategory)
      ) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidPropertyReference)
        return
      }

      // We block the property access usage for scoped component properties.
      if (template.isComponent && property.isScopeVariable) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidPropertyReference)
        return
      }

      // We block the property access usage for datasource of the command component.
      if (
        template.isCommandComponent &&
        this._txb.glue.isPrimaryCommandComponentProperty(property)
      ) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidPropertyReference)
        return
      }

      let lhsControlInfo = controlInfo
      let currentControl = this._txb.control
      // We block the property access usage for context property of the command component instance unless it's the same command control.
      if (
        lhsControlInfo != null &&
        lhsControlInfo.isCommandComponentInstance &&
        this._txb.glue.isContextProperty(property) &&
        currentControl != null &&
        currentControl != lhsControlInfo
      ) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidPropertyReference)
        return
      }

      // Explicitly block access to design properties referenced via Selected/AllItems.
      if (
        leftControl.isDataLimitedControl &&
        property.propertyCategory != PropertyRuleCategory.Data
      ) {
        this.setDottedNameError(
          node,
          TexlStrings.ErrNotAccessibleInCurrentContext
        )
        return
      }

      // For properties requiring default references, block non-defaultable properties
      if (
        this._txb.currentPropertyRequiresDefaultableReferences &&
        property.unloadedDefault == null
      ) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidControlReference)
        return
      }
      // If the property has pass-through input (e.g. AllItems, Selected, etc), the correct RHS (property)
      // expando type is not available in the "v" type. We try delay calculating this until we need it as this is
      // an expensive operation especially for form control which generally has tons of nested controls. So we calculate the type here.
      // There might be cases where we are getting the schema from imported data that once belonged to a control and now,
      // we don't have a pass-through input associated with it. Therefore, we need to get the opaqueType to avoid localizing the schema.
      if (property.passThroughInput == null) typeRhs = property.getOpaqueType()
      else {
        let firstNodeLhs: FirstNameNode = node.left.asFirstName()
        if (
          template.hasExpandoProperties &&
          template.expandoProperties.some(
            (p) => p.invariantName == property.invariantName
          ) &&
          controlInfo != null &&
          (firstNodeLhs == null ||
            this._txb.getInfo(firstNodeLhs).kind != BindKind.ScopeVariable)
        ) {
          // If visiting an expando type property of control type variable, we cannot calculate the type here because
          // The LHS associated ControlInfo is App/Component.
          // e.g. Set(controlVariable1, DropDown1), Label1.Text = controlVariable1.Selected.Value.
          leftType = controlInfo.getControlDType(
            true,
            false
          ) as unknown as DType
        }
        const rst = leftType.toRecord().tryGetType(property.invariantName)
        typeRhs = rst[1]
        if (!rst[0]) {
          this.setDottedNameError(node, TexlStrings.ErrInvalidName)
          return
        }
      }

      // If the reference is to Control.Property and the rule for that Property is a constant,
      // we need to mark the node as constant, and save the control info so we may look up the
      // rule later.
      const rule = controlInfo?.getRule(property.invariantName.toString())
      if (
        rule?.hasErrors === false &&
        rule.binding.isConstant(rule.binding.top)
      ) {
        value = controlInfo
        isConstant = true
      }

      // Check access to custom scoped input properties. Such properties can only be accessed from within a component or output property of a component.
      if (
        property.isScopedProperty &&
        this._txb.control != null &&
        this._txb.property != null &&
        controlInfo != null &&
        !Visitor.IsValidAccessToScopedProperty(
          controlInfo,
          property,
          this._txb.control,
          this._txb.property
        )
      ) {
        this.setDottedNameError(
          node,
          TexlStrings.ErrUnSupportedComponentDataPropertyAccess
        )
        return
      }

      // Check for scoped property access with required scoped variable.
      if (
        property.isScopedProperty &&
        property.scopeFunctionPrototype.minArity > 0
      ) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidPropertyAccess)
        return
      }

      if (property.isScopedProperty && property.scopeFunctionPrototype.isAsync)
        this._txb.flagPathAsAsync(node)
    } else {
      const result = leftType.tryGetType(nameRhs)
      typeRhs = result[1]
      if (!result[0] && !leftType.isUntypedObject) {
        // We may be in the case of dropDown!Selected!RHS
        // In this case, Selected embeds a meta field whose v-type encapsulates localization info
        // for the sub-properties of "Selected". The localized sub-properties are NOT present in
        // the Selected DType directly.
        // Contracts.Assert(leftType.IsAggregate);
        const rst = leftType.tryGetMetaField()
        const vType = rst[1]
        if (rst[0]) {
          const propertyResult = vType.controlTemplate.tryGetOutputProperty(
            nameRhs.value
          )
          const property = propertyResult[1]
          if (!propertyResult[0]) {
            this.setDottedNameError(node, TexlStrings.ErrInvalidName)
            return
          }
          typeRhs = property.type
        } else {
          this.setDottedNameError(node, TexlStrings.ErrInvalidName)
          return
        }
      } else if (IsIExternalControlType(typeRhs) && typeRhs.isMetaField) {
        this._txb.setType(node, typeRhs)
        // this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      } else if (typeRhs.isExpandEntity) {
        typeRhs = this.getEntitySchema(typeRhs, node)
        value = typeRhs.expandInfo
        // Contracts.Assert(typeRhs == DType.Error || typeRhs.ExpandInfo != null);
        if (
          this._txb.isRowScope(node.left) &&
          typeRhs.expandInfo != null &&
          typeRhs.expandInfo.isTable
        ) {
          if (
            this._txb.document != null &&
            this._txb.document.properties.enabledFeatures
              .isEnableRowScopeOneToNExpandEnabled
          ) {
            this._txb.errorContainer.ensureErrorWithSeverity(
              DocumentErrorSeverity.Warning,
              node,
              TexlStrings.WrnRowScopeOneToNExpandNumberOfCalls
            )
          } else {
            this.setDottedNameError(
              node,
              TexlStrings.ErrColumnNotAccessibleInCurrentContext
            )
            return
          }
        }
      } else if (typeRhs.isFlow) {
        value = typeRhs.flowInfo
      }
    }

    // Consider the attachmentType as the type of the node for binding purposes
    // if it is being accessed from a record
    if (typeRhs.isAttachment) {
      // Disable accessing the attachment in RowScope or single column table
      // to prevent a large number of calls to the service
      if (this._txb.isRowScope(node.left) || leftType.isTable) {
        this.setDottedNameError(
          node,
          TexlStrings.ErrColumnNotAccessibleInCurrentContext
        )
        return
      }

      let attachmentType = typeRhs.attachmentType
      // Contracts.AssertValid(attachmentType);
      // Contracts.Assert(leftType.IsRecord);

      typeRhs = attachmentType
      this._txb.hasReferenceToAttachment = true
      this._txb.flagPathAsAsync(node)
    }

    // Set the type for the dotted node itself.
    if (leftType.isEnum) {
      // #T[id:val, ...] . id --> T
      // Contracts.Assert(typeRhs == leftType.GetEnumSupertype());
      this._txb.setType(node, typeRhs)
    } else if (leftType.isOptionSet || leftType.isView) {
      this._txb.setType(node, typeRhs)
    } else if (leftType.isRecord) {
      // ![id:type, ...] . id --> type
      this._txb.setType(node, typeRhs)
    } else if (leftType.isUntypedObject) {
      this._txb.setType(node, DType.UntypedObject)
    } else if (leftType.isTable) {
      // *[id:type, ...] . id  --> *[id:type]
      // We don't support scenario when lhs is table and rhs is entity of table type (1-n)
      if (IsIExpandInfo(value) && typeRhs.isTable) {
        this.setDottedNameError(
          node,
          TexlStrings.ErrColumnNotAccessibleInCurrentContext
        )
        return
      } else if (IsIExpandInfo(value)) {
        let resultType = DType.CreateTable(new TypedName(typeRhs, nameRhs))
        for (const cds of leftType.associatedDataSources) {
          resultType = DType.AttachDataSourceInfo(resultType, cds, false)
        }
        this._txb.setType(node, resultType)
        canBePageable = false
      } else {
        // 获取ThisItem后面的属性的值，避免数组无法触犯Reactive的问题
        if (this._txb.getInfo(node.left)?.kind === BindKind.ThisItem) {
          value = this._txb.nameResolver.lookupFormulaValuesIn(
            `${this._txb.getInfo(node.left).path.toDottedSyntax()}.${
              node.right.name.value
            }`
          )
        }
        this._txb.setType(
          node,
          DType.CreateDTypeWithConnectedDataSourceInfoMetadata(
            DType.CreateTable(new TypedName(typeRhs, nameRhs)),
            typeRhs.associatedDataSources
          )
        )
      }
    } else {
      // v[prop:type, ...] . prop --> type
      // Contracts.Assert(leftType.IsControl || leftType.IsExpandEntity || leftType.IsAttachment);
      this._txb.setType(node, typeRhs)
    }

    // Set the remaining bits -- name info, side effect info, etc.
    this._txb.setInfoDottedName(node, new DottedNameInfo(node, value))
    this._txb.setSideEffects(node, this._txb.hasSideEffects(node.left))
    this._txb.setStateful(node, this._txb.isStateful(node.left))
    this._txb.setContextual(node, this._txb.isContextual(node.left))

    this._txb.setConstant(node, isConstant)
    this._txb.setSelfContainedConstant(
      node,
      leftType.isEnum ||
        (leftType.isAggregate && this._txb.isSelfContainedConstant(node.left))
    )
    if (this._txb.isBlockScopedConstant(node.left))
      this._txb.setBlockScopedConstantNode(node)

    this._txb.setScopeUseSet(node, this.joinScopeUseSets(node.left))

    if (canBePageable) {
      this._txb.checkAndMarkAsDelegatable(node)
      this._txb.checkAndMarkAsPageable(node)
    }

    this._txb.addVolatileVariables(
      node,
      this._txb.getVolatileVariables(node.left)
    )
    this._txb.setIsUnliftable(node, this._txb.isUnliftable(node.left))
  }

  private getLHSControlInfo(node: DottedNameNode): {
    controlInfo: IExternalControl
    isIndirectPropertyUsage: boolean
  } {
    let isIndirectPropertyUsage = false
    const result = this.tryGetControlInfoLHS(node.left)
    let info = result[1]
    if (!result[0]) {
      // App Global references need not be tracked for control references
      // here as Global control edges are is already handled in analysis.
      // Doing this here for global control reference can cause more than required aggressive edges
      // and creating cross screen dependencies that are not required.
      const rst = this.tryGetControlInfoLHS(node.left.asDottedName().left)
      const outerInfo = rst[1]
      isIndirectPropertyUsage = !(
        node.left.kind == NodeKind.DottedName &&
        rst[0] &&
        outerInfo.isAppGlobalControl
      )
    }

    return { controlInfo: info, isIndirectPropertyUsage }
  }

  // Check if the control can be used in current component property
  private checkComponentProperty(control: IExternalControl): boolean {
    return (
      control != null &&
      !this._txb.glue.canControlBeUsedInComponentProperty(this._txb, control)
    )
  }

  private getEntitySchema(entityType: DType, node: DottedNameNode): DType {
    // Contracts.AssertValid(entityType);
    // Contracts.AssertValue(node);

    let entityPath = ''
    let lhsType = this._txb.getType(node.left)
    if (lhsType.isRecord) {
      return lhsType.getType(node.right.name)
    }
    if (lhsType.hasExpandInfo) {
      entityPath = lhsType.expandInfo.expandPath.toString()
    }
    return this.getExpandedEntityType(entityType, entityPath)
  }

  protected getExpandedEntityType(
    expandEntityType: DType,
    relatedEntityPath: string
  ): DType {
    // Contracts.AssertValid(expandEntityType);
    // Contracts.Assert(expandEntityType.HasExpandInfo);
    // Contracts.AssertValue(relatedEntityPath);

    let expandEntityInfo = expandEntityType.expandInfo
    let dsInfo = expandEntityInfo.parentDataSource as IExternalTabularDataSource

    if (dsInfo == null) return expandEntityType

    let type: DType

    // This will cache expandend types of entities in QueryOptions
    let entityTypes = this._txb.queryOptions.getExpandDTypes(dsInfo)

    const result = entityTypes.tryGetValue(expandEntityInfo.expandPath)
    type = result[1]
    if (!result[0]) {
      const rst = expandEntityType.tryGetEntityDelegationMetadata()
      let metadata = rst[1]
      if (!rst[0]) {
        // We need more metadata to bind this fully
        this._txb.declareMetadataNeeded(expandEntityType)
        return DType.Error
      }

      type = expandEntityType.expandEntityType(
        metadata.schema,
        metadata.schema.associatedDataSources
      )
      // Contracts.Assert(type.hasExpandInfo);

      // Update the datasource and relatedEntity path.
      type.expandInfo.updateEntityInfo(
        expandEntityInfo.parentDataSource,
        relatedEntityPath
      )
      entityTypes.set(expandEntityInfo.expandPath, type)
    }

    return type
  }

  private tryGetControlInfoLHS(node: TexlNode): [boolean, IExternalControl] {
    // Contracts.AssertValue(node);
    let info: IExternalControl
    if (node instanceof ParentNode) {
      info = this._txb.getInfo(node)?.data as IExternalControl
    } else if (node instanceof SelfNode) {
      info = this._txb.getInfo(node)?.data as IExternalControl
    } else if (node instanceof FirstNameNode) {
      info = this._txb.getInfo(node)?.data as IExternalControl
    }
    return [info != null, info]
  }

  protected setDottedNameError(
    node: DottedNameNode,
    errKey: ErrorResourceKey,
    ...args: any[]
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(errKey.Key);
    // Contracts.AssertValue(args);

    this._txb.setInfoDottedName(node, new DottedNameInfo(node))
    this._txb.errorContainer.error(node, errKey, args)
    this._txb.setType(node, DType.Error)
  }

  // Returns true if the currentControl is a replicating child of the controlName being passed and the propertyName passed is
  // a nestedAware out property of the parent and currentProperty is not a behaviour property.
  private usesParentsNestedAwareProperty(
    controlInfo: IExternalControl,
    propertyName: DName
  ): boolean {
    // Contracts.AssertValue(controlInfo);
    // Contracts.Assert(propertyName.IsValid);

    let currentControlInfo: IExternalControl
    if (
      this._nameResolver == null ||
      (currentControlInfo = this._nameResolver
        .currentEntity as IExternalControl) == null
    )
      return false

    return (
      currentControlInfo.isReplicable &&
      !currentControlInfo.template.hasProperty(
        this._nameResolver.currentProperty.value,
        PropertyRuleCategory.Behavior
      ) &&
      controlInfo.template.replicatesNestedControls &&
      currentControlInfo.isDescendentOf(controlInfo) &&
      controlInfo.template.nestedAwareTableOutputs.includes(propertyName)
    )
  }

  private postVisitUnaryOpNode(node: UnaryOpNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    switch (node.op) {
      case UnaryOp.Not:
        this.checkType(
          node.child,
          DType.Boolean,
          /* coerced: */ DType.Number,
          DType.String,
          DType.OptionSetValue
        )
        this._txb.setType(node, DType.Boolean)
        break
      case UnaryOp.Minus:
        const childType = this._txb.getType(node.child)
        switch (childType.kind) {
          case DKind.Date:
            // Important to keep the type of minus-date as date, to allow D-D/d-D to be detected
            this._txb.setType(node, DType.Date)
            break
          case DKind.Time:
            // Important to keep the type of minus-time as time, to allow T-T to be detected
            this._txb.setType(node, DType.Time)
            break
          case DKind.DateTime:
            // Important to keep the type of minus-datetime as datetime, to allow d-d/D-d to be detected
            this._txb.setType(node, DType.DateTime)
            break
          default:
            this.checkType(
              node.child,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Number)
            break
        }
        break
      case UnaryOp.Percent:
        this.checkType(
          node.child,
          DType.Number,
          /* coerced: */ DType.String,
          DType.Boolean,
          DType.Date,
          DType.Time,
          DType.DateTimeNoTimeZone,
          DType.DateTime
        )
        this._txb.setType(node, DType.Number)
        break
      default:
        // Contracts.Assert(false);
        this._txb.setType(node, DType.Error)
        break
    }

    this._txb.setSideEffects(node, this._txb.hasSideEffects(node.child))
    this._txb.setStateful(node, this._txb.isStateful(node.child))
    this._txb.setContextual(node, this._txb.isContextual(node.child))
    this._txb.setConstant(node, this._txb.isConstant(node.child))
    this._txb.setSelfContainedConstant(
      node,
      this._txb.isSelfContainedConstant(node.child)
    )
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(node.child))
    this._txb.addVolatileVariables(
      node,
      this._txb.getVolatileVariables(node.child)
    )
    this._txb.setIsUnliftable(node, this._txb.isUnliftable(node.child))
  }

  public postVisit(node: NonLeafNodeType) {
    // console.log('postVisit', NodeKind[node.kind], node.toString())
    switch (node.kind) {
      case NodeKind.BinaryOp:
        this.postVisitBinaryOpNode(node as BinaryOpNode)
        break
      case NodeKind.UnaryOp:
        this.postVisitUnaryOpNode(node as UnaryOpNode)
        break
      case NodeKind.VariadicOp:
        this.postVisitVariadicOpNode(node as VariadicOpNode)
        break
      case NodeKind.Call:
        this.postVisitCallNode(node as CallNode)
        break
      case NodeKind.List:
        this.postVisitListNode(node as ListNode)
        break
      case NodeKind.Record:
        this.postVisitRecordNode(node as RecordNode)
        break
      case NodeKind.Table:
        this.postVisitTableNode(node as TableNode)
        break
      case NodeKind.As:
        this.postVisitAsNode(node as AsNode)
        break
      case NodeKind.DottedName:
        this.postVisitDottedNameNode(node as DottedNameNode)
        break
      case NodeKind.StrInterp:
        this.postVisitStrInterpNode(node as StrInterpNode)
        break
      default:
        break
    }
  }

  // REVIEW ragru: Introduce a TexlOperator abstract base plus various subclasses
  // for handling operators and their overloads. That will offload the burden of dealing with
  // operator special cases to the various operator classes.
  public postVisitBinaryOpNode(node: BinaryOpNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    switch (node.op) {
      case BinaryOp.Add:
        this.postVisitBinaryOpNodeAddition(node)
        break
      case BinaryOp.Power:
      case BinaryOp.Mul:
      case BinaryOp.Div:
        this.checkType(
          node.left,
          DType.Number,
          /* coerced: */ DType.String,
          DType.Boolean,
          DType.Date,
          DType.Time,
          DType.DateTimeNoTimeZone,
          DType.DateTime
        )
        this.checkType(
          node.right,
          DType.Number,
          /* coerced: */ DType.String,
          DType.Boolean,
          DType.Date,
          DType.Time,
          DType.DateTimeNoTimeZone,
          DType.DateTime
        )
        this._txb.setType(node, DType.Number)
        break

      case BinaryOp.Or:
      case BinaryOp.And:
        this.checkType(
          node.left,
          DType.Boolean,
          /* coerced: */ DType.Number,
          DType.String,
          DType.OptionSetValue
        )
        this.checkType(
          node.right,
          DType.Boolean,
          /* coerced: */ DType.Number,
          DType.String,
          DType.OptionSetValue
        )
        this._txb.setType(node, DType.Boolean)
        break

      case BinaryOp.Concat:
        this.checkType(
          node.left,
          DType.String,
          /* coerced: */ DType.Number,
          DType.Date,
          DType.Time,
          DType.DateTimeNoTimeZone,
          DType.DateTime,
          DType.Boolean,
          DType.OptionSetValue,
          DType.ViewValue
        )
        this.checkType(
          node.right,
          DType.String,
          /* coerced: */ DType.Number,
          DType.Date,
          DType.Time,
          DType.DateTimeNoTimeZone,
          DType.DateTime,
          DType.Boolean,
          DType.OptionSetValue,
          DType.ViewValue
        )
        this._txb.setType(node, DType.String)
        break

      case BinaryOp.Error:
        this._txb.setType(node, DType.Error)
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          node,
          TexlStrings.ErrOperatorExpected
        )
        break

      case BinaryOp.Equal:
      case BinaryOp.NotEqual:
        this.checkEqualArgTypes(node.left, node.right)
        this._txb.setType(node, DType.Boolean)
        break

      case BinaryOp.Less:
      case BinaryOp.LessEqual:
      case BinaryOp.Greater:
      case BinaryOp.GreaterEqual:
        // Excel's type coercion for inequality operators is inconsistent / borderline wrong, so we can't
        // use it as a reference. For example, in Excel '2 < TRUE' produces TRUE, but so does '2 < FALSE'.
        // Sticking to a restricted set of numeric-like types for now until evidence arises to support the need for coercion.
        this.checkComparisonArgTypes(node.left, node.right)
        this._txb.setType(node, DType.Boolean)
        break

      case BinaryOp.In:
      case BinaryOp.Exactin:
        this.checkInArgTypes(node.left, node.right)
        this._txb.setType(node, DType.Boolean)
        break

      default:
        // Contracts.Assert(false);
        this._txb.setType(node, DType.Error)
        break
    }

    this._txb.setSideEffects(
      node,
      this._txb.hasSideEffects(node.left) ||
        this._txb.hasSideEffects(node.right)
    )
    this._txb.setStateful(
      node,
      this._txb.isStateful(node.left) || this._txb.isStateful(node.right)
    )
    this._txb.setContextual(
      node,
      this._txb.isContextual(node.left) || this._txb.isContextual(node.right)
    )
    this._txb.setConstant(
      node,
      this._txb.isConstant(node.left) && this._txb.isConstant(node.right)
    )
    this._txb.setSelfContainedConstant(
      node,
      this._txb.isSelfContainedConstant(node.left) &&
        this._txb.isSelfContainedConstant(node.right)
    )
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(node.left, node.right))
    this._txb.addVolatileVariables(
      node,
      this._txb.getVolatileVariables(node.left)
    )
    this._txb.addVolatileVariables(
      node,
      this._txb.getVolatileVariables(node.right)
    )
    this._txb.setIsUnliftable(
      node,
      this._txb.isUnliftable(node.left) || this._txb.isUnliftable(node.right)
    )
  }

  private postVisitBinaryOpNodeAddition(node: BinaryOpNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    // Contracts.Assert(node.Op == BinaryOp.Add);

    let left = this._txb.getType(node.left)
    let right = this._txb.getType(node.right)
    let leftKind = left.kind
    let rightKind = right.kind

    const reportInvalidOperation = () => {
      this._txb.setType(node, DType.Error)
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrBadOperatorTypes,
        left.getKindString(),
        right.getKindString()
      )
    }

    let unary: UnaryOpNode

    switch (leftKind) {
      case DKind.DateTime:
        switch (rightKind) {
          case DKind.DateTime:
          case DKind.Date:
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // DateTime - DateTime = Number
              // DateTime - Date = Number
              this._txb.setType(node, DType.Number)
            } else {
              // DateTime + DateTime in any other arrangement is an error
              // DateTime + Date in any other arrangement is an error
              reportInvalidOperation()
            }
            break
          case DKind.Time:
            // DateTime + Time in any other arrangement is an error
            reportInvalidOperation()
            break
          default:
            // DateTime + number = DateTime
            this.checkType(
              node.right,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.DateTime)
            break
        }
        break
      case DKind.Date:
        switch (rightKind) {
          case DKind.Date:
            // Date + Date = number but ONLY if its really subtraction Date + '-Date'
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // Date - Date = Number
              this._txb.setType(node, DType.Number)
            } else {
              // Date + Date in any other arrangement is an error
              reportInvalidOperation()
            }
            break
          case DKind.Time:
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // Date - Time is an error
              reportInvalidOperation()
            } else {
              // Date + Time = DateTime
              this._txb.setType(node, DType.DateTime)
            }
            break
          case DKind.DateTime:
            // Date + DateTime = number but ONLY if its really subtraction Date + '-DateTime'
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // Date - DateTime = Number
              this._txb.setType(node, DType.Number)
            } else {
              // Date + DateTime in any other arrangement is an error
              reportInvalidOperation()
            }
            break
          default:
            // Date + number = Date
            this.checkType(
              node.right,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Date)
            break
        }
        break
      case DKind.Time:
        switch (rightKind) {
          case DKind.Time:
            // Time + Time = number but ONLY if its really subtraction Time + '-Time'
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // Time - Time = Number
              this._txb.setType(node, DType.Number)
            } else {
              // Time + Time in any other arrangement is an error
              reportInvalidOperation()
            }
            break
          case DKind.Date:
            unary = node.right.asUnaryOpLit()
            if (unary != null && unary.op == UnaryOp.Minus) {
              // Time - Date is an error
              reportInvalidOperation()
            } else {
              // Time + Date = DateTime
              this._txb.setType(node, DType.DateTime)
            }
            break
          case DKind.DateTime:
            // Time + DateTime in any other arrangement is an error
            reportInvalidOperation()
            break
          default:
            // Time + number = Time
            this.checkType(
              node.right,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Time)
            break
        }
        break
      default:
        switch (rightKind) {
          case DKind.DateTime:
            // number + DateTime = DateTime
            this.checkType(
              node.left,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.DateTime)
            break
          case DKind.Date:
            // number + Date = Date
            this.checkType(
              node.left,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Date)
            break
          case DKind.Time:
            // number + Time = Time
            this.checkType(
              node.left,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Time)
            break
          default:
            // Regular Addition
            this.checkType(
              node.left,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this.checkType(
              node.right,
              DType.Number,
              /* coerced: */ DType.String,
              DType.Boolean
            )
            this._txb.setType(node, DType.Number)
            break
        }
        break
    }
  }

  public postVisitAsNode(node: AsNode) {
    // Contracts.AssertValue(node);

    // As must be either the top node, or an immediate child of a call node
    if (
      node.id != this._txb.top.id &&
      (node.parent?.kind != NodeKind.List ||
        node.parent?.parent?.kind != NodeKind.Call)
    ) {
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrAsNotInContext
      )
    } else if (
      node.id == this._txb.top.id &&
      (this._nameResolver == null ||
        !IsIExternalControl(this._nameResolver.currentEntity) ||
        !this._nameResolver.currentEntity.template.replicatesNestedControls ||
        !(
          this._nameResolver.currentEntity.template
            .thisItemInputInvariantName ==
          this._nameResolver.currentProperty.toString()
        ))
    ) {
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrAsNotInContext
      )
    }

    this._txb.setInfoForAs(node, new AsInfo(node, node.right.name))

    const left = node.left
    this._txb.checkAndMarkAsPageable(node)
    this._txb.checkAndMarkAsDelegatable(node)
    this._txb.setType(node, this._txb.getType(left))
    this._txb.setSideEffects(node, this._txb.hasSideEffects(left))
    this._txb.setStateful(node, this._txb.isStateful(left))
    this._txb.setContextual(node, this._txb.isContextual(left))
    this._txb.setConstant(node, this._txb.isConstant(left))
    this._txb.setSelfContainedConstant(
      node,
      this._txb.isSelfContainedConstant(left)
    )
    this._txb.setScopeUseSet(node, this._txb.getScopeUseSet(left))
    this._txb.addVolatileVariables(node, this._txb.getVolatileVariables(left))
    this._txb.setIsUnliftable(node, this._txb.isUnliftable(node.left))
  }

  private checkComparisonArgTypes(left: TexlNode, right: TexlNode) {
    // Excel's type coercion for inequality operators is inconsistent / borderline wrong, so we can't
    // use it as a reference. For example, in Excel '2 < TRUE' produces TRUE, but so does '2 < FALSE'.
    // Sticking to a restricted set of numeric-like types for now until evidence arises to support the need for coercion.
    this.checkComparisonTypeOneOf(
      left,
      DType.Number,
      DType.Date,
      DType.Time,
      DType.DateTime
    )
    this.checkComparisonTypeOneOf(
      right,
      DType.Number,
      DType.Date,
      DType.Time,
      DType.DateTime
    )

    let typeLeft = this._txb.getType(left)
    let typeRight = this._txb.getType(right)

    if (!typeLeft.accepts(typeRight) && !typeRight.accepts(typeLeft)) {
      // Handle DateTime <=> Number comparison by coercing one side to Number
      if (DType.Number.accepts(typeLeft) && DType.DateTime.accepts(typeRight)) {
        this._txb.setCoercedType(right, DType.Number)
        return
      } else if (
        DType.Number.accepts(typeRight) &&
        DType.DateTime.accepts(typeLeft)
      ) {
        this._txb.setCoercedType(left, DType.Number)
        return
      }
    }
  }

  private checkEqualArgTypes(left: TexlNode, right: TexlNode) {
    // Contracts.AssertValue(left);
    // Contracts.AssertValue(right);
    // Contracts.AssertValue(left.Parent);
    // Contracts.Assert(object.ReferenceEquals(left.Parent, right.Parent));

    let typeLeft = this._txb.getType(left)
    let typeRight = this._txb.getType(right)

    // EqualOp is only allowed on primitive types, polymorphic lookups, and control types.
    if (
      !(typeLeft.isPrimitive && typeRight.isPrimitive) &&
      !(typeLeft.isPolymorphic && typeRight.isPolymorphic) &&
      !(typeLeft.isControl && typeRight.isControl) &&
      !(typeLeft.isPolymorphic && typeRight.isRecord) &&
      !(typeLeft.isRecord && typeRight.isPolymorphic)
    ) {
      const leftTypeDisambiguation =
        typeLeft.isOptionSet && typeLeft.optionSetInfo != null
          ? `(${typeLeft.optionSetInfo.entityName})`
          : ''
      const rightTypeDisambiguation =
        typeRight.isOptionSet && typeRight.optionSetInfo != null
          ? `(${typeRight.optionSetInfo.entityName})`
          : ''

      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        left.parent,
        TexlStrings.ErrIncompatibleTypesForEquality_Left_Right,
        typeLeft.getKindString() + leftTypeDisambiguation,
        typeRight.getKindString() + rightTypeDisambiguation
      )
      return
    }

    // Special case for guid, it should produce an error on being compared to non-guid types
    if (
      (typeLeft.equals(DType.Guid) && !typeRight.equals(DType.Guid)) ||
      (typeRight.equals(DType.Guid) && !typeLeft.equals(DType.Guid))
    ) {
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        left.parent,
        TexlStrings.ErrGuidStrictComparison
      )
      return
    }

    // Special case for option set values, it should produce an error when the base option sets are different
    if (typeLeft.kind == DKind.OptionSetValue && !typeLeft.accepts(typeRight)) {
      let leftTypeDisambiguation =
        typeLeft.isOptionSet && typeLeft.optionSetInfo != null
          ? `(${typeLeft.optionSetInfo.entityName})`
          : ''
      let rightTypeDisambiguation =
        typeRight.isOptionSet && typeRight.optionSetInfo != null
          ? `(${typeRight.optionSetInfo.entityName})`
          : ''

      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        left.parent,
        TexlStrings.ErrIncompatibleTypesForEquality_Left_Right,
        typeLeft.getKindString() + leftTypeDisambiguation,
        typeRight.getKindString() + rightTypeDisambiguation
      )

      return
    }

    // Special case for view values, it should produce an error when the base views are different
    if (typeLeft.kind == DKind.ViewValue && !typeLeft.accepts(typeRight)) {
      let leftTypeDisambiguation =
        typeLeft.isView && typeLeft.viewInfo != null
          ? `(${typeLeft.viewInfo.name})`
          : ''
      let rightTypeDisambiguation =
        typeRight.isView && typeRight.viewInfo != null
          ? `(${typeRight.viewInfo.name})`
          : ''

      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Severe,
        left.parent,
        TexlStrings.ErrIncompatibleTypesForEquality_Left_Right,
        typeLeft.getKindString() + leftTypeDisambiguation,
        typeRight.getKindString() + rightTypeDisambiguation
      )

      return
    }

    if (!typeLeft.accepts(typeRight) && !typeRight.accepts(typeLeft)) {
      // Handle DateTime <=> Number comparison
      if (DType.Number.accepts(typeLeft) && DType.DateTime.accepts(typeRight)) {
        this._txb.setCoercedType(right, DType.Number)
        return
      } else if (
        DType.Number.accepts(typeRight) &&
        DType.DateTime.accepts(typeLeft)
      ) {
        this._txb.setCoercedType(left, DType.Number)
        return
      }

      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Warning,
        left.parent,
        TexlStrings.ErrIncompatibleTypesForEquality_Left_Right,
        typeLeft.getKindString(),
        typeRight.getKindString()
      )
    }
  }

  private setVariadicNodePurity(node: VariadicBase) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _txb.IdLim);
    // Contracts.AssertValue(node.Children);

    // Check for side-effects and statefulness of operation
    let hasSideEffects = false
    let isStateful = false
    let isContextual = false
    let isConstant = true
    let isSelfContainedConstant = true
    let isBlockScopedConstant = true
    let isUnliftable = false

    for (const child of node.children) {
      hasSideEffects ||= this._txb.hasSideEffects(child)
      isStateful ||= this._txb.isStateful(child)
      isContextual ||= this._txb.isContextual(child)
      isConstant &&= this._txb.isConstant(child)
      isSelfContainedConstant &&= this._txb.isSelfContainedConstant(child)
      isBlockScopedConstant &&=
        this._txb.isBlockScopedConstant(child) || this._txb.isPure(child)
      isUnliftable ||= this._txb.isUnliftable(child)
    }

    // If any child is unliftable then the full expression is unliftable
    this._txb.setIsUnliftable(node, isUnliftable)

    this._txb.setSideEffects(node, hasSideEffects)
    this._txb.setStateful(node, isStateful)
    this._txb.setContextual(node, isContextual)
    this._txb.setConstant(node, isConstant)
    this._txb.setSelfContainedConstant(node, isSelfContainedConstant)

    if (isBlockScopedConstant) {
      this._txb.setBlockScopedConstantNode(node)
    }
  }

  public postVisitVariadicOpNode(node: VariadicOpNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    switch (node.op) {
      case VariadicOp.Chain:
        this._txb.setType(
          node,
          this._txb.getType(node.children[node.children.length - 1])
        )
        break

      default:
        // Contracts.Assert(false);
        this._txb.setType(node, DType.Error)
        break
    }

    // Determine constancy.
    let isConstant = true
    let isSelfContainedConstant = true

    for (const child of node.children) {
      isConstant &&= this._txb.isConstant(child)
      isSelfContainedConstant &&= this._txb.isSelfContainedConstant(child)
      if (!isConstant && !isSelfContainedConstant) break
    }

    this._txb.setConstant(node, isConstant)
    this._txb.setSelfContainedConstant(node, isSelfContainedConstant)

    this.setVariadicNodePurity(node)
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(...node.children))
  }

  private static IsValidAccessToScopedProperty(
    lhsControl: IExternalControl,
    rhsProperty: IExternalControlProperty,
    currentControl: IExternalControl,
    currentProperty: IExternalControlProperty,
    isBehaviorOnly = false
  ): boolean {
    // Contracts.AssertValue(lhsControl);
    // Contracts.AssertValue(rhsProperty);
    // Contracts.AssertValue(currentControl);
    // Contracts.AssertValue(currentProperty);

    if (
      lhsControl.isComponentControl &&
      lhsControl.template.componentType == ComponentType.CanvasComponent &&
      (currentControl.isComponentControl ||
        (IsIExternalControl(currentControl.topParentOrSelf) &&
          currentControl.topParentOrSelf.isComponentControl == false))
    ) {
      // Behavior property is blocked from outside the component.
      if (isBehaviorOnly) return false

      // If current property is output property of the component then access is allowed.
      // Or if the rhs property is out put property then it's allowed which could only be possible if the current control is component definition.
      return (
        currentProperty.isImmutableOnInstance ||
        rhsProperty.isImmutableOnInstance
      )
    }

    return true
  }

  private isValidScopedPropertyFunction(
    node: CallNode,
    info: CallInfo
  ): boolean {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _txb.IdLim);
    // Contracts.AssertValue(info);
    // Contracts.AssertValue(_txb.Control);

    let currentControl = this._txb.control
    let currentProperty = this._txb.property
    if (
      currentControl.isComponentControl &&
      currentControl.template.componentType != ComponentType.CanvasComponent
    ) {
      return true
    }

    let infoTexlFunction = info.function
    if (this._txb.glue.isComponentScopedPropertyFunction(infoTexlFunction)) {
      // Component custom behavior properties can only be accessed by controls within a component.
      const rst1 = this._txb.document.tryGetControlByUniqueId(
        infoTexlFunction.namespace.name.value
      )
      const lhsControl = rst1[1]
      const rst2 = lhsControl.template.tryGetProperty(infoTexlFunction.name)
      const rhsProperty = rst2[1]
      if (rst1[0] && rst2[0]) {
        return Visitor.IsValidAccessToScopedProperty(
          lhsControl,
          rhsProperty,
          currentControl,
          currentProperty,
          infoTexlFunction.isBehaviorOnly
        )
      }
    }

    return true
  }

  private setCallNodePurity(node: CallNode, info: CallInfo) {
    // Contracts.AssertValue(node);
    // Contracts.AssertIndex(node.Id, _txb.IdLim);
    // Contracts.AssertValue(node.Args);

    let hasSideEffects = this._txb.hasSideEffects(node.args)
    let isStateFul = this._txb.isStateful(node.args)

    if (info?.function != null) {
      let infoTexlFunction = info.function

      if (this._txb.glue.isComponentScopedPropertyFunction(infoTexlFunction)) {
        // We only have to check the property's rule and the calling arguments for purity as scoped variables
        // (default values) are by definition data rules and therefore always pure.
        const rst1 = this._txb.document.tryGetControlByUniqueId(
          infoTexlFunction.namespace.name.value
        )
        const ctrl = rst1[1]
        if (rst1[0]) {
          const rst2 = ctrl.tryGetRule(new DName(infoTexlFunction.name))
          const rule = rst2[1]
          hasSideEffects ||= rule.binding.hasSideEffects(rule.binding.top)
          isStateFul ||= rule.binding.isStateful(rule.binding.top)
        }
        // if (this._txb.document.tryGetControlByUniqueId(infoTexlFunction.namespace.name.value, out let ctrl) &&
        //     ctrl.TryGetRule(new DName(infoTexlFunction.Name), out IExternalRule rule))
        // {
        //     hasSideEffects |= rule.Binding.HasSideEffects(rule.Binding.Top);
        //     isStateFul |= rule.Binding.IsStateful(rule.Binding.Top);
        // }
      } else {
        hasSideEffects ||= !infoTexlFunction.isSelfContained
        isStateFul ||= !infoTexlFunction.isStateless
      }
    }

    this._txb.setSideEffects(node, hasSideEffects)
    this._txb.setStateful(node, isStateFul)
    this._txb.setContextual(node, this._txb.isContextual(node.args)) // The head of a function cannot be contextual at the moment

    // Nonempty variable weight containing variable "x" implies this node or a node that is to be
    // evaluated before this node is non pure and modifies "x"
    this._txb.addVolatileVariables(
      node,
      this._txb.getVolatileVariables(node.args)
    )

    // True if this node or one of its children contains any element of this node's variable weight
    this._txb.setIsUnliftable(node, this._txb.isUnliftable(node.args))
  }

  private getCallNodeScopeUseSet(node: CallNode, info: CallInfo): ScopeUseSet {
    // Contracts.AssertValue(node);

    // If there are lambda params, find their scopes
    if (info?.function == null) {
      return ScopeUseSet.GlobalsOnly
    } else if (!info.function.hasLambdas) {
      return this.joinScopeUseSets(node.args)
    } else {
      const args = node.args.children
      let set = ScopeUseSet.GlobalsOnly

      for (let i = 0; i < args.length; i++) {
        let argScopeUseSet = this._txb.getScopeUseSet(args[i])

        // Translate the set to the parent (invocation) scope, to indicate that we are moving outside the lambda.
        if (i <= info.function.maxArity && info.function.isLambdaParam(i))
          argScopeUseSet = argScopeUseSet.translateToParentScope()

        set = set.union(argScopeUseSet)
      }

      return set
    }
  }

  private tryGetFunctionNameLookupInfo(
    node: CallNode,
    functionNamespace: DPath
  ): [boolean, NameLookupInfo] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValid(functionNamespace);

    let lookupInfo: NameLookupInfo = NameLookupInfo.Default()
    if (!(node.headNode instanceof DottedNameNode)) {
      return [false, lookupInfo]
    }
    const dottedNameNode = node.headNode
    if (
      !(dottedNameNode.left instanceof FirstNameNode) &&
      !(dottedNameNode.left instanceof ParentNode) &&
      !(dottedNameNode.left instanceof SelfNode)
    ) {
      return [false, lookupInfo]
    }

    const rst = this._nameResolver.lookupGlobalEntity(functionNamespace.name)
    lookupInfo = rst[1]
    if (
      !rst[0] ||
      lookupInfo.data == null ||
      !IsIExternalControl(lookupInfo.data)
    ) {
      return [false, lookupInfo]
    }

    return [true, lookupInfo]
  }

  public preVisitBinaryOpNode(node: BinaryOpNode): boolean {
    // Contracts.AssertValue(node);

    const volatileVariables = this._txb.getVolatileVariables(node)
    this._txb.addVolatileVariables(node.left, volatileVariables)
    this._txb.addVolatileVariables(node.right, volatileVariables)

    return true
  }

  public preVisitUnaryOpNode(node: UnaryOpNode): boolean {
    // Contracts.AssertValue(node);

    const volatileVariables = this._txb.getVolatileVariables(node)
    this._txb.addVolatileVariables(node.child, volatileVariables)

    return true
  }

  /// <summary>
  /// Accepts each child, records which identifiers are affected by each child and sets the binding
  /// appropriately.
  /// </summary>
  /// <param name="node"></param>
  /// <returns></returns>
  public preVisitVariadicOpNode(node: VariadicOpNode): boolean {
    let runningWeight = this._txb.getVolatileVariables(node)
    let isUnliftable = false

    for (const child of node.children) {
      this._txb.addVolatileVariables(child, runningWeight)
      child.accept(this)
      runningWeight = new Set([
        ...runningWeight,
        ...this._txb.getVolatileVariables(child),
      ])
      isUnliftable ||= this._txb.isUnliftable(child)
    }

    this._txb.addVolatileVariables(node, runningWeight)
    this._txb.setIsUnliftable(node, isUnliftable)

    this.postVisit(node)
    return false
  }

  private preVisitHeadNode(node: CallNode) {
    // Contracts.AssertValue(node);

    // We want to set the correct error type. This is important for component instance rule replacement logic.
    if (this._nameResolver == null && node.headNode instanceof DottedNameNode) {
      node.headNode.accept(this)
    }
  }

  private static ArityError(
    minArity: number,
    maxArity: number,
    node: TexlNode,
    actual: number,
    errors: IErrorContainer
  ) {
    if (maxArity == Number.MIN_SAFE_INTEGER)
      errors.error(node, TexlStrings.ErrBadArityMinimum, actual, minArity)
    else if (minArity != maxArity)
      errors.error(
        node,
        TexlStrings.ErrBadArityRange,
        actual,
        minArity,
        maxArity
      )
    else errors.error(node, TexlStrings.ErrBadArity, actual, minArity)
  }

  public preVisitCallNode(node: CallNode): boolean {
    this.assertValid()
    // Contracts.AssertValue(node);

    let funcNamespace = this._txb.getFunctionNamespace(node, this)

    let overloads: TexlFunction[] = this.lookupFunctions(
      funcNamespace,
      node.head.name.value
    )
    if (overloads.length === 0) {
      this._txb.errorContainer.error(node, TexlStrings.ErrUnknownFunction)
      this._txb.setInfoForCall(node, new CallInfo(node))
      this._txb.setType(node, DType.Error)
      this.preVisitHeadNode(node)
      this.preVisitBottomUp(node, 0)
      this.finalizeCall(node)
      return false
    }

    let overloadsWithMetadataTypeSupportedArgs = overloads.filter(
      (func) => func.supportsMetadataTypeArg && !func.hasLambdas
    )
    if (overloadsWithMetadataTypeSupportedArgs.length > 0) {
      // Overloads are not supported for such functions yet.
      // Contracts.Assert(overloadsWithMetadataTypeSupportedArgs.Count() == 1);

      this.preVisitMetadataArg(node, overloadsWithMetadataTypeSupportedArgs[0])
      this.finalizeCall(node)
      return false
    }

    // If there are no overloads with lambdas, we can continue the visitation and
    // yield to the normal overload resolution.
    let overloadsWithLambdas = overloads.filter((func) => func.hasLambdas)
    if (overloadsWithLambdas.length === 0) {
      // We may still need a scope to determine inline-record types
      let maybeScope: Scope = null
      let startArg = 0

      // Construct a scope if display names are enabled and this function requires a data source scope for inline records
      if (
        this._txb.document != null &&
        this._txb.document.properties?.enabledFeatures
          ?.isUseDisplayNameMetadataEnabled &&
        overloads.filter((func) => func.requiresDataSourceScope).length > 0 &&
        node.args.count > 0
      ) {
        // Visit the first arg if it exists. This will give us the scope type for any subsequent lambda/predicate args.
        const nodeInp: TexlNode = node.args.children[0]
        nodeInp.accept(this)

        if (nodeInp.kind == NodeKind.As) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            node,
            TexlStrings.ErrAsNotInContext
          )
        }

        // Only if there is a projection map associated with this will we need to set a scope
        let typescope = this._txb.getType(nodeInp)

        if (typescope.associatedDataSources.size > 0 && typescope.isTable) {
          maybeScope = new Scope(
            node,
            this._currentScope,
            typescope.toRecord(),
            undefined,
            undefined,
            undefined,
            false
          )
        }

        startArg++
      }

      this.preVisitHeadNode(node)
      this.preVisitBottomUp(node, startArg, maybeScope)
      this.finalizeCall(node)
      return false
    }

    // We support a single overload with lambdas. Otherwise we have a conceptual chicken-and-egg
    // problem, whereby in order to bind the lambda args we need the precise overload (for
    // its lambda mask), which in turn requires binding the args (for their types).
    // Contracts.Assert(overloadsWithLambdas.Count() == 1, "Incorrect multiple overloads with lambdas.");
    let maybeFunc =
      overloadsWithLambdas.length === 1 ? overloadsWithLambdas[0] : undefined
    // Contracts.Assert(maybeFunc.HasLambdas);

    let scopeInfo = maybeFunc.scopeInfo
    let metadata: IDelegationMetadata = null
    let numOverloads = overloads.length

    let scopeNew: Scope = null
    let expandInfo: IExpandInfo

    // Check for matching arities.
    let carg = node.args.count
    if (carg < maybeFunc.minArity || carg > maybeFunc.maxArity) {
      let argCountVisited = 0
      if (numOverloads == 1) {
        let scope = DType.Invalid
        let required = false
        let scopeIdentifier: DName = DName.Default() /* default */
        if (scopeInfo.scopeType != null) {
          scopeNew = new Scope(
            node,
            this._currentScope,
            scopeInfo.scopeType,
            undefined,
            undefined,
            undefined,
            undefined,
            maybeFunc.skipScopeForInlineRecords
          )
        } else if (carg > 0) {
          // Visit the first arg. This will give us the scope type for any subsequent lambda/predicate args.
          let nodeInp = node.args.children[0]
          nodeInp.accept(this)

          // Determine the Scope Identifier using the 1st arg
          const scopeIdentRst = this._txb.getScopeIdent(nodeInp)
          required = scopeIdentRst[0]
          scopeIdentifier = scopeIdentRst[1]
          // required = this._txb.getScopeIdent(nodeInp, out scopeIdentifier);

          const checkResult = scopeInfo.checkInput(
            nodeInp,
            this._txb.getType(nodeInp)
          )
          scope = checkResult[1]

          if (checkResult[0]) {
            const entityInfoResult = this._txb.tryGetEntityInfo(nodeInp)
            expandInfo = entityInfoResult[1]
            if (entityInfoResult[0]) {
              scopeNew = new Scope(
                node,
                this._currentScope,
                scope,
                scopeIdentifier,
                required,
                expandInfo,
                undefined,
                maybeFunc.skipScopeForInlineRecords
              )
            } else {
              metadata = maybeFunc.tryGetDelegationMetadata(node, this._txb)[1]
              scopeNew = new Scope(
                node,
                this._currentScope,
                scope,
                scopeIdentifier,
                required,
                metadata,
                undefined,
                maybeFunc.skipScopeForInlineRecords
              )
            }
          }

          argCountVisited = 1
        }

        // If there is only one function with this name and its arity doesn't match,
        // that means the invocation is erroneous.
        Visitor.ArityError(
          maybeFunc.minArity,
          maybeFunc.maxArity,
          node,
          carg,
          this._txb.errorContainer
        )
        this._txb.setInfoForCall(
          node,
          new CallInfo(
            node,
            maybeFunc,
            undefined,
            scope,
            scopeIdentifier,
            required,
            this._currentScope.nest
          )
        )
        this._txb.setType(node, maybeFunc.returnType)
      }

      // Either way continue the visitation. If we do have overloads,
      // a different overload with no lambdas may match (including the arity).
      this.preVisitBottomUp(node, argCountVisited, scopeNew)
      this.finalizeCall(node)

      return false
    }

    // All functions with lambdas have at least one arg.
    // Contracts.Assert(carg > 0);

    // The zeroth arg should not be a lambda. Instead it defines the context type for the lambdas.
    // Contracts.Assert(!maybeFunc.IsLambdaParam(0));

    let args: TexlNode[] = node.args.children
    let argTypes: DType[] = []

    // We need to know which variables are volatile in case the first argument is or contains a
    // reference to a volatile variable and we need to control its liftability
    let volatileVariables = this._txb.getVolatileVariables(node)

    // Visit the first arg. This will give us the scope type for the subsequent lambda args.
    let nodeInput = args[0]
    this._txb.addVolatileVariables(nodeInput, volatileVariables)
    nodeInput.accept(this)

    let dsNodes: Array<FirstNameNode>
    let dsNode: FirstNameNode

    const dataSourceNodesResult = maybeFunc.tryGetDataSourceNodes(
      node,
      this._txb
    )
    dsNodes = dataSourceNodesResult[1]
    if (dataSourceNodesResult[0] && (dsNode = dsNodes[0]) != null) {
      this._currentScopeDsNodeId = dsNode.id
    }
    // if (maybeFunc.TryGetDataSourceNodes(node, _txb, out dsNodes) && ((dsNode = dsNodes.FirstOrDefault()) != default(FirstNameNode))) {
    //   _currentScopeDsNodeId = dsNode.Id;
    // }

    let typeInput = (argTypes[0] = this._txb.getType(nodeInput))

    // Get the cursor type for this arg. Note we're not adding document errors at this point.
    let typeScope: DType
    let scopeIdent: DName = DName.Default()
    let identRequired = false
    let fArgsValid = true
    if (scopeInfo.scopeType != null) {
      typeScope = scopeInfo.scopeType

      // For functions with a Scope Type, there is no ScopeIdent needed
    } else {
      const checkInputResult = scopeInfo.checkInput(nodeInput, typeInput)
      typeScope = checkInputResult[1]
      fArgsValid = checkInputResult[0]

      // Determine the scope identifier using the first node for lambda params
      const scopeIdentResult = this._txb.getScopeIdent(nodeInput)
      scopeIdent = scopeIdentResult[1]
      identRequired = scopeIdentResult[0]
    }

    if (!fArgsValid) {
      if (numOverloads == 1) {
        // If there is a single function with this name, and the first arg is not
        // a good match, then we have an erroneous invocation.
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          nodeInput,
          TexlStrings.ErrBadType
        )
        this._txb.errorContainer.error(
          node,
          TexlStrings.ErrInvalidArgs_Func,
          maybeFunc.name
        )
        this._txb.setInfoForCall(
          node,
          new CallInfo(
            node,
            maybeFunc,
            undefined,
            typeScope,
            scopeIdent,
            identRequired,
            this._currentScope.nest
          )
        )
        this._txb.setType(node, maybeFunc.returnType)
      }

      // Yield to the normal overload resolution either way. We already visited and
      // bound the first argument, hence the 1'.
      this.preVisitBottomUp(node, 1)
      this.finalizeCall(node)

      return false
    }

    // At this point we know we have an invocation of our function with lambdas (as opposed
    // to an invocation of a different overload). Pin that, and make a best effort to match
    // the rest of the args. Binding failures along the way become proper document errors.

    // We don't want to check and mark this function as async for now as IsAsyncInvocation function calls into IsServerDelegatable which
    // requires more contexts about the args which is only available after we visit all the children. So delay this after visiting
    // children.

    this._txb.setInfoForCall(
      node,
      new CallInfo(
        node,
        maybeFunc,
        undefined,
        typeScope,
        scopeIdent,
        identRequired,
        this._currentScope.nest
      ),
      false
    )

    const entityInfoResult = this._txb.tryGetEntityInfo(nodeInput)
    expandInfo = entityInfoResult[1]
    if (entityInfoResult[0]) {
      scopeNew = new Scope(
        node,
        this._currentScope,
        typeScope,
        scopeIdent,
        identRequired,
        expandInfo,
        undefined,
        maybeFunc.skipScopeForInlineRecords
      )
    } else {
      metadata = maybeFunc.tryGetDelegationMetadata(node, this._txb)[1]
      scopeNew = new Scope(
        node,
        this._currentScope,
        typeScope,
        scopeIdent,
        identRequired,
        metadata,
        undefined,
        maybeFunc.skipScopeForInlineRecords
      )
    }

    // Process the rest of the args.
    for (let i = 1; i < carg; i++) {
      // Contracts.Assert(_currentScope == scopeNew || _currentScope == scopeNew.Parent);

      if (maybeFunc.allowsRowScopedParamDelegationExempted(i)) {
        this._txb.setSupportingRowScopedDelegationExemptionNode(args[i])
      }

      if (maybeFunc.isEcsExcemptedLambda(i)) {
        this._txb.setEcsExcemptLambdaNode(args[i])
      }

      if (volatileVariables != null) {
        this._txb.addVolatileVariables(args[i], volatileVariables)
      }

      // Use the new scope only for lambda args.
      this._currentScope =
        maybeFunc.isLambdaParam(i) && scopeInfo.appliesToArgument(i)
          ? scopeNew
          : scopeNew.parent
      args[i].accept(this)

      this._txb.addVolatileVariables(
        node,
        this._txb.getVolatileVariables(args[i])
      )

      argTypes[i] = this._txb.getType(args[i])
      // Contracts.Assert(argTypes[i].IsValid);

      // Async lambdas are not (yet) supported for this function. Flag these with errors.
      if (this._txb.isAsync(args[i]) && !scopeInfo.supportsAsyncLambdas) {
        fArgsValid = false
        this._txb.errorContainer.errorWithSeverity(
          DocumentErrorSeverity.Severe,
          node,
          TexlStrings.ErrAsyncLambda
        )
      }

      // Accept should leave the scope as it found it.
      // Contracts.Assert(_currentScope == ((maybeFunc.IsLambdaParam(i) && scopeInfo.AppliesToArgument(i)) ? scopeNew : scopeNew.Parent));
    }

    // Now check and mark the path as async.
    if (maybeFunc.isAsyncInvocation(node, this._txb)) {
      this._txb.flagPathAsAsync(node)
    }

    this._currentScope = scopeNew.parent
    this.postVisit(node.args)

    // Typecheck the invocation.
    let returnType: DType
    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType> = null

    // Typecheck the invocation and infer the return type.
    const checkInvocationResult = maybeFunc.checkInvocation(
      args,
      argTypes,
      this._txb.errorContainer,
      this._txb
    )
    returnType = checkInvocationResult[1].returnType
    nodeToCoercedTypeMap = checkInvocationResult[1].nodeToCoercedTypeMap

    fArgsValid &&= checkInvocationResult[0]

    // This is done because later on, if a CallNode has a return type of Error, you can assert HasErrors on it.
    // This was not done for UnaryOpNodes, BinaryOpNodes, CompareNodes.
    // This doesn't need to be done on the other nodes (but can) because their return type doesn't depend
    // on their argument types.
    if (!fArgsValid)
      this._txb.errorContainer.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrInvalidArgs_Func,
        maybeFunc.name
      )

    // Set the inferred return type for the node.
    this._txb.setType(node, returnType)

    if (fArgsValid && nodeToCoercedTypeMap != null) {
      for (const nodeToCoercedTypeKvp of nodeToCoercedTypeMap) {
        this._txb.setCoercedType(
          nodeToCoercedTypeKvp[0],
          nodeToCoercedTypeKvp[1]
        )
      }
    }

    this.finalizeCall(node)

    // We fully processed the call, so don't visit children or call PostVisit.
    return false
  }

  private finalizeCall(node: CallNode) {
    // Contracts.AssertValue(node);

    let callInfo: CallInfo = this._txb.getInfo(node)

    // Set the node purity and context
    this.setCallNodePurity(node, callInfo)
    this._txb.setScopeUseSet(node, this.getCallNodeScopeUseSet(node, callInfo))

    let func = callInfo?.function
    if (func == null) return

    // Invalid datasources always result in error
    if (func.isBehaviorOnly && !this._txb.isBehavior) {
      this._txb.errorContainer.ensureError(
        node,
        TexlStrings.ErrBehaviorPropertyExpected
      )
    }
    // Test-only functions can only be used within test cases.
    else if (
      func.isTestOnly &&
      this._txb.property != null &&
      !this._txb.property.isTestCaseProperty
    ) {
      this._txb.errorContainer.ensureError(
        node,
        TexlStrings.ErrTestPropertyExpected
      )
    }
    // Auto-refreshable functions cannot be used in behavior rules.
    else if (func.isAutoRefreshable && this._txb.isBehavior) {
      this._txb.errorContainer.ensureError(
        node,
        TexlStrings.ErrAutoRefreshNotAllowed
      )
    }
    // Give warning if returning dynamic metadata without a known dynamic type
    else if (
      func.isDynamic &&
      this._nameResolver.document.properties.enabledFeatures
        .isDynamicSchemaEnabled
    ) {
      if (!func.checkForDynamicReturnType(this._txb, node.args.children)) {
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Warning,
          node,
          TexlStrings.WarnDynamicMetadata
        )
      }
    } else if (
      this._txb.control != null &&
      this._txb.property != null &&
      !this.isValidScopedPropertyFunction(node, callInfo)
    ) {
      const errorMessage = callInfo.function.isBehaviorOnly
        ? TexlStrings.ErrUnSupportedComponentBehaviorInvocation
        : TexlStrings.ErrUnSupportedComponentDataPropertyAccess
      this._txb.errorContainer.ensureErrorWithSeverity(
        DocumentErrorSeverity.Critical,
        node,
        errorMessage
      )
    }
    // Apply custom function validation last
    else if (!func.postVisitValidation(this._txb, node)) {
      // Check to see if we are a side-effectful function operating on on invalid datasource.
      const result = this.isIncorrectlySideEffectful(node)
      const { errorKey, badAncestor } = result[1]
      if (result[0]) {
        this._txb.errorContainer.ensureError(
          node,
          errorKey,
          badAncestor.head.name
        )
      }
    }

    this._txb.checkAndMarkAsDelegatable(node)
    this._txb.checkAndMarkAsPageable(node, func)

    // A function will produce a constant output (and have no side-effects, which is important for
    // caching/precomputing the result) iff the function is pure and its arguments are constant.
    this._txb.setConstant(node, func.isPure && this._txb.isConstant(node.args))
    this._txb.setSelfContainedConstant(
      node,
      func.isPure && this._txb.isSelfContainedConstant(node.args)
    )

    // Mark node as blockscoped constant if the function's return value only depends on the global variable
    // This node will skip delegation check, be codegened as constant and be simply passed into the delegation query.
    // e.g. Today() in formula Filter(CDS, CreatedDate < Today())
    if (
      func.isGlobalReliant ||
      (func.isPure && this._txb.isBlockScopedConstant(node.args))
    ) {
      this._txb.setBlockScopedConstantNode(node)
    }

    // Update field projection info
    if (this._txb.queryOptions != null) {
      func.updateDataQuerySelects(node, this._txb, this._txb.queryOptions)
    }
  }

  private isIncorrectlySideEffectful(
    node: CallNode
  ): [boolean, { errorKey: ErrorResourceKey; badAncestor: CallNode }] {
    // Contracts.AssertValue(node);

    let badAncestor = null
    let errorKey = new ErrorResourceKey()

    let call = this._txb.getInfo(node) as CallInfo
    let func: TexlFunction = call.function
    if (func == null || func.isSelfContained) {
      return [false, { errorKey, badAncestor }]
    }

    let ds: IExternalDataSource
    const result = func.tryGetDataSource(node, this._txb)
    ds = result[1]
    if (!result[0]) {
      ds = null
    }

    let ancestorScope: Scope = this._currentScope
    while (ancestorScope != null) {
      if (ancestorScope.call != null) {
        let ancestorCall: CallInfo = this._txb.getInfo(ancestorScope.call)

        // For record-scoped rules, if we are processing a nested call node, it's possible the node info may not be set yet
        // In that case, verify that the node has overloads that support record scoping.
        if (
          ancestorCall == null &&
          this.lookupFunctions(
            ancestorScope.call.head.namespace,
            ancestorScope.call.head.name.value
          ).some((overload) => overload.requiresDataSourceScope)
        ) {
          ancestorScope = ancestorScope.parent
          continue
        }

        let ancestorFunc = ancestorCall.function
        let ancestorScopeInfo = ancestorCall.function?.scopeInfo

        // Check for bad scope modification
        if (
          ancestorFunc != null &&
          ancestorScopeInfo != null &&
          ds != null &&
          ancestorScopeInfo.iteratesOverScope
        ) {
          let ancestorDs: IExternalDataSource
          const dataSourceResult = ancestorFunc.tryGetDataSource(
            ancestorScope.call,
            this._txb
          )
          ancestorDs = dataSourceResult[1]
          if (dataSourceResult[0] && ancestorDs == ds) {
            errorKey = TexlStrings.ErrScopeModificationLambda
            badAncestor = ancestorScope.call
            return [true, { errorKey, badAncestor }]
          }
        }

        // Check for completely blocked functions.
        if (
          ancestorFunc != null &&
          ancestorScopeInfo != null &&
          ancestorScopeInfo.hasNondeterministicOperationOrder &&
          !func.allowedWithinNondeterministicOperationOrder
        ) {
          errorKey =
            TexlStrings.ErrFunctionDisallowedWithinNondeterministicOperationOrder
          badAncestor = ancestorScope.call
          return [true, { errorKey, badAncestor }]
        }
      }

      // Pop up to the next scope.
      ancestorScope = ancestorScope.parent
    }

    return [false, { errorKey, badAncestor }]
  }

  public postVisitCallNode(node: CallNode) {
    // Contracts.Assert(false, "Should never get here");
  }

  private tryGetAffectScopeVariableFunc(
    node: CallNode
  ): [boolean, TexlFunction] {
    // Contracts.AssertValue(node);

    let funcNamespace = this._txb.getFunctionNamespace(node, this)
    let overloads = this.lookupFunctions(
      funcNamespace,
      node.head.name.value
    ).filter((fnc) => fnc.affectsScopeVariable)

    // Contracts.Assert(overloads.Length == 1 || overloads.Length == 0, "Lookup Affect scopeVariable Function by CallNode should be 0 or 1");

    const func = overloads.length == 1 ? overloads[0] : null
    return [func != null, func]
  }

  private preVisitMetadataArg(node: CallNode, func: TexlFunction) {
    this.assertValid()
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(func);
    // Contracts.Assert(func.SupportsMetadataTypeArg);
    // Contracts.Assert(!func.HasLambdas);
    let args = node.args.children
    let argCount = args.length

    let returnType = func.returnType
    for (let i = 0; i < argCount; i++) {
      if (func.isMetadataTypeArg(i))
        args[i].accept(this._txb.binderNodeMetadataArgTypeVisitor)
      else args[i].accept(this)

      if (args[i].kind == NodeKind.As)
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          node,
          TexlStrings.ErrAsNotInContext
        )
    }

    this.postVisit(node.args)

    let info = this._txb.getInfo(node)
    // If PreVisit resulted in errors for the node (and a non-null CallInfo),
    // we're done -- we have a match and appropriate errors logged already.
    if (this._txb.errorContainer.hasErrors(node)) {
      // Contracts.Assert(info != null);

      return
    }

    // Contracts.AssertNull(info);

    this._txb.setInfoForCall(node, new CallInfo(node, func))
    if (argCount < func.minArity || argCount > func.maxArity) {
      Visitor.ArityError(
        func.minArity,
        func.maxArity,
        node,
        argCount,
        this._txb.errorContainer
      )
      this._txb.setType(node, returnType)
      return
    }

    let argTypes: DType[] = args.map((arg) => this._txb.getType(arg))
    let fArgsValid: boolean

    // Typecheck the invocation and infer the return type.
    const checkResult = func.checkInvocation(
      args,
      argTypes,
      this._txb.errorContainer,
      this._txb
    )
    returnType = checkResult[1].returnType
    fArgsValid = checkResult[0]
    // fArgsValid = func.checkInvocation(this._txb, args, argTypes, this._txb.errorContainer, out returnType, out _);
    if (!fArgsValid)
      this._txb.errorContainer.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrInvalidArgs_Func,
        func.name
      )

    this._txb.setType(node, returnType)
  }

  private preVisitBottomUp(
    node: CallNode,
    argCountVisited: number,
    scopeNew?: Scope
  ) {
    this.assertValid()
    // Contracts.AssertValue(node);
    // Contracts.AssertIndexInclusive(argCountVisited, node.Args.Count);
    // Contracts.AssertValueOrNull(scopeNew);

    let args = node.args.children
    let argCount = args.length

    let info = this._txb.getInfo(node) as CallInfo
    // Contracts.AssertValueOrNull(info);
    // Contracts.Assert(info == null || _txb.ErrorContainer.HasErrors(node));

    // Attempt to get the overloads, so we can determine the scope to use for datasource name matching
    // We're only interested in the overloads without lambdas, since those were
    // already processed in PreVisit.
    let funcNamespace = this._txb.getFunctionNamespace(node, this)
    let overloads = this.lookupFunctions(
      funcNamespace,
      node.head.name.value
    ).filter((fnc) => !fnc.hasLambdas)

    let funcWithScope: TexlFunction = null
    if (info != null && info.function != null && scopeNew != null) {
      funcWithScope = info.function
    }

    // Contracts.Assert(scopeNew == null || funcWithScope != null || overloads.Any(fnc => fnc.RequiresDataSourceScope));
    const varFuncResult = this.tryGetAffectScopeVariableFunc(node)
    let affectScopeVariablefunc = varFuncResult[1]
    let affectScopeVariable = varFuncResult[0]
    // bool affectScopeVariable = TryGetAffectScopeVariableFunc(node, out let affectScopeVariablefunc);

    // Contracts.Assert(affectScopeVariable ^ affectScopeVariablefunc == null);

    let volatileVariables = this._txb.getVolatileVariables(node)
    for (let i = argCountVisited; i < argCount; i++) {
      // Contracts.AssertValue(args[i]);

      if (affectScopeVariable) {
        // If the function affects app/component variable, update the cache info if it is the arg affects scopeVariableName.
        this._txb.affectsScopeVariableName =
          affectScopeVariablefunc.scopeVariableNameAffectingArg() == i
      }
      // Use the new scope only for lambda args and args with datasource scope for display name matching.
      if (scopeNew != null) {
        if (
          overloads.some((fnc) => fnc.argMatchesDatasourceType(i)) ||
          (i <= funcWithScope.maxArity && funcWithScope.isLambdaParam(i))
        ) {
          this._currentScope = scopeNew
        } else {
          this._currentScope = scopeNew.parent
        }
      }

      if (volatileVariables != null) {
        this._txb.addVolatileVariables(args[i], volatileVariables)
      }

      args[i].accept(this)

      // In case weight was added during visitation
      this._txb.addVolatileVariables(
        node,
        this._txb.getVolatileVariables(args[i])
      )

      if (args[i].kind == NodeKind.As) {
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          args[i],
          TexlStrings.ErrAsNotInContext
        )
      }
    }

    if (scopeNew != null) {
      this._currentScope = scopeNew.parent
    }

    // Since variable weight may have changed as we accepted the children, we need to propagate
    // this value to the args
    let adjustedVolatileVariables = this._txb.getVolatileVariables(node)
    if (adjustedVolatileVariables != null) {
      this._txb.addVolatileVariables(node.args, adjustedVolatileVariables)
    }

    this.postVisit(node.args)
    // If PreVisit resulted in errors for the node (and a non-null CallInfo),
    // we're done -- we have a match and appropriate errors logged already.
    if (this._txb.errorContainer.hasErrors(node)) {
      // Contracts.Assert(info != null);
      return
    }

    // Contracts.AssertNull(info);

    // There should be at least one possible match at this point.
    // Contracts.Assert(overloads.Length > 0);
    if (overloads.length > 1) {
      this.preVisitWithOverloadResolution(node, overloads)
      return
    }

    // We have a single possible match. Bind as usual, which will generate appropriate
    // document errors for incorrect arguments, etc.
    let func: TexlFunction = overloads[0]
    if (this._txb.glue.isComponentScopedPropertyFunction(func)) {
      const lookInfoResult = this.tryGetFunctionNameLookupInfo(
        node,
        funcNamespace
      )
      const lookupInfo = lookInfoResult[1]
      if (lookInfoResult[0]) {
        const headNode = node.headNode as DottedNameNode
        // Contracts.AssertValue(headNode);

        this.updateBindKindUseFlags(BindKind.Control)
        this._txb.setInfoForCall(
          node,
          new CallInfo(node, func, lookupInfo.data)
        )
      } else {
        this._txb.errorContainer.error(node, TexlStrings.ErrInvalidName)
        this._txb.setInfoForCall(node, new CallInfo(node))
        this._txb.setType(node, DType.Error)
        return
      }
    } else {
      this._txb.setInfoForCall(node, new CallInfo(node, func))
    }

    // Contracts.Assert(!func.HasLambdas);

    let returnType: DType = func.returnType
    if (argCount < func.minArity || argCount > func.maxArity) {
      Visitor.ArityError(
        func.minArity,
        func.maxArity,
        node,
        argCount,
        this._txb.errorContainer
      )
      this._txb.setType(node, returnType)
      return
    }

    let modifiedIdentifiers = func.getIdentifierOfModifiedValue(args)[0]
    if (modifiedIdentifiers != null) {
      this._txb.addVolatileVariables(
        node,
        new Set(
          modifiedIdentifiers.map((identifier) => identifier.name.toString())
        )
      )
    }

    // Typecheck the invocation and infer the return type.
    let argTypes: DType[] = args.map((arg) => this._txb.getType(arg))
    let fArgsValid: boolean
    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType> = null

    // Typecheck the invocation and infer the return type.
    const checkResult = func.checkInvocation(
      args,
      argTypes,
      this._txb.errorContainer,
      this._txb
    )
    returnType = checkResult[1].returnType
    nodeToCoercedTypeMap = checkResult[1].nodeToCoercedTypeMap
    fArgsValid = checkResult[0]
    // fArgsValid = func.CheckInvocation(_txb, args, argTypes, _txb.ErrorContainer, out returnType, out nodeToCoercedTypeMap);

    if (!fArgsValid && !func.hasPreciseErrors) {
      this._txb.errorContainer.errorWithSeverity(
        DocumentErrorSeverity.Severe,
        node,
        TexlStrings.ErrInvalidArgs_Func,
        func.name
      )
    }

    this._txb.setType(node, returnType)

    if (fArgsValid && nodeToCoercedTypeMap != null) {
      for (const nodeToCoercedTypeKvp of nodeToCoercedTypeMap) {
        this._txb.setCoercedType(
          nodeToCoercedTypeKvp[0],
          nodeToCoercedTypeKvp[1]
        )
      }
    }
  }

  private lookupFunctions(
    theNamespace: DPath,
    name: string
  ): Array<TexlFunction> {
    // Contracts.Assert(theNamespace.IsValid);
    // Contracts.AssertNonEmpty(name);

    if (this._nameResolver != null) {
      return this._nameResolver.lookupFunctions(theNamespace, name)
    } else {
      return []
    }
  }

  /// <summary>
  /// Tries to get the best suited overload for <see cref="node"/> according to <see cref="txb"/> and
  /// returns true if it is found.
  /// </summary>
  /// <param name="txb">
  /// Binding that will help select the best overload
  /// </param>
  /// <param name="node">
  /// CallNode for which the best overload will be determined
  /// </param>
  /// <param name="argTypes">
  /// List of argument types for <see cref="node.Args"/>
  /// </param>
  /// <param name="overloads">
  /// All overloads for <see cref="node"/>. An element of this list will be returned.
  /// </param>
  /// <param name="bestOverload">
  /// Set to the best overload when this method completes
  /// </param>
  /// <param name="nodeToCoercedTypeMap">
  /// Set to the types to which <see cref="node.Args"/> must be coerced in order for
  /// <see cref="bestOverload"/> to be valid
  /// </param>
  /// <param name="returnType">
  /// The return type for <see cref="bestOverload"/>
  /// </param>
  /// <returns>
  /// True if a valid overload was found, false if not.
  /// </returns>
  private static TryGetBestOverload(
    txb: TexlBinding,
    node: CallNode,
    argTypes: DType[],
    overloads: TexlFunction[]
  ): [
    boolean,
    {
      bestOverload: TexlFunction
      nodeToCoercedTypeMap: Dictionary<TexlNode, DType>
      returnType: DType
    }
  ] {
    // Contracts.AssertValue(node, nameof(node));
    // Contracts.AssertValue(overloads, nameof(overloads));

    let bestOverload: TexlFunction

    let args: TexlNode[] = node.args.children
    let carg = args.length
    let returnType = DType.Unknown

    let matchingFuncWithCoercion: TexlFunction = null
    let matchingFuncWithCoercionReturnType: DType = DType.Invalid
    let nodeToCoercedTypeMap: Dictionary<TexlNode, DType> = null

    let matchingFuncWithCoercionNodeToCoercedTypeMap: Dictionary<
      TexlNode,
      DType
    > = null

    for (const maybeFunc of overloads) {
      // Contracts.Assert(!maybeFunc.HasLambdas);

      nodeToCoercedTypeMap = null

      if (carg < maybeFunc.minArity || carg > maybeFunc.maxArity) {
        continue
      }

      let typeCheckSucceeded = false

      let warnings: IErrorContainer = new LimitedSeverityErrorContainer(
        txb.errorContainer,
        DocumentErrorSeverity.Warning
      )
      // Typecheck the invocation and infer the return type.
      const checkInvocationResult = maybeFunc.checkInvocation(
        args,
        argTypes,
        warnings,
        txb
      )
      returnType = checkInvocationResult[1].returnType
      nodeToCoercedTypeMap = checkInvocationResult[1].nodeToCoercedTypeMap
      typeCheckSucceeded = checkInvocationResult[0]
      // typeCheckSucceeded = maybeFunc.CheckInvocation(txb, args, argTypes, warnings, out returnType, out nodeToCoercedTypeMap);

      if (typeCheckSucceeded) {
        if (nodeToCoercedTypeMap == null) {
          // We found an overload that matches without type coercion.  The correct return type
          // and, trivially, the nodeToCoercedTypeMap are properly set at this point.
          bestOverload = maybeFunc
          return [true, { bestOverload, nodeToCoercedTypeMap, returnType }]
        }

        // We found an overload that matches but with type coercion. Keep going
        // until we find another overload that matches without type coercion.
        // If we cannot find one, we will use this overload only if there is no other
        // overload that involves fewer coercions.
        if (
          matchingFuncWithCoercion == null ||
          nodeToCoercedTypeMap.size <
            matchingFuncWithCoercionNodeToCoercedTypeMap.size
        ) {
          matchingFuncWithCoercionNodeToCoercedTypeMap = nodeToCoercedTypeMap
          matchingFuncWithCoercion = maybeFunc
          matchingFuncWithCoercionReturnType = returnType
        }
      }
    }

    // We've matched, but with coercion required.
    if (matchingFuncWithCoercionNodeToCoercedTypeMap != null) {
      bestOverload = matchingFuncWithCoercion
      nodeToCoercedTypeMap = matchingFuncWithCoercionNodeToCoercedTypeMap
      returnType = matchingFuncWithCoercionReturnType
      return [true, { bestOverload, nodeToCoercedTypeMap, returnType }]
    }

    // There are no good overloads
    bestOverload = null
    nodeToCoercedTypeMap = null
    returnType = null
    return [false, { bestOverload, nodeToCoercedTypeMap, returnType }]
  }

  /// <summary>
  /// Returns best overload in case there are no matches based on first argument and order
  /// </summary>
  private findBestErrorOverload(
    overloads: TexlFunction[],
    argTypes: DType[],
    cArg: number
  ): TexlFunction {
    let candidates = overloads.filter(
      (overload) => overload.minArity <= cArg && cArg <= overload.maxArity
    )
    if (cArg == 0) {
      return candidates[0] || undefined
    }

    // Consider overloads that have DType.Error parameter the last
    candidates = candidates.sort((candidate) =>
      candidate.paramTypes.length > 0 && candidate.paramTypes[0] == DType.Error
        ? 1
        : 0
    )
    // candidates = candidates.OrderBy(candidate => candidate.ParamTypes.Length > 0 && candidate.ParamTypes[0] == DType.Error).ToArray();
    for (const candidate of candidates) {
      if (
        candidate.paramTypes.length > 0 &&
        candidate.paramTypes[0].accepts(argTypes[0])
      ) {
        return candidate
      }
    }
    return candidates[0]
  }

  private preVisitWithOverloadResolution(
    node: CallNode,
    overloads: TexlFunction[]
  ) {
    // Contracts.AssertValue(node);
    // Contracts.AssertNull(_txb.GetInfo(node));
    // Contracts.AssertValue(overloads);
    // Contracts.Assert(overloads.Length > 1);
    // Contracts.AssertAllValues(overloads);

    let args: TexlNode[] = node.args.children
    let carg = args.length
    let argTypes = args.map((arg) => this._txb.getType(arg))

    const result = Visitor.TryGetBestOverload(
      this._txb,
      node,
      argTypes,
      overloads
    )

    let { bestOverload, nodeToCoercedTypeMap, returnType } = result[1]
    if (result[0]) {
      this._txb.setInfoForCall(node, new CallInfo(node, bestOverload))
      this._txb.setType(node, returnType)
      // If we found an overload and this value is set then we require parameter conversion
      if (nodeToCoercedTypeMap != null) {
        for (const nodeToCoercedTypeKvp of nodeToCoercedTypeMap) {
          this._txb.setCoercedType(
            nodeToCoercedTypeKvp[0],
            nodeToCoercedTypeKvp[1]
          )
        }
      }
      return
    }

    const someFunc = this.findBestErrorOverload(overloads, argTypes, carg)
    // If nothing matches even the arity, we're done.
    if (someFunc == null) {
      const minArity = Math.min(...overloads.map((func) => func.minArity))
      const maxArity = Math.max(...overloads.map((func) => func.maxArity))
      Visitor.ArityError(
        minArity,
        maxArity,
        node,
        carg,
        this._txb.errorContainer
      )

      this._txb.setInfoForCall(node, new CallInfo(node, overloads[0]))
      this._txb.setType(node, DType.Error)
      return
    }
    // We exhausted the overloads without finding an exact match, so post a document error.
    if (!someFunc.hasPreciseErrors) {
      this._txb.errorContainer.error(
        node,
        TexlStrings.ErrInvalidArgs_Func,
        someFunc.name
      )
    }
    // The final CheckInvocation call will post all the necessary document errors.
    const rst = someFunc.checkInvocation(
      args,
      argTypes,
      this._txb.errorContainer,
      this._txb
    )
    returnType = rst[1].returnType
    this._txb.setInfoForCall(node, new CallInfo(node, someFunc))
    this._txb.setType(node, returnType)
  }

  public postVisitListNode(node: ListNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    this.setVariadicNodePurity(node)
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(...node.children))
  }

  private isRecordScopeFieldName(name: DName): [boolean, Scope] {
    // Contracts.AssertValid(name);
    let scope: Scope
    if (
      this._txb.document == null ||
      !this._txb.document.properties.enabledFeatures
        .isUseDisplayNameMetadataEnabled
    ) {
      scope = undefined
      return [false, scope]
    }

    // Look up the name in the current scopes, innermost to outermost.
    for (scope = this._currentScope; scope != null; scope = scope.parent) {
      // Contracts.AssertValue(scope);

      // If scope type is a data source, the node may be a display name instead of logical.
      // Attempt to get the logical name to use for type checking
      let maybeLogicalName: string
      let tmp: string
      if (!scope.skipForInlineRecords) {
        const rst = DType.TryGetConvertedDisplayNameAndLogicalNameForColumn(
          scope.type,
          name.value
        )
        maybeLogicalName = rst[1].logicalName
        tmp = rst[1].newDisplayName
        if (rst[0]) {
          name = new DName(maybeLogicalName)
        } else {
          const rst2 = DType.TryGetLogicalNameForColumn(scope.type, name.value)
          maybeLogicalName = rst2[1]
          if (rst2[0]) {
            name = new DName(maybeLogicalName)
          }
        }
      }

      let tmpType: DType
      const result = scope.type.tryGetType(name)
      tmpType = result[1]
      if (result[0]) {
        return [true, scope]
      }
    }
    return [false, scope]
  }

  public postVisitRecordNode(node: RecordNode) {
    this.assertValid()
    // Contracts.AssertValue(node);

    let nodeType = DType.EmptyRecord

    let dataSourceBoundType = DType.Invalid
    if (
      node.sourceRestriction != null &&
      node.sourceRestriction.kind == NodeKind.FirstName
    ) {
      let sourceRestrictionNode = node.sourceRestriction.asFirstName()

      let info = this._txb.getInfo(sourceRestrictionNode) as FirstNameInfo
      let dataSourceInfo = info?.data as IExternalDataSource
      if (dataSourceInfo == null) {
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          sourceRestrictionNode,
          TexlStrings.ErrExpectedDataSourceRestriction
        )
        nodeType = DType.Error
      } else {
        dataSourceBoundType = dataSourceInfo.schema
        nodeType = DType.CreateDTypeWithConnectedDataSourceInfoMetadata(
          nodeType,
          dataSourceBoundType.associatedDataSources
        )
      }
    }

    let isSelfContainedConstant = true
    for (let i = 0; i < node.count; i++) {
      let displayName = node.ids[i].name.value
      let fieldName = node.ids[i].name
      let fieldType: DType

      isSelfContainedConstant &&= this._txb.isSelfContainedConstant(
        node.children[i]
      )

      if (dataSourceBoundType != DType.Invalid) {
        const displayNameRst = this.getLogicalNodeNameAndUpdateDisplayNamesOut(
          dataSourceBoundType,
          node.ids[i]
        )
        displayName = displayNameRst[1]
        fieldName = displayNameRst[0]
        // fieldName = this.getLogicalNodeNameAndUpdateDisplayNames(dataSourceBoundType, node.ids[i], out displayName);
        const typeResult = dataSourceBoundType.tryGetType(fieldName)
        fieldType = typeResult[1]
        if (!typeResult[0]) {
          dataSourceBoundType.reportNonExistingName(
            FieldNameKind.Display,
            this._txb.errorContainer,
            fieldName,
            node.children[i]
          )
          nodeType = DType.Error
        } else if (!fieldType.accepts(this._txb.getType(node.children[i]))) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            node.children[i],
            TexlStrings.ErrColumnTypeMismatch_ColName_ExpectedType_ActualType,
            displayName,
            fieldType.getKindString(),
            this._txb.getType(node.children[i]).getKindString()
          )
          nodeType = DType.Error
        }
      } else {
        // For local records, check name/type match with scope
        let maybeScope: Scope
        const fieldNamerst = this.isRecordScopeFieldName(fieldName)
        maybeScope = fieldNamerst[1]
        if (fieldNamerst[0]) {
          const rst = this.getLogicalNodeNameAndUpdateDisplayNamesOut(
            maybeScope.type,
            node.ids[i]
          )
          displayName = rst[1]
          fieldName = rst[0]
        }
      }

      if (nodeType != DType.Error) {
        const rst = nodeType.tryGetType(fieldName)
        fieldType = rst[1]
        if (rst[0]) {
          this._txb.errorContainer.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            node.children[i],
            TexlStrings.ErrMultipleValuesForField_Name,
            displayName
          )
        } else {
          nodeType = nodeType.add(
            fieldName,
            this._txb.getType(node.children[i])
          )
        }
      }
    }

    this._txb.setType(node, nodeType)
    this.setVariadicNodePurity(node)
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(...node.children))
    this._txb.setSelfContainedConstant(node, isSelfContainedConstant)
  }

  public postVisitTableNode(node: TableNode) {
    this.assertValid()
    // Contracts.AssertValue(node);
    let exprType = DType.Invalid
    let isSelfContainedConstant = true

    for (const child of node.children) {
      let childType = this._txb.getType(child)
      isSelfContainedConstant &&= this._txb.isSelfContainedConstant(child)

      if (!exprType.isValid) {
        exprType = childType
      } else if (exprType.canUnionWith(childType)) {
        exprType = DType.Union(exprType, childType)
      } else if (childType.coercesTo(exprType)) {
        this._txb.setCoercedType(child, exprType)
      } else {
        this._txb.errorContainer.ensureErrorWithSeverity(
          DocumentErrorSeverity.Severe,
          child,
          TexlStrings.ErrTableDoesNotAcceptThisType
        )
      }
    }

    this._txb.setType(
      node,
      exprType.isValid
        ? DType.CreateTable(new TypedName(exprType, new DName('Value')))
        : DType.EmptyTable
    )
    this.setVariadicNodePurity(node)
    this._txb.setScopeUseSet(node, this.joinScopeUseSets(...node.children))
    this._txb.setSelfContainedConstant(node, isSelfContainedConstant)
  }
}

class Scope {
  public readonly call: CallNode
  public readonly nest: number
  public readonly parent: Scope
  public readonly type: DType
  public readonly createsRowScope: boolean
  public readonly skipForInlineRecords: boolean
  public readonly scopeIdentifier: DName
  public readonly requireScopeIdentifier: boolean

  // Optional data associated with scope. May be null.
  public readonly data: any

  // public Scope(DType type)
  // {
  //     Contracts.Assert(type.IsValid);
  //     Type = type;
  // }

  constructor(
    call: CallNode | undefined,
    parent: Scope | undefined,
    type: DType,
    scopeIdentifier: DName = DName.Default(),
    requireScopeIdentifier = false,
    data: any = null,
    createsRowScope = true,
    skipForInlineRecords = false
  ) {
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertValueOrNull(data);

    this.call = call
    this.parent = parent
    this.type = type
    this.data = data
    this.createsRowScope = createsRowScope
    this.skipForInlineRecords = skipForInlineRecords
    this.scopeIdentifier = scopeIdentifier
    this.requireScopeIdentifier = requireScopeIdentifier

    this.nest = parent?.nest ?? 0
    // Scopes created for record scope only do not increase lambda param nesting
    if (createsRowScope) this.nest += 1
  }

  public up(upCount: number): Scope {
    // Contracts.AssertIndex(upCount, Nest);

    let scope: Scope = this
    while (upCount-- > 0) {
      scope = scope.parent
      // Contracts.AssertValue(scope);
    }

    return scope
  }
}

export class BinderNodesMetadataArgTypeVisitor extends Visitor {
  constructor(
    binding: TexlBinding,
    resolver: INameResolver,
    topScope: DType,
    useThisRecordForRuleScope: boolean
  ) {
    // Contracts.AssertValue(binding);
    super(binding, resolver, topScope, useThisRecordForRuleScope)
    this._txb = binding
  }

  private isColumnMultiChoice(
    columnMetadata: IExternalColumnMetadata
  ): boolean {
    // Contracts.AssertValue(columnMetadata);

    return columnMetadata?.dataFormat == DataFormat.Lookup
  }

  public postVisit(node: DottedNameNode) {
    // Contracts.AssertValue(node);

    let lhsType: DType = this._txb.getType(node.left)
    let typeRhs: DType = DType.Invalid
    let nameRhs: DName = node.right.name
    let firstNameInfo: FirstNameInfo
    let firstNameNode: FirstNameNode
    let tableMetadata: IExternalTableMetadata
    let nodeType: DType = DType.Unknown

    if (
      node.left.kind != NodeKind.FirstName &&
      node.left.kind != NodeKind.DottedName
    ) {
      this.setDottedNameError(node, TexlStrings.ErrInvalidName)
      return
    }

    nameRhs = this.getLogicalNodeNameAndUpdateDisplayNames(lhsType, node.right)

    const result = lhsType.tryGetType(nameRhs)
    typeRhs = result[1]

    if (!result[0]) {
      this.setDottedNameError(node, TexlStrings.ErrInvalidName)
      return
    }

    // There are two cases:
    // 1. RHS could be an option set.
    // 2. RHS could be a data entity.
    // 3. RHS could be a column name and LHS would be a datasource.
    if (typeRhs.isOptionSet) {
      nodeType = typeRhs
    } else if (typeRhs.isExpandEntity) {
      const entityInfo = typeRhs.expandInfo
      // Contracts.AssertValue(entityInfo);

      let entityPath: string = ''
      if (lhsType.hasExpandInfo)
        entityPath = lhsType.expandInfo.expandPath.toString()

      let expandedEntityType: DType = this.getExpandedEntityType(
        typeRhs,
        entityPath
      )

      let parentDataSource = entityInfo.parentDataSource
      let metadata = new DataTableMetadata(
        parentDataSource.name,
        parentDataSource.name
      )
      nodeType = DType.CreateMetadataType(
        new DataColumnMetadata({
          name: typeRhs.expandInfo.name,
          type: expandedEntityType,
          tableMetadata: metadata,
        })
      )
    } else if (
      (firstNameNode = node.left.asFirstName()) != null &&
      (firstNameInfo = this._txb.getInfo(firstNameNode)) != null
    ) {
      const tabularDataSourceInfo =
        firstNameInfo.data as IExternalTabularDataSource
      tableMetadata = tabularDataSourceInfo?.tableMetadata
      if (tableMetadata == null) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }
      const rst = tableMetadata.tryGetColumn(nameRhs.value)
      const columnMetadata = rst[1]
      if (!rst[0] || !this.isColumnMultiChoice(columnMetadata)) {
        this.setDottedNameError(node, TexlStrings.ErrInvalidName)
        return
      }

      const metadata = new DataTableMetadata(
        tabularDataSourceInfo.name,
        tableMetadata.displayName
      )
      nodeType = DType.CreateMetadataType(
        new DataColumnMetadata({ columnMetadata, tableMetadata: metadata })
      )
    } else {
      this.setDottedNameError(node, TexlStrings.ErrInvalidName)
      return
    }

    // Contracts.AssertValid(nodeType)

    this._txb.setType(node, nodeType)
    this._txb.setInfoDottedName(node, new DottedNameInfo(node))
  }
}
