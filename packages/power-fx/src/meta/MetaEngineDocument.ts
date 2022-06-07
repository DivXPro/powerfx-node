import { IExternalDocumentProperties } from '../app/IExternalDocumentProperties'
import { MetaEntityScope } from './MetaEntityScope'
import { IExternalDocument } from '../app/IExternalDocument'
import { IExternalControl } from '../app/controls/IExternalControl'
import { DPath } from '../utils'
import { MetaDataEntityMetadataProvider } from './external/MetaDataEntityMetadataProvider'
import { MetaDataExpandInfo } from './external/MetaDataExpandInfo'
import { DKind, ExpandPath } from '../types'
import {
  ExternalType,
  ExternalTypeKind,
  FormulaValueStatic,
  NamedValue,
} from '../public'
import { DataEntityValue, FlowValue } from '../interpreter'
import { IRContext } from '../ir'
import { MetaFlowMetadataProvider } from './external/MetaFlowMetadataProvider'
import { MetaFlowInfo } from './external/MetaFlowInfo'

export class MetaEngineDocument implements IExternalDocument {
  public globalScope: MetaEntityScope
  public properties: IExternalDocumentProperties
  public dataEntityMetadataProvider: MetaDataEntityMetadataProvider
  public flowMetadataProvider: MetaFlowMetadataProvider

  constructor(
    globalScope: MetaEntityScope,
    dataEntityMetadataProvider?: MetaDataEntityMetadataProvider,
    flowEntityMetadataProvider?: MetaFlowMetadataProvider,
    properties?: IExternalDocumentProperties
  ) {
    this.globalScope = globalScope
    this.dataEntityMetadataProvider = dataEntityMetadataProvider
    this.flowMetadataProvider = flowEntityMetadataProvider
    this.properties = properties
    this.dataEntityMetadataProvider?.setDocument(this)
    this.flowMetadataProvider?.setDocument(this)
  }

  tryGetControlByUniqueId(identity: string): [boolean, IExternalControl] {
    return [false, undefined]
  }

  public tryGetFieldEntity(path: DPath) {
    return this.globalScope.tryGetFieldEntity(path)
  }

  public getFormControlByUniqueId(id: string) {
    return this.globalScope.findFormControl(id)
  }

  public get controlValues() {
    return this.globalScope.controlsValue
  }

  public get dataEntityValues() {
    const formulaType = new ExternalType(
      ExternalTypeKind.Object,
      DKind.DataEntity
    )
    const dataEntityValueRecords =
      this.dataEntityMetadataProvider.entityMetadatas
        .map(
          (dataEntity) =>
            new DataEntityValue(IRContext.NotInSource(formulaType), dataEntity)
        )
        .map(
          (dataEntityValue) =>
            new NamedValue(dataEntityValue.value.entityName, dataEntityValue)
        )
    return FormulaValueStatic.RecordFromFields(dataEntityValueRecords)
  }

  public get flowValues() {
    const formulaType = new ExternalType(ExternalTypeKind.Object, DKind.Flow)
    const flowValuesRecords = this.flowMetadataProvider.flowMetadatas
      .map((flow) => new FlowValue(IRContext.NotInSource(formulaType), flow))
      .map((flowValue) => new NamedValue(flowValue.value.identity, flowValue))
    return FormulaValueStatic.RecordFromFields(flowValuesRecords)
  }

  public get formFields() {
    return this.globalScope.formFields
  }

  public getDataEntity(identity: string) {
    return this.dataEntityMetadataProvider?.getEntityMetadata(identity)
  }

  public getDataEntityInfo(identity: string) {
    const dataEntityMetadata = this.getDataEntity(identity)
    return dataEntityMetadata
      ? new MetaDataExpandInfo({
          identity,
          expandPath: new ExpandPath(
            dataEntityMetadata.datasetName,
            dataEntityMetadata.entityName
          ),
          isTable: true,
          name: dataEntityMetadata.entityName,
          parentDataSource:
            this.dataEntityMetadataProvider.getDataSource(identity),
          polymorphicParent: undefined,
        })
      : undefined
  }

  public getFlow(identity: string) {
    return this.flowMetadataProvider?.getFlowMetadata(identity)
  }

  public getFlowInfo(identity: string) {
    const flowMetadata = this.getFlow(identity)
    return flowMetadata
      ? new MetaFlowInfo({
          identity,
          name: flowMetadata.name,
          flow: flowMetadata.flow,
        })
      : undefined
  }

  public getAllDataEntities() {
    return this.dataEntityMetadataProvider?.entityMetadatas
  }

  public getAllFlows() {
    return this.flowMetadataProvider?.flowMetadatas
  }
}
