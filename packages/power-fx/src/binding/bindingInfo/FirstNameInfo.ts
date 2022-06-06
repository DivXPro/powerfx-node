import { ScopedNameLookupInfo } from './ScopedNameLookupInfo'
import { IExternalControl } from '../../app/controls/IExternalControl'
import { ExpandQueryOptions } from '../../entities/queryOptions/ExpandQueryOptions'
import { FirstNameNode } from '../../syntax'
import { ExpandPath } from '../../types/ExpandPath'
import { IExpandInfo } from '../../types/IExpandInfo'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { Lazy } from '../../utils/Lazy'
import { BindKind } from '../BindKind'
import { NameInfo } from './NameInfo'
import { NameLookupInfo } from './NameLookupInfo'

export class FirstNameInfo extends NameInfo {
  // public DName Name { get { return Node.AsFirstName().Ident.Name; } }
  public get name() {
    return (this.node as FirstNameNode).asFirstName()?.ident.name
  }

  // Nesting level of where this name is defined.
  // Negative values mean "up".
  // Positive values mean that the target is a parameter of a nested lambda.
  // In RowScope bind, NestDst specifies the upcount for the row scope alias.
  public readonly nestDst: number

  // The nesting level of where this name is being used. This is always >= 0 and >= NestDst.
  public readonly nestSrc: number

  // Qualifying path. May be DPath.Root (unqualified).
  public readonly path: DPath

  // Optional data associated with a FirstName. May be null.
  public readonly data: any

  // For FirstNames with BindKind.ThisItem, are we accessing a field of the control template instead of data?
  public readonly isDataControlAccess: boolean
  public readonly dataControlName: DName

  private readonly _dataQueryOptions: Lazy<Map<ExpandPath, ExpandQueryOptions>>

  get dataQueryOptions() {
    return this._dataQueryOptions.value
  }

  // The number of containing scopes up where the name is defined.
  // 0 refers to the current/innermost scope, a higher number refers to a parent/ancestor scope.
  public get upCount() {
    return this.nestSrc - this.nestDst
  }

  constructor(
    kind: BindKind,
    node: FirstNameNode,
    nestDst: number,
    nestCur: number,
    path: DPath,
    data: any,
    dataControlName: DName,
    isDataControlAccess: boolean, // : base(kind, node)
  ) {
    super(kind, node)
    // Contracts.Assert(nestDst >= int.MinValue);
    // Contracts.Assert(nestCur >= 0);
    // Contracts.Assert(nestCur >= nestDst);
    // Contracts.AssertValueOrNull(data);

    this.nestDst = nestDst
    this.nestSrc = nestCur
    this.path = path
    this.data = data
    this.isDataControlAccess = isDataControlAccess
    this.dataControlName = dataControlName
    this._dataQueryOptions = new Lazy<Map<ExpandPath, ExpandQueryOptions>>(() => new Map())
  }

  // Create a qualified name (global/alias/enum/resource), e.g. "screen1.group25.slider2", or "Color".
  // Can also be used to create fields of ThisItem (with an appropriate upCount).
  public static Create1(node: FirstNameNode, lookupInfo: NameLookupInfo) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(lookupInfo.Kind != BindKind.LambdaField && lookupInfo.Kind != BindKind.LambdaFullRecord);
    // Contracts.Assert(lookupInfo.UpCount >= 0);
    // Contracts.Assert(lookupInfo.Path.IsValid);
    return new FirstNameInfo(
      lookupInfo.kind,
      node,
      -lookupInfo.upCount,
      0,
      lookupInfo.path,
      lookupInfo.data,
      null,
      false,
    )
  }

  public static Create2(node: FirstNameNode, lookupInfo: NameLookupInfo, data: IExpandInfo) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(lookupInfo.Kind == BindKind.DeprecatedImplicitThisItem);
    // Contracts.Assert(lookupInfo.UpCount >= 0);
    // Contracts.Assert(lookupInfo.Path.IsValid);
    return new FirstNameInfo(lookupInfo.kind, node, -lookupInfo.upCount, 0, lookupInfo.path, data, null, false)
  }

  public static Create3(
    node: FirstNameNode,
    lookupInfo: NameLookupInfo,
    dataControlName: DName,
    isDataControlAccess: boolean,
  ) {
    // Contracts.AssertValue(node);
    // Contracts.Assert(lookupInfo.Kind == BindKind.ThisItem);
    // Contracts.Assert(lookupInfo.UpCount >= 0);
    // Contracts.Assert(lookupInfo.Path.IsValid);

    return new FirstNameInfo(
      lookupInfo.kind,
      node,
      -lookupInfo.upCount,
      0,
      lookupInfo.path,
      lookupInfo.data,
      dataControlName,
      isDataControlAccess,
    )
  }

  public static Create4(node: FirstNameNode, lookupInfo: ScopedNameLookupInfo) {
    // Contracts.AssertValue(node);
    return new FirstNameInfo(BindKind.ScopeArgument, node, 0, 0, DPath.Root, lookupInfo, null, false)
  }

  public static Create5(node: FirstNameNode, data: IExternalControl) {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(data);

    return new FirstNameInfo(BindKind.Control, node, 0, 0, DPath.Root, data, null, false)
  }

  // Create either an unqualified scoped field:
  //      e.g. "X" in Filter(T, X < 2)
  // ..or a row scope alias:
  //      e.g. "T1" in Filter(T1, T1[@a] < 100)
  public static Create6(kind: BindKind, node: FirstNameNode, nestDst: number, nestSrc: number, data?: any) {
    // Contracts.Assert(kind == BindKind.LambdaField || kind == BindKind.LambdaFullRecord || kind == BindKind.ComponentNameSpace);
    // Contracts.AssertValue(node);
    // Contracts.Assert(nestDst > int.MinValue);
    // Contracts.Assert(nestSrc >= 0);
    // Contracts.Assert(nestSrc >= nestDst);
    // Contracts.AssertValueOrNull(data);

    return new FirstNameInfo(kind, node, nestDst, nestSrc, DPath.Root, data, null, false)
  }
}
