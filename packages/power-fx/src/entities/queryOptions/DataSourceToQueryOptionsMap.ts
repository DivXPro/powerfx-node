import { DType } from '../../types/DType'
import { ExpandPath } from '../../types/ExpandPath'
import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { IExternalTabularDataSource } from '../external/IExternalTabularDataSource'
import { TabularDataQueryOptions } from './TabularDataQueryOptions'

export class DataSourceToQueryOptionsMap {
  private readonly _tabularDataQueryOptionsSet = new Map<DName, TabularDataQueryOptions>()

  public hasTabualarDataSource(tabularDataSource: DName | IExternalTabularDataSource) {
    if (tabularDataSource instanceof DName) {
      return this._tabularDataQueryOptionsSet.has(tabularDataSource)
    }
    return this._tabularDataQueryOptionsSet.has(tabularDataSource.entityName)
  }

  /// <summary>
  /// Adds Associated data source entry if it is valid and not already added to rule.
  /// </summary>
  /// <param name="tabularDataSourceInfo"></param>
  /// <returns>true if this operation resulted in change.</returns>
  public addDataSource(tabularDataSourceInfo: IExternalTabularDataSource) {
    if (tabularDataSourceInfo == null || this._tabularDataQueryOptionsSet.has(tabularDataSourceInfo.entityName))
      return false

    this._tabularDataQueryOptionsSet.set(
      tabularDataSourceInfo.entityName,
      new TabularDataQueryOptions(tabularDataSourceInfo),
    )
    return true
  }

  public getOrCreateQueryOptions(tabularDataSourceInfo: IExternalTabularDataSource): TabularDataQueryOptions {
    if (tabularDataSourceInfo == null) return null

    if (this._tabularDataQueryOptionsSet.has(tabularDataSourceInfo.entityName))
      return this._tabularDataQueryOptionsSet.get(tabularDataSourceInfo.entityName)

    const newEntry = new TabularDataQueryOptions(tabularDataSourceInfo)
    this._tabularDataQueryOptionsSet.set(tabularDataSourceInfo.entityName, newEntry)
    return newEntry
  }

  public getQueryOptions(tabularDataSourceInfo: IExternalTabularDataSource): TabularDataQueryOptions {
    if (tabularDataSourceInfo == null) return null

    return this.getQueryOptionsByDName(tabularDataSourceInfo.entityName)
  }

  public getQueryOptionsByDName(tabularDataSourceInfoName: DName) {
    // Contracts.AssertValid(tabularDataSourceInfoName);

    if (this._tabularDataQueryOptionsSet.has(tabularDataSourceInfoName))
      return this._tabularDataQueryOptionsSet.get(tabularDataSourceInfoName)

    return null
  }

  public getQueryOptionsArray(): TabularDataQueryOptions[] {
    const arr: TabularDataQueryOptions[] = []
    this._tabularDataQueryOptionsSet.forEach((val) => arr.push(val))
    return arr
  }

  toDebugObject(): Map<string, object> {
    try {
      const debugObj = new Map<string, object>()
      for (const kvp of this._tabularDataQueryOptionsSet) {
        debugObj.set(kvp[0].toString(), kvp[1].toDebugObject())
      }
      return debugObj
    } catch (error: any) {
      return new Map<string, object>([
        ['message', error.message],
        ['stacktrace', error.stack],
      ])
    }
  }

  /// <summary>
  /// Adds select column to tabular datasource data call.
  /// </summary>
  /// <param name="tabularDataSourceInfo"></param>
  /// <param name="selectFieldName"></param>
  /// <returns></returns>
  addSelect(tabularDataSourceInfo: IExternalTabularDataSource, selectFieldName: DName): boolean {
    this.addDataSource(tabularDataSourceInfo)

    let returnVal = false
    returnVal ||= this._tabularDataQueryOptionsSet
      .get(tabularDataSourceInfo.entityName)
      .addSelect(selectFieldName.toString())
    returnVal ||= tabularDataSourceInfo.queryOptions.addSelect(selectFieldName.toString())

    return returnVal
  }

  public hasExpand(logicalName: string): boolean {
    for (const qOptions of this._tabularDataQueryOptionsSet) {
      for (const value of qOptions[1].expandDTypes.values()) {
        if (value.expandInfo?.identity == logicalName) return true
      }
    }
    return false
  }

  getExpandDTypes(dsInfo: IExternalTabularDataSource): Dictionary<ExpandPath, DType> {
    var queryOptions = this.getOrCreateQueryOptions(dsInfo)

    return queryOptions.expandDTypes
  }

  getValues(): TabularDataQueryOptions[] {
    const arr: TabularDataQueryOptions[] = []
    this._tabularDataQueryOptionsSet.forEach((val) => {
      arr.push(val)
    })
    return arr
  }

  get hasAnyExpand() {
    for (const qOptions of this._tabularDataQueryOptionsSet) {
      if (qOptions[1].expands.size > 0) return true
    }

    return false
  }

  get hasNestedManyToOneExpands() {
    for (const qOptions of this._tabularDataQueryOptionsSet) {
      if (qOptions[1].hasNestedManyToOneExpands()) return true
    }
    return false
  }
}
