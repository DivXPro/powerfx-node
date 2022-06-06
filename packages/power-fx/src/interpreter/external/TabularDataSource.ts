import { IExternalTabularDataSource } from '../../entities/external/IExternalTabularDataSource'
import { DataSource, IDataSourceProps } from './DataSource'
import { BidirectionalDictionary } from '../../utilityDataStructures/BidirectionalDictionary'
import { TabularDataQueryOptions } from '../../entities/queryOptions/TabularDataQueryOptions'
import { IExpandInfo } from '../../types'

export interface ITabularDataSourceProps extends IDataSourceProps {
  displayNameMapping: Record<string, string>
  previousDisplayNameMapping: Record<string, string>
  // queryOptions: TabularDataQueryOptions
}

export class TabularDataSource extends DataSource implements IExternalTabularDataSource {
  public displayNameMapping: BidirectionalDictionary<string, string> = new BidirectionalDictionary()
  public isConvertingDisplayNameMapping: boolean
  public previousDisplayNameMapping: BidirectionalDictionary<string, string> = new BidirectionalDictionary()
  public queryOptions: TabularDataQueryOptions

  constructor(props: ITabularDataSourceProps) {
    super(props)
    for (const first in props.displayNameMapping) {
      this.displayNameMapping.add(first, props.displayNameMapping[first])
    }
    for (const first in props.previousDisplayNameMapping) {
      this.previousDisplayNameMapping.add(first, props.previousDisplayNameMapping[first])
    }
    this.queryOptions = new TabularDataQueryOptions(this)
  }

  canIncludeExpand(expandToAdd: IExpandInfo, parentExpandInfo?: IExpandInfo): boolean {
    return false
  }

  canIncludeSelect(selectColumnName: string, expandInfo?: IExpandInfo): boolean {
    return false
  }

  getKeyColumns(expandInfo?: IExpandInfo): Array<string> {
    return undefined
  }
}
