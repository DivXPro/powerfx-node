import { IExternalControlProperty } from '../app/controls/IExternalControlProperty'
import { IExternalDocument } from '../app/IExternalDocument'
import { BindKind } from '../binding'
import { NameLookupInfo } from '../binding/bindingInfo'
import { INameResolver, NameLookupPreferences, NameResolverExtensions } from '../binding/INameResolver'
import { IExternalEntity } from '../entities/external/IExternalEntity'
import { IExternalEntityScope } from '../entities/external/IExternalEntityScope'
import { TexlFunction } from '../functions/TexlFunction'
import { BuiltinFunctionsLibrary } from '../texl/BuiltinFunctionsCore'
import { DType } from '../types/DType'
import { EnumSymbol } from '../types/enums'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
/// <summary>
/// Basic implementation of INameResolver.
/// Host can override Lookup to provide additional symbols to the expression.
/// </summary>

export type SimpleResolverProps = {
  enumSymbols: EnumSymbol[]
  extraFunctions: TexlFunction[]
}

export class SimpleResolver implements INameResolver {
  protected _library: TexlFunction[]
  protected _enums: EnumSymbol[] = []
  protected _document: IExternalDocument

  public get document(): IExternalDocument {
    return this._document
  }

  // public EntityScope EntityScope => (EntityScope)Document.GlobalScope;
  //IExternalEntityScope INameResolver.EntityScope => EntityScope;
  // IExternalEntityScope INameResolver.EntityScope => throw new NotImplementedException();
  get entityScope(): IExternalEntityScope {
    throw new Error()
  }

  public get currentProperty(): DName {
    return null
  }

  public get currentEntityPath(): DPath {
    return null
  }

  // Allow behavior properties, like calls to POST.
  // $$$ this may need to be under a flag so host can enforce read-only properties.
  public get currentPropertyIsBehavior() {
    return true
  }

  public get currentPropertyIsConstantData() {
    return false
  }

  public get currentPropertyAllowsNavigation() {
    return false
  }

  public get functions() {
    return this._library
  }

  public get currentEntity(): IExternalEntity {
    return null
  }

  constructor(enumSymbols: EnumSymbol[], extraFunctions: TexlFunction[]) {
    this._library = [...BuiltinFunctionsLibrary, ...extraFunctions]
    this._enums = enumSymbols
  }

  public lookup(
    name: DName,
    /* out NameLookupInfo nameInfo, */ preferences: NameLookupPreferences = NameLookupPreferences.None,
  ): [boolean, NameLookupInfo] {
    const enumValue = this._enums.find((symbol) => symbol.invariantName === name.toString())
    if (enumValue != null) {
      return [true, new NameLookupInfo(BindKind.Enum, enumValue.enumType, DPath.Root, 0, enumValue)]
    }

    return [false, null]
  }

  public lookupFunctions(theNamespace: DPath, name: string, localeInvariant = false): Array<TexlFunction> {
    //   Contracts.Check(theNamespace.IsValid, "The namespace is invalid.");
    //   Contracts.CheckNonEmpty(name, "name");

    // See TexlFunctionsLibrary.Lookup
    return this._library.filter(
      (func) => func.namespace.equals(theNamespace) && name == (localeInvariant ? func.localeInvariantName : func.name),
    ) // Base filter
  }

  public lookupFunctionsInNamespace(nameSpace: DPath): Array<TexlFunction> {
    //   Contracts.Check(nameSpace.IsValid, "The namespace is invalid.");
    // let arr= this._library.filter((fn) => fn.namespace.equals(nameSpace))//两个对象不完全一致,_library的_node=undefined
    let arr = this._library.filter((fn) => fn.namespace.name.value == nameSpace.name.value)
    // let arr = this._library.filter((fn) => fn.namespace.name.equals(nameSpace.name) && fn.namespace.parent.equals(nameSpace.parent));
    return arr
  }

  tryGetNamedEnumValueByLocName(locName: DName): [boolean, { enumName: DName; enumType: DType; value: any }] {
    for (const info of this._enums) {
      const rst = info.tryLookupValueByLocName(locName.toString())
      let value = rst[1].value
      // info.TryLookupValueByLocName(locName, out _, out value)
      if (rst[0]) {
        const enumName = new DName(info.name)
        const enumType = info.enumType
        return [true, { enumName, enumType, value }]
      }
    }

    // Not found
    //   enumName = default;
    //   enumType = null;
    //   value = null;
    return [false, { enumName: null, enumType: null, value: null }]
  }

  public lookupDataControl(name: DName): [boolean, { lookupInfo: NameLookupInfo; dataControlName: DName } | undefined] {
    const dataControlName: DName = null
    const lookupInfo: NameLookupInfo = null
    return [false, { dataControlName, lookupInfo }]
  }

  public lookupEnumValueByInfoAndLocName(enumInfo: any, locName: DName): [boolean, any] {
    let value: any = null
    const castEnumInfo = enumInfo as EnumSymbol
    const rst = castEnumInfo?.tryLookupValueByLocName(locName.value)
    value = rst[1].value
    return rst[0] ? [true, value] : [false, value]
  }

  public lookupEnumValueByTypeAndLocName(enumType: DType, locName: DName): [boolean, any] {
    let value: any
    // Slower O(n) lookup involving a walk over the registered enums...
    for (const info of this._enums) {
      if (info.enumType == enumType) {
        const rst = info.tryLookupValueByLocName(locName.value)
        value = rst[1].value
        return [rst[0], value]
      }
    }

    value = null
    return [false, value]
  }

  public lookupGlobalEntity(name: DName): [boolean, NameLookupInfo] {
    const lookupInfo: NameLookupInfo = null
    return [false, lookupInfo]
  }

  public lookupParent(): [boolean, NameLookupInfo] {
    const lookupInfo: NameLookupInfo = null
    return [false, lookupInfo]
  }

  public lookupSelf(): [boolean, NameLookupInfo] {
    const lookupInfo: NameLookupInfo = null
    return [false, lookupInfo]
  }

  public tryGetInnermostThisItemScope(): [boolean, NameLookupInfo] {
    const nameInfo: NameLookupInfo = null
    return [false, nameInfo]
  }

  public tryLookupEnum(name: DName): [boolean, NameLookupInfo] {
    // throw new System.NotImplementedException()
    throw new Error()
  }

  public tryGetCurrentControlProperty(): [boolean, IExternalControlProperty] {
    return NameResolverExtensions.TryGetCurrentControlProperty(this)
  }

  public lookupFormulaValuesIn(path: string): any {
    return undefined
  }
}
