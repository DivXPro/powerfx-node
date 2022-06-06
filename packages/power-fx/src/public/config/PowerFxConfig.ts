import { EnumStore } from '../../types/enums'
import { CultureInfo } from '../../utils/CultureInfo'
import { IExternalEntity } from '../../entities/external/IExternalEntity'
import { TexlFunction } from '../../functions/TexlFunction'
import { Dictionary, DName } from '../../utils'

export class PowerFxConfig {
  private readonly _extraFunctions: Dictionary<string, TexlFunction>
  private readonly _environmentSymbols: Dictionary<DName, IExternalEntity>

  public get extraFunctions() {
    return this._extraFunctions
  }

  public get environmentSymbols() {
    return this._environmentSymbols
  }

  private readonly _enumStore: EnumStore
  private readonly _cultureInfo: CultureInfo

  public get enumStore(): EnumStore {
    return this._enumStore
  }
  public get cultureInfo(): CultureInfo {
    return this._cultureInfo
  }

  constructor(cultureInfo?: CultureInfo, enumStore: EnumStore = new EnumStore()) {
    this._cultureInfo = cultureInfo ?? CultureInfo.CurrentCulture
    this._extraFunctions = new Dictionary<string, TexlFunction>()
    this._environmentSymbols = new Dictionary<DName, IExternalEntity>()

    this._enumStore = enumStore
  }

  public static BuildWithEnumStore(cultureInfo: CultureInfo, enumStore: EnumStore) {
    return new PowerFxConfig(cultureInfo, enumStore)
  }

  addEntity(entity: IExternalEntity) {
    this._environmentSymbols.set(entity.entityName, entity)
  }

  addFunction(func: TexlFunction) {
    this._extraFunctions.set(func.getUniqueTexlRuntimeName(), func)
  }
}
