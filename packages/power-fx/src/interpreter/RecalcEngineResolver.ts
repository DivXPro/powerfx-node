import { BindKind, NameLookupPreferences } from '../binding'
import { NameLookupInfo } from '../binding/bindingInfo'
import { SimpleResolver } from '../glue/SimpleResolver'
import { RecordType } from '../public/types/RecordType'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { RecalcEngine } from './RecalcEngine'
import { PowerFxConfig } from '../public'
import { IsIExternalOptionSet } from '../entities/external/IExternalOptionSet'
import { RecalcEngineDocument } from './external/RecalcEngineDocument'
import { Control } from './environment/Control'
import { DType, ExpandPath, TypedName, TypeTree } from '../types'
import { IExternalEntityScope } from '../entities/external/IExternalEntityScope'
import { MetaNameSpace } from './MetaNameSpace'
import { MetaDataExpandInfo } from '../meta/external/MetaDataExpandInfo'
import { MetaDataSource } from '../meta/external/MetaDataSource'
import { DataSourceKind } from '../entities'
import { MetaTableMetadata } from '../meta/external/MetaTableMetadata'

/// </summary>
export class RecalcEngineResolver extends SimpleResolver {
  private readonly _parent: RecalcEngine
  private readonly _powerFxConfig: PowerFxConfig
  private readonly _parameters: RecordType
  private readonly _currentPath: DPath
  protected declare readonly _document: RecalcEngineDocument

  constructor(
    parent: RecalcEngine,
    powerFxConfig: PowerFxConfig,
    parameters: RecordType,
    document?: RecalcEngineDocument,
    path?: ExpandPath,
  ) {
    super(powerFxConfig.enumStore.enumSymbols, Array.from(powerFxConfig.extraFunctions.values()))
    this._parameters = parameters
    this._powerFxConfig = powerFxConfig
    this._parent = parent
    this._document = document
    this._currentPath = path ? path.toDPath() : this._currentPath
  }

  public get document() {
    return this._document
  }

  public get currentEntityPath() {
    return this._currentPath
  }

  public get currentEntity() {
    if (this.currentEntityPath && this.document) {
      return this.document.globalScope.tryGetEntity<Control>(this.currentEntityPath.name)[1]
    }
  }

  public get entityScope(): IExternalEntityScope {
    return this._document.globalScope
  }

  public lookup(name: DName, preferences = NameLookupPreferences.None): [boolean, NameLookupInfo] {
    // Kinds of globals:
    // - global formula
    // - parameters
    // - environment symbols

    let nameInfo: NameLookupInfo
    const str = name.value
    if (str === 'ThisItem' && this.currentEntity) {
      const thisItemPath = this.currentEntity.topParentOrSelf.isDataComponentDefinition
        ? this.currentEntityPath.parent
        : this.currentEntityPath

      return [
        true,
        new NameLookupInfo(
          BindKind.ThisItem,
          this.currentEntity.thisItemType,
          thisItemPath,
          0,
          this.currentEntity.topParentOrSelf,
          this.currentEntity.topParentOrSelf.entityName,
        ),
      ]
    }

    if (str === MetaNameSpace.Form) {
      const name = new DName(MetaNameSpace.Form)
      const type = DType.CreateRecord(
        new TypedName(
          DType.MakeDTypeForControl(TypeTree.Create([{ key: 'name', value: DType.String }])),
          new DName('AddUser'),
        ),
      )

      return [
        true,
        new NameLookupInfo(
          BindKind.PowerFxResolvedObject,
          type,
          DPath.Root.append(name),
          0,
          this.document.controlValues,
          name,
        ),
      ]
    }

    if (str === MetaNameSpace.DataSource) {
      const name = new DName(MetaNameSpace.DataSource)
      const type = DType.CreateRecord(
        new TypedName(
          DType.CreateExpandType(
            new MetaDataExpandInfo({
              identity: 'User',
              expandPath: new ExpandPath('DataSource', 'User'),
              isTable: true,
              name: 'User',
              parentDataSource: new MetaDataSource({
                entityName: new DName('User'),
                name: 'User',
                kind: DataSourceKind.CdsNative,
                scopeId: undefined,
                tableMetadata: new MetaTableMetadata('User', '用户', []),
                isDelegatable: true,
                isPageable: true,
                isSelectable: true,
                dataEntityMetadataProvider: undefined,
              }),
              polymorphicParent: undefined,
            }),
          ),
          new DName('User'),
        ),
      )
    }

    const parameter = this._parameters.maybeGetFieldType(str)
    if (parameter != null) {
      const data = new ParameterData(str)
      const type = parameter._type

      nameInfo = new NameLookupInfo(BindKind.PowerFxResolvedObject, type, DPath.Root, 0, data)
      return [true, nameInfo]
    }

    if (this._parent.formulas[str] != null) {
      const fi = this._parent.formulas[str]
      const data = fi
      const type = fi.type._type

      nameInfo = new NameLookupInfo(BindKind.PowerFxResolvedObject, type, DPath.Root, 0, data)
      return [true, nameInfo]
    }
    const result = this._powerFxConfig.environmentSymbols.tryGetValue(name)
    const symbol = result[1]
    if (result[0]) {
      // Special case symbols
      if (IsIExternalOptionSet(symbol)) {
        nameInfo = new NameLookupInfo(BindKind.OptionSet, symbol.type, DPath.Root, 0, symbol)

        return [true, nameInfo]
      } else {
        // throw new NotImplementedException($"{symbol.GetType().Name} not supported by {typeof(RecalcEngineResolver).Name}");
        throw new Error(`${symbol} not supported by ${this}`)
      }
    }

    return super.lookup(name, preferences)
  }

  public lookupDataControl(name: DName): [boolean, { lookupInfo: NameLookupInfo; dataControlName: DName }] {
    if (name.value === 'ThisItem') {
      const lookupInfo = new NameLookupInfo(
        BindKind.Control,
        this.currentEntity.thisItemType,
        DPath.Root,
        0,
        this.currentEntity.topParentOrSelf,
        this.currentEntity.topParentOrSelf.entityName,
      )
      return [true, { lookupInfo, dataControlName: this.currentEntity.entityName }]
    }
    return [false, undefined]
  }
}

export class ParameterData {
  public parameterName: string

  constructor(parameterName: string) {
    this.parameterName = parameterName
  }
}
