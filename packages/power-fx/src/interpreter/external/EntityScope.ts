import { IExternalEntityScope } from '../../entities/external/IExternalEntityScope'
import { DName } from '../../utils'
import { DKind, DType } from '../../types'
import { CdsDataSource } from './CdsDataSource'
import { TabularDataSource } from './TabularDataSource'
import { TexlNode } from '../../syntax/nodes'
import { DataSource } from './DataSource'
import { IExternalEntity } from '../../entities/external/IExternalEntity'
import { Control } from '../environment'
import {
  ExternalType,
  ExternalTypeKind,
  FormulaValueStatic,
  NamedValue,
  RecordValue,
} from '../../public'
import { ControlValue } from '../values'
import { IRContext } from '../../ir'

export class EntityScope implements IExternalEntityScope {
  protected _entities: IExternalEntity[]

  public get entities() {
    return this._entities
  }

  constructor(entities?: IExternalEntity[]) {
    this._entities = entities ?? []
  }

  public get controls(): Control[] {
    return this.entities.filter(
      (entity) => entity instanceof Control
    ) as Control[]
  }

  public get controlsValue(): RecordValue {
    const formulaType = new ExternalType(ExternalTypeKind.Object, DKind.Control)
    const controlValueRecords = this.controls
      .map(
        (control) =>
          new ControlValue(IRContext.NotInSource(formulaType), control)
      )
      .map(
        (controlValue) =>
          new NamedValue(controlValue.value.entityName.toString(), controlValue)
      )
    return FormulaValueStatic.RecordFromFields(controlValueRecords)
  }

  tryGetCdsDataSourceWithLogicalName(
    datasetName: string,
    expandInfoIdentity: string
  ): [boolean, CdsDataSource] {
    const dataSource = this._entities.find(
      (entity) =>
        entity instanceof CdsDataSource &&
        entity.datasetName === datasetName &&
        entity.entityName.value === expandInfoIdentity
    ) as CdsDataSource
    return [dataSource != null, dataSource]
  }

  tryGetNamedEnum(identName: DName): [boolean, DType] {
    return [false, undefined]
  }

  getTabularDataSource(identName: string): TabularDataSource {
    return this._entities.find(
      (ds) =>
        ds instanceof TabularDataSource && ds.entityName.value === identName
    ) as TabularDataSource
  }

  tryGetDataSourceInfo(node: TexlNode): [boolean, DataSource] {
    return [false, undefined]
  }

  tryGetEntity<T>(currentEntityEntityName: DName): [boolean, T] {
    const entity = this._entities.find((ds) =>
      ds.entityName.equals(currentEntityEntityName)
    )
    return [entity != null, entity as unknown as T]
  }

  tryGetControl(currentEntityEntityName: DName): [boolean, Control] {
    const control = this.controls.find((ds) =>
      ds.entityName.equals(currentEntityEntityName)
    )
    return [control != null, control]
  }
}
