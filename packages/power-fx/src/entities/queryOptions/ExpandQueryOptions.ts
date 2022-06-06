import { ExpandPath } from '../../types/ExpandPath'
import { IExpandInfo } from '../../types/IExpandInfo'
import { isNullOrEmpty } from '../../utils/CharacterUtils'
import { IExternalCdsDataSource, IsIExternalCdsDataSource } from '../external/IExternalCdsDataSource'
import { IExternalTabularDataSource } from '../external/IExternalTabularDataSource'

export class ExpandQueryOptions {
  public expandInfo: IExpandInfo

  public isRoot: boolean
  public readonly parent: ExpandQueryOptions

  private readonly _selects: Set<string> // List of selected fields if any on a particular entity.
  private readonly _keyColumns: Set<string> // List of key columns on a particular entity.
  private _expands: Set<ExpandQueryOptions>

  clone(): ExpandQueryOptions {
    const clone = new ExpandQueryOptions(this.expandInfo?.clone(), this._selects, this.isRoot, this.parent)
    for (const expand of this._expands) {
      clone.addExpand(expand.clone())
    }

    return clone
  }

  constructor(
    expandInfo: IExpandInfo,
    selects: Array<string> | Set<string>,
    isRoot: boolean,
    parent: ExpandQueryOptions,
  ) {
    // Contracts.AssertValue(expandInfo);
    // Contracts.AssertValue(selects);
    // Contracts.AssertValueOrNull(parent);

    this.expandInfo = expandInfo

    this._selects = new Set<string>()
    this._keyColumns = new Set<string>()

    for (const select of selects) this._selects.add(select)

    const parentDataSource = this.expandInfo.parentDataSource as IExternalTabularDataSource
    var keyColumns = parentDataSource?.getKeyColumns(this.expandInfo) || []
    for (const keyColumn in keyColumns) this._selects.add(keyColumn)

    this._expands = new Set<ExpandQueryOptions>()
    this.isRoot = isRoot
    this.parent = parent
  }

  public selectsEqualKeyColumns(): boolean {
    return this._keyColumns.size == this._selects.size
  }

  public get selects() {
    return this._selects
  }

  // List of entities reachable from this node.
  public get expands() {
    return this._expands
  }

  public addSelect(selectColumnName: string) {
    if (isNullOrEmpty(selectColumnName)) return false

    const parentDataSource = this.expandInfo.parentDataSource as IExternalTabularDataSource
    if (!parentDataSource.canIncludeSelect(selectColumnName, this.expandInfo)) return false

    this._selects.add(selectColumnName)
    return true
  }

  public addRelatedColumns() {
    if (!IsIExternalCdsDataSource(this.expandInfo.parentDataSource)) {
      return
    }
    const CdsDataSourceInfo = this.expandInfo.parentDataSource as IExternalCdsDataSource
    const selectColumnNames = new Set<string>([...this._selects])
    for (const select in selectColumnNames) {
      const rst = CdsDataSourceInfo.tryGetRelatedColumn(select)
      const additionalColumnName = rst[1]
      if (rst[0] && !this._selects.has(additionalColumnName)) {
        // Add the Annotated value in case a navigation field is referred in selects. (ex: if the Datasource is Accounts and primarycontactid is in selects also append _primarycontactid_value)
        this._selects.add(additionalColumnName)
      }
    }
  }

  /// <summary>
  /// Remove expands and replace it with annotated select column
  /// </summary>
  replaceExpandsWithAnnotation(expand: ExpandQueryOptions): boolean {
    this.removeExpand(expand)
    var selectColumnName = expand.expandInfo.expandPath.entityName
    if (isNullOrEmpty(selectColumnName)) return false

    if (this.expandInfo.parentDataSource == null || !IsIExternalCdsDataSource(this.expandInfo.parentDataSource)) {
      return false
    }
    const parentDataSource = this.expandInfo.parentDataSource as IExternalCdsDataSource
    const result1 = parentDataSource.document.globalScope.tryGetCdsDataSourceWithLogicalName(
      parentDataSource.datasetName,
      this.expandInfo.identity,
    )
    const expandDataSourceInfo = result1[1]
    if (!result1[0] || expandDataSourceInfo == null) {
      return false
    }
    const result2 = parentDataSource.tryGetRelatedColumn(selectColumnName, expandDataSourceInfo.tableDefinition)
    const additionalColumnName = result2[1]
    if (additionalColumnName == null || this._selects.has(additionalColumnName)) {
      return false
    }
    this._selects.add(additionalColumnName)
    return true
  }

  addExpandWithOut(expandInfoToAdd: IExpandInfo): [boolean, ExpandQueryOptions] {
    let expand: ExpandQueryOptions
    if (expandInfoToAdd == null) {
      expand = undefined
      return [false, expand]
    }

    var parentDataSource = this.expandInfo.parentDataSource as IExternalTabularDataSource
    if (!parentDataSource.canIncludeExpand(expandInfoToAdd, this.expandInfo)) {
      expand = undefined
      return [false, expand]
    }

    expand = ExpandQueryOptions.CreateExpandQueryOptions(expandInfoToAdd)

    return [this.addExpand(expand), expand]
  }

  private addExpand(expand: ExpandQueryOptions): boolean {
    this._expands.add(expand)
    return true
  }

  removeExpand(expand: ExpandQueryOptions): boolean {
    this._expands.delete(expand)
    return true
  }

  setExpands(expands: Set<ExpandQueryOptions> | Array<ExpandQueryOptions>) {
    this._expands = new Set<ExpandQueryOptions>(expands)
  }

  public static CreateExpandQueryOptions(entityInfo: IExpandInfo): ExpandQueryOptions {
    // Contracts.AssertValue(entityInfo);

    return new ExpandQueryOptions(entityInfo, [], true, null)
  }

  public static MergeQueryOptionsMap(
    left: Map<ExpandPath, ExpandQueryOptions>,
    right: Map<ExpandPath, ExpandQueryOptions>,
  ): Map<ExpandPath, ExpandQueryOptions> {
    const merged = new Map<ExpandPath, ExpandQueryOptions>(left)
    right.forEach((val, key) => {
      const selectedProjection = merged.get(val.expandInfo.expandPath)
      if (selectedProjection == null) {
        merged.set(val.expandInfo.expandPath, val.clone())
      } else {
        ExpandQueryOptions.MergeQueryOptions(selectedProjection, val)
      }
    })
    return merged
  }

  /// <summary>
  /// Helper method used to merge two different entity query options.
  /// </summary>
  public static MergeQueryOptions(original: ExpandQueryOptions, added: ExpandQueryOptions): boolean {
    // Contracts.AssertValue(original);
    // Contracts.AssertValue(added);

    if (original == added) return false

    let isOriginalModified = false

    // Update selectedfields first.
    for (const selectedFieldToAdd of added.selects) {
      if (original.selects.has(selectedFieldToAdd)) continue

      original.addSelect(selectedFieldToAdd)
      isOriginalModified = true
    }

    if (original.expands.size == 0 && added.expands.size > 0) {
      original.setExpands(added.expands)
      return true
    }

    // Go through reachable entity list and update each of it same way.
    const entityPathToQueryOptionsMap = new Map<ExpandPath, ExpandQueryOptions>()
    for (const expand of original.expands) {
      if (!entityPathToQueryOptionsMap.has(expand.expandInfo.expandPath))
        entityPathToQueryOptionsMap.set(expand.expandInfo.expandPath, expand?.clone())
    }

    for (const expand of added.expands) {
      if (!entityPathToQueryOptionsMap.has(expand.expandInfo.expandPath)) {
        original.addExpand(expand)
        isOriginalModified = true
      } else {
        isOriginalModified =
          isOriginalModified ||
          ExpandQueryOptions.MergeQueryOptions(entityPathToQueryOptionsMap.get(expand.expandInfo.expandPath), expand)
      }
    }

    return isOriginalModified
  }

  public appendDataEntity(expandInfo: IExpandInfo): ExpandQueryOptions {
    const queryOptions = ExpandQueryOptions.CreateExpandQueryOptions(expandInfo)
    for (const currentExpand of this.expands) {
      if (!currentExpand.expandInfo.equals(queryOptions.expandInfo)) continue

      for (const qoSelect of queryOptions.selects) currentExpand.addSelect(qoSelect)

      return currentExpand
    }

    const expand = new ExpandQueryOptions(queryOptions.expandInfo, queryOptions.selects, false, this)
    this.addExpand(expand)
    return expand
  }

  toDebugObject(): Map<string, object> {
    const jsonArrSelects: string[] = []

    for (const select of this.selects) {
      jsonArrSelects.push(select)
    }

    const expands: any[] = []
    for (const expand of this.expands) {
      expands.push({
        expandInfo: expand.expandInfo.toDebugString(),
        expandOptions: expand.toDebugObject(),
      })
    }

    const def = new Map<string, any>([
      ['propertyName', this.expandInfo.name],
      ['selects', jsonArrSelects],
      ['expands', expands],
    ])

    return def
  }

  get hasManyToOneExpand(): boolean {
    for (const expand of this.expands) {
      if (!expand.expandInfo.isTable) return true
    }

    return false
  }
}
