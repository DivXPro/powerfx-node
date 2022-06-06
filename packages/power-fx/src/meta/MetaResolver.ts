import { BindKind, NameLookupPreferences } from '../binding'
import { NameLookupInfo } from '../binding/bindingInfo'
import { IsIExternalOptionSet } from '../entities/external'
import { SimpleResolver } from '../glue/SimpleResolver'
import { getMetasIn, makeDPath, makeDType } from './metaType'
import { makeFormulaValue } from './metaValue'
import { MetaRecalcEngine } from './MetaRecalcEngine'
import { PowerFxConfig } from '../public'
import { DName, DPath } from '../utils'
import { MetaEngineDocument } from './MetaEngineDocument'
import { MetaEntityScope } from './MetaEntityScope'
import { isArrayField, isObjectField, isVoidField } from '@formily/core'
import { MetaFieldControl } from './MetaFieldControl'
import { DKind, DType, TypedName, TypeTree } from '../types'
import { MetaNameSpace } from '../interpreter/MetaNameSpace'

/// </summary>
export class MetaResolver extends SimpleResolver {
  private readonly _parent: MetaRecalcEngine
  private readonly _powerFxConfig: PowerFxConfig
  private readonly _currentPath: DPath
  protected declare readonly _document: MetaEngineDocument
  private readonly _currentEntity: MetaFieldControl

  constructor(parent: MetaRecalcEngine, powerFxConfig: PowerFxConfig, document?: MetaEngineDocument, path?: DPath) {
    super(powerFxConfig.enumStore.enumSymbols, Array.from(powerFxConfig.extraFunctions.values()))
    this._powerFxConfig = powerFxConfig
    this._parent = parent
    this._document = document
    this._currentPath = path ?? this._currentPath
    if (this.currentEntityPath && this.document) {
      this._currentEntity = this.document.globalScope.tryGetFieldEntity(this.currentEntityPath)[1]
    }
  }

  public get form() {
    return this._parent.form
  }

  public get metaSchema() {
    return this._parent.metaSchema
  }

  public get currentEntityPath() {
    return this._currentPath
  }

  public get currentEntity() {
    return this._currentEntity
  }

  public get thisItemField() {
    let parentField = this.currentEntity.parent
    while (isVoidField(parentField) && parentField.parent) {
      parentField = parentField.parent
    }
    if (isArrayField(parentField) || isObjectField(parentField)) {
      return parentField
    }
    return undefined
  }

  public get document() {
    return this._document
  }

  public get entityScope(): MetaEntityScope {
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
      // TODO: 找到正确的thisItem，排出voidField组件的影响
      // const thisItemArray = this.entityScope.tryGetFieldEntity(makeDPath(this.thisItemField.address))[1]
      const thisItemDataPath = this.currentEntity.field.path.parent()
      const data = this.lookupFormulaValuesIn(thisItemDataPath.toString())
      return [
        true,
        new NameLookupInfo(
          BindKind.ThisItem,
          this.currentEntity.thisItemType,
          makeDPath(thisItemDataPath),
          0,
          data,
          this.currentEntity.topParentOrSelf.entityName,
        ),
      ]
    }

    if (str === MetaNameSpace.Form) {
      const name = new DName(MetaNameSpace.Form)
      const forms = this.document.formFields.map(
        (field) => new TypedName(DType.MakeDTypeForControl(TypeTree.Create([])), new DName(field.componentProps.uid)),
      )
      const type = DType.CreateRecord(...forms)

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
      const dataEntities = this.document.getAllDataEntities().map(
        (dataEntityMetadata) =>
          new TypedName(
            // TODO:
            DType.MakeDTypeForEntity(
              DKind.DataEntity,
              this.document.getDataEntityInfo(dataEntityMetadata.entityName),
              undefined,
            ),
            new DName(dataEntityMetadata.entityName),
          ),
      )
      const type = DType.CreateRecord(...dataEntities)
      return [
        true,
        new NameLookupInfo(
          BindKind.PowerFxResolvedObject,
          type,
          DPath.Root.append(name),
          0,
          this.document.dataEntityValues,
          name,
        ),
      ]
    }

    if (str === MetaNameSpace.Flow) {
      const name = new DName(MetaNameSpace.Flow)
      const flows = this.document
        .getAllFlows()
        .map(
          (flowMetadata) =>
            new TypedName(
              DType.MakeDTypeForFlow(DKind.Flow, this.document.getFlowInfo(flowMetadata.identity)),
              new DName(flowMetadata.identity),
            ),
        )
      const type = DType.CreateRecord(...flows)
      return [
        true,
        new NameLookupInfo(
          BindKind.PowerFxResolvedObject,
          type,
          DPath.Root.append(name),
          0,
          this.document.flowValues,
          name,
        ),
      ]
    }

    const fieldMeta = this.getMetasIn(str)
    if (fieldMeta != null) {
      const type = makeDType(fieldMeta)
      const data = this.lookupFormulaValuesIn(str)
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

  public lookupFormulaValuesIn(pattern: string) {
    return makeFormulaValue(this.getMetasIn(pattern), this.form.getValuesIn(pattern))
  }

  public getMetasIn(pattern: string) {
    return getMetasIn(pattern, this.metaSchema)
  }
}
