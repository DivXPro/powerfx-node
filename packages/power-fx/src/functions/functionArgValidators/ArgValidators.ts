import { DelegatableDataSourceInfoValidator } from './ConnectedDataSourceInfoArgValidator'
import { DataSourceArgNodeValidator } from './DataSourceArgNodeValidator'
import { EntityArgNodeValidator } from './EntityArgNodeValidator'
import { SortOrderValidator } from './SortOrderValidator'
import { FlowArgNodeValidator } from './FlowArgNodeValidator'

export class ArgValidators {
  public static readonly SortOrderValidator = new SortOrderValidator()
  public static readonly DelegatableDataSourceInfoValidator = new DelegatableDataSourceInfoValidator()
  public static readonly DataSourceArgNodeValidator = new DataSourceArgNodeValidator()
  public static readonly EntityArgNodeValidator = new EntityArgNodeValidator()
  public static readonly FlowArgNodeValidator = new FlowArgNodeValidator()
}
