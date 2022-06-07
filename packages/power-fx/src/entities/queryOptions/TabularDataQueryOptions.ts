import { TexlBinding } from '../../binding/Binder'
import { DType } from '../../types/DType'
import { ExpandPath } from '../../types/ExpandPath'
import { IExpandInfo } from '../../types/IExpandInfo'
import { isNullOrEmpty } from '../../utils/CharacterUtils'
import { Dictionary } from '../../utils/Dictionary'
import {
  IExternalCdsDataSource,
  IsIExternalCdsDataSource,
} from '../external/IExternalCdsDataSource'
import { IExternalTabularDataSource } from '../external/IExternalTabularDataSource'
import { ExpandQueryOptions } from './ExpandQueryOptions'

export class TabularDataQueryOptions {
  public tabularDataSourceInfo: IExternalTabularDataSource
  public expandDTypes: Dictionary<ExpandPath, DType>
  private _selects: Set<string>
  private _expandQueryOptions: Dictionary<ExpandPath, ExpandQueryOptions>

  public get selects() {
    return Array.from(this._selects)
  }

  public get expandQueryOptions() {
    return this._expandQueryOptions
  }

  public get expands() {
    return this._expandQueryOptions
  }

  /// <summary>
  /// List of navigation datasources and their query options
  /// </summary>
  // public IReadOnlyDictionary<ExpandPath, ExpandQueryOptions> Expands { get { return _expandQueryOptions; } }

  // private Dictionary<ExpandPath, ExpandQueryOptions> _expandQueryOptions { get; }

  // public Dictionary<ExpandPath, DType> ExpandDTypes { get; }

  constructor(tabularDataSourceInfo: IExternalTabularDataSource) {
    this.tabularDataSourceInfo = tabularDataSourceInfo
    this._selects = new Set<string>()
    const keyColumns = tabularDataSourceInfo.getKeyColumns()
    for (const keyColumn in keyColumns) this._selects.add(keyColumn)

    this._expandQueryOptions = new Dictionary<ExpandPath, ExpandQueryOptions>()
    this.expandDTypes = new Dictionary<ExpandPath, DType>()
  }

  public addSelect(selectColumnName: string): boolean {
    if (isNullOrEmpty(selectColumnName)) return false

    if (
      this._selects.has(selectColumnName) ||
      !this.tabularDataSourceInfo.canIncludeSelect(selectColumnName)
    ) {
      return false
    }

    this._selects.add(selectColumnName)
    return true
  }

  public addSelectMultiple(_selects: Array<string>) {
    if (_selects == null) {
      return false
    }

    let retVal = false

    for (const select in _selects) {
      retVal ||= this.addSelect(select)
    }

    return retVal
  }
  /// <summary>
  /// Helper method used to add related columns like annotated columns for cds navigation fields. ex: _primarycontactid_value
  /// </summary>
  public addRelatedColumns() {
    if (!IsIExternalCdsDataSource(this.tabularDataSourceInfo)) {
      return
    }
    let cdsDataSourceInfo = this.tabularDataSourceInfo as IExternalCdsDataSource
    let selectColumnNames = new Set<string>([...this._selects])
    for (const select of selectColumnNames) {
      const result = cdsDataSourceInfo.tryGetRelatedColumn(select)
      const additionalColumnName = result[1]
      if (result[0] && !this._selects.has(additionalColumnName)) {
        // Add the Annotated value in case a navigation field is referred in selects. (ex: if the Datasource is Accounts and primarycontactid is in selects also append _primarycontactid_value)
        this._selects.add(additionalColumnName)
      }
    }
  }

  public get hasNonKeySelects() {
    if (!this.tabularDataSourceInfo.isSelectable) return false

    // Contracts.Assert(TabularDataSourceInfo.GetKeyColumns().All(x => _selects.Contains(x)));

    return (
      this.tabularDataSourceInfo.getKeyColumns().length < this._selects.size &&
      this._selects.size < TexlBinding.MaxSelectsToInclude
    )
  }

  replaceExpandsWithAnnotation(expand: ExpandQueryOptions): boolean {
    // Contracts.AssertValue(expand);
    this.removeExpand(expand.expandInfo)
    const selectColumnName = expand.expandInfo.expandPath.entityName
    if (
      isNullOrEmpty(selectColumnName) ||
      !IsIExternalCdsDataSource(this.tabularDataSourceInfo)
    )
      return false
    const CdsDataSourceInfo = this
      .tabularDataSourceInfo as IExternalCdsDataSource
    if (this._selects.has(selectColumnName)) {
      return false
    }
    const result = CdsDataSourceInfo.tryGetRelatedColumn(selectColumnName)
    const additionalColumnName = result[1]
    if (
      !result[0] ||
      additionalColumnName == null ||
      this._selects.has(additionalColumnName)
    ) {
      return false
    }
    this._selects.add(additionalColumnName)
    return true
  }

  addExpand(expandInfo: IExpandInfo): [boolean, ExpandQueryOptions] {
    let expandQueryOptions: ExpandQueryOptions
    if (
      expandInfo == null ||
      !this.tabularDataSourceInfo.canIncludeExpand(expandInfo)
    ) {
      expandQueryOptions = null
      return [false, expandQueryOptions]
    }

    if (this._expandQueryOptions.has(expandInfo.expandPath)) {
      expandQueryOptions = this._expandQueryOptions.get(expandInfo.expandPath)
      return [false, expandQueryOptions]
    }

    expandQueryOptions = ExpandQueryOptions.CreateExpandQueryOptions(expandInfo)
    return [
      this.addExpandWithOptions(expandInfo.expandPath, expandQueryOptions),
      expandQueryOptions,
    ]
  }

  private addExpandWithOptions(
    expandPath: ExpandPath,
    expandQueryOptions: ExpandQueryOptions
  ) {
    this._expandQueryOptions.set(expandPath, expandQueryOptions)
    return true
  }

  removeExpand(expandInfo: IExpandInfo): boolean {
    // Contracts.AssertValue(expandInfo);
    return this._expandQueryOptions.delete(expandInfo.expandPath)
  }

  tryGetExpandQueryOptions(
    expandInfo: IExpandInfo
  ): [boolean, ExpandQueryOptions] {
    let expandQueryOptions: ExpandQueryOptions
    this.expands.forEach((value, key) => {
      if (value.expandInfo.expandPath === expandInfo.expandPath) {
        expandQueryOptions = value
        return [true, expandQueryOptions]
      }
    })
    expandQueryOptions = undefined
    return [false, expandQueryOptions]
  }

  merge(qo: TabularDataQueryOptions) {
    for (const select of qo.selects) {
      this.addSelect(select)
    }

    for (const entry of qo.expands) {
      const key = entry[0]
      const value = entry[1]
      if (this.expands.has(key))
        TabularDataQueryOptions.MergeQueryOptions(this.expands.get(key), value)
      else this.addExpandWithOptions(key, value)
    }
  }

  /// <summary>
  /// Helper method used to merge two different entity query options.
  /// </summary>
  static MergeQueryOptions(
    original: ExpandQueryOptions,
    added: ExpandQueryOptions
  ): boolean {
    // Contracts.AssertValue(original);
    // Contracts.AssertValue(added);

    // Skip merge when both instances are same or any of them is null.
    if (original == added || original == null || added == null) {
      return false
    }

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
    const entityPathToQueryOptionsMap = new Map<
      ExpandPath,
      ExpandQueryOptions
    >()
    for (const expand of original.expands) {
      if (!entityPathToQueryOptionsMap.has(expand.expandInfo.expandPath))
        entityPathToQueryOptionsMap.set(expand.expandInfo.expandPath, expand)
    }

    for (const expand of added.expands) {
      if (!entityPathToQueryOptionsMap.has(expand.expandInfo.expandPath)) {
        isOriginalModified = original.addExpandWithOut(expand.expandInfo)[0]
      } else {
        isOriginalModified =
          isOriginalModified ||
          TabularDataQueryOptions.MergeQueryOptions(
            entityPathToQueryOptionsMap.get(expand.expandInfo.expandPath),
            expand
          )
      }
    }

    return isOriginalModified
  }

  appendExpandQueryOptions(mergeExpandValue: ExpandQueryOptions) {
    for (const expand of this.expands) {
      let srcExpandInfo = expand[1].expandInfo
      let mergedExpandInfo = mergeExpandValue.expandInfo
      if (
        srcExpandInfo.identity == mergedExpandInfo.identity &&
        srcExpandInfo.name == mergedExpandInfo.name &&
        srcExpandInfo.isTable == mergedExpandInfo.isTable
      ) {
        return TabularDataQueryOptions.MergeQueryOptions(
          expand[1],
          mergeExpandValue
        )
      }

      if (
        !isNullOrEmpty(
          mergeExpandValue.expandInfo.expandPath.relatedEntityPath
        ) &&
        mergeExpandValue.expandInfo.expandPath.relatedEntityPath.includes(
          expand[1].expandInfo.expandPath.entityName
        )
      ) {
        return this.appendExpandQueryOptionsWith(expand[1], mergeExpandValue)
      }
    }

    this._expandQueryOptions.set(
      mergeExpandValue.expandInfo.expandPath,
      mergeExpandValue?.clone()
    )
    return true
  }

  private appendExpandQueryOptionsWith(
    options: ExpandQueryOptions,
    mergeExpandValue: ExpandQueryOptions
  ) {
    for (const expand of options.expands) {
      if (
        expand.expandInfo.expandPath == mergeExpandValue.expandInfo.expandPath
      ) {
        return TabularDataQueryOptions.MergeQueryOptions(
          expand,
          mergeExpandValue
        )
      }
      if (
        mergeExpandValue.expandInfo.expandPath.relatedEntityPath.includes(
          expand.expandInfo.expandPath.entityName
        )
      ) {
        for (const childExpand of expand.expands) {
          if (
            this.appendExpandQueryOptionsWith(childExpand, mergeExpandValue)
          ) {
            return true
          }
        }
        return false
      }
    }
    return false
  }

  toDebugObject(): Map<string, object> {
    const selects: string[] = []

    for (const select of this.selects) {
      selects.push(select)
    }

    const expands: any[] = []
    for (const expand of this.expands) {
      expands.push({
        expandInfo: expand[1].expandInfo.toDebugString(),
        expandOptions: expand[1].toDebugObject(),
      })
    }

    const def = new Map<string, object>([
      ['selects', selects],
      ['expands', expands],
    ])

    return def
  }

  selectsSetEquals(enumerable: string[]): boolean {
    if (enumerable.length !== this._selects.size) {
      return false
    }
    enumerable.forEach((val) => {
      if (this._selects.has(val)) {
        return false
      }
    })
    return true
  }

  hasNestedManyToOneExpands(): boolean {
    for (const expandKvp of this.expands) {
      if (!expandKvp[1].expandInfo.isTable && expandKvp[1].hasManyToOneExpand) {
        return true
      }
    }
    return false
  }
}
