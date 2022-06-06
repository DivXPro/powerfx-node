import { IExternalOptionSet } from '../../entities/external/IExternalOptionSet'
import { FormulaType, SingleSourceDisplayNameProvider } from '../../public'
import { DType } from '../../types'
import { Dictionary, DName } from '../../utils'
import { OptionSetValue } from '../../public/values/OptionSetValue'
import { IRContext } from '../../ir'

export class OptionSet implements IExternalOptionSet {
  private readonly _displayNameProvider: SingleSourceDisplayNameProvider
  private readonly _type: DType

  // Name of the option set, referenceable from expressions.
  private _entityName: DName
  public get entityName() {
    return this._entityName
  }

  // Contains the members of the option set.
  // Key is logical/invariant name, value is display name.
  private _options: Dictionary<DName, DName>
  public get options() {
    return this._options
  }

  private _formulaType: FormulaType
  public get formulaType() {
    return this._formulaType
  }

  /// <summary>
  /// Initializes a new instance of the <see cref="OptionSet"/> class.
  /// </summary>
  /// <param name="name">The name of the option set. Will be available as a global name in Power Fx expressions.</param>
  /// <param name="options">The members of the option set. Dictionary of logical name to display name.</param>
  constructor(name: string, options: Dictionary<string, string>) {
    this._entityName = new DName(name)
    this._options = new Dictionary<DName, DName>(
      Array.from(options.keys()).map((key) => {
        return [new DName(key), new DName(options.get(key))]
      }),
    )

    this._displayNameProvider = new SingleSourceDisplayNameProvider(this._options)
    this._type = DType.CreateOptionSetType(this)
  }

  public tryGetValue(fieldName: DName): [boolean, OptionSetValue] {
    if (!this.options.has(fieldName)) {
      return [false, undefined]
    }
    return [true, new OptionSetValue(fieldName.value, IRContext.NotInSource(this.formulaType))]
  }

  public get optionNames() {
    return Array.from(this.options.keys())
  }

  public get displayNameProvider() {
    return this._displayNameProvider
  }

  public get isBooleanValued() {
    return false
  }

  public get isConvertingDisplayNameMapping() {
    return false
  }

  public get type() {
    return this._type
  }
}
