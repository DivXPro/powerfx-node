import { IExternalTabularDataSource } from '../entities/external/IExternalTabularDataSource'
import { DataSourceToQueryOptionsMap } from '../entities/queryOptions/DataSourceToQueryOptionsMap'
import { DName } from '../utils/DName'
import { DType } from './DType'

export class DTypeHelper {
  //实现Dtype扩展方法
  public static AssociateDataSourcesToSelect(
    self: DType,
    dataSourceToQueryOptionsMap: DataSourceToQueryOptionsMap,
    columnName: string,
    columnType: DType,
    skipIfNotInSchema = false,
    skipExpands = false,
  ): boolean {
    // Contracts.AssertValue(dataSourceToQueryOptionsMap);
    // Contracts.AssertNonEmpty(columnName);
    // Contracts.AssertValue(columnType);

    var retval = false
    if (self.hasExpandInfo && self.expandInfo != null && !skipExpands) {
      var qOptions = dataSourceToQueryOptionsMap.getOrCreateQueryOptions(
        self.expandInfo.parentDataSource as IExternalTabularDataSource,
      )
      let AddExpand = qOptions.addExpand(self.expandInfo)
      let expandQueryOptions = AddExpand[1]
      retval = retval || AddExpand[0]
      if (expandQueryOptions != null) {
        retval = retval || expandQueryOptions.addSelect(columnName)
      }
    } else {
      for (let tabularDataSource of self.associatedDataSources) {
        // Skip if this column doesn't belong to this datasource.
        if (skipIfNotInSchema && !tabularDataSource.schema.contains(new DName(columnName))) {
          continue
        }

        retval =
          retval ||
          dataSourceToQueryOptionsMap.addSelect(<IExternalTabularDataSource>tabularDataSource, new DName(columnName))

        if (columnType.isExpandEntity && columnType.expandInfo != null && !skipExpands) {
          var scopedExpandInfo = columnType.expandInfo
          var qOptions = dataSourceToQueryOptionsMap.getOrCreateQueryOptions(
            scopedExpandInfo.parentDataSource as IExternalTabularDataSource,
          )
          let AddExpand2 = qOptions.addExpand(scopedExpandInfo)
          retval = retval || AddExpand2[0] //qOptions.AddExpand(scopedExpandInfo, out _);
        }
      }
    }

    return retval
  }
}
