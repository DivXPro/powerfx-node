import { TexlBinding } from '../../binding/Binder'
import { DataSourceToQueryOptionsMap } from '../../entities/queryOptions/DataSourceToQueryOptionsMap'
import { TexlFunction } from '../../functions/TexlFunction'
import { DelegationStatus } from '../../logging/trackers/DelegationStatus'
import { DelegationTelemetryInfo } from '../../logging/trackers/DelegationTelemetryInfo'
import { TexlNode } from '../../syntax'
import { Dictionary } from '../../utils/Dictionary'
import { IExternalDocument } from '../IExternalDocument'

export interface IExternalRule {
  texlNodeQueryOptions: Dictionary<number, DataSourceToQueryOptionsMap>
  document: IExternalDocument
  binding: TexlBinding
  hasErrors: boolean
  hasControlPropertyDependency(): boolean
  setDelegationTrackerStatus(
    node: TexlNode,
    status: DelegationStatus,
    logInfo: DelegationTelemetryInfo,
    func: TexlFunction,
  ): void
}
