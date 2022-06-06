import { FormulaValue } from '../public/values'
import { IExternalControl, IsIExternalControl } from '../app/controls/IExternalControl'
import { IExternalControlProperty } from '../app/controls/IExternalControlProperty'
import { IExternalDocument } from '../app/IExternalDocument'
import { IExternalEntity } from '../entities/external/IExternalEntity'
import { IExternalEntityScope } from '../entities/external/IExternalEntityScope'
import { TexlFunction } from '../functions/TexlFunction'
import { DType } from '../types/DType'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { NameLookupInfo } from './bindingInfo'

export enum NameLookupPreferences {
  None = 0,
  GlobalsOnly = 0x1,
  HasDottedNameParent = 0x2,
}

export interface INameResolver {
  document: IExternalDocument
  entityScope: IExternalEntityScope
  currentEntity: IExternalEntity
  currentProperty: DName
  currentEntityPath: DPath
  currentPropertyIsBehavior: boolean
  currentPropertyIsConstantData: boolean
  currentPropertyAllowsNavigation: boolean
  functions: TexlFunction[]

  // Look up an entity, context variable, or entity part (e.g. enum value) by name.
  lookup(name: DName, preferences: NameLookupPreferences): [boolean, NameLookupInfo]

  tryGetInnermostThisItemScope(): [boolean, NameLookupInfo]

  // Look up the data control associated with the current entity+property path, given a ThisItem identifier
  lookupDataControl(name: DName): [boolean, { lookupInfo: NameLookupInfo; dataControlName: DName }]

  // Look up a list of functions (and overloads) by namespace and name.
  lookupFunctions(theNamespace: DPath, name: string, localeInvariant?: boolean): TexlFunction[]

  /// <returns>
  /// List of functions in <see cref="nameSpace"/>
  /// </returns>
  lookupFunctionsInNamespace(nameSpace: DPath): TexlFunction[]

  // Return true if the specified boxed enum info contains a value for the given locale-specific name.
  lookupEnumValueByInfoAndLocName(enumInfo: any, locName: DName): [boolean, any]

  // Return true if the specified enum type contains a value for the given locale-specific name.
  lookupEnumValueByTypeAndLocName(enumType: DType, locName: DName): [boolean, any]
  // Looks up the parent control for the current context.
  lookupParent(): [boolean, NameLookupInfo]

  // Looks up the current control for the current context.
  lookupSelf(): [boolean, NameLookupInfo]

  // Looks up the global entity.
  lookupGlobalEntity(name: DName): [boolean, NameLookupInfo]

  tryLookupEnum(name: DName): [boolean, NameLookupInfo]

  tryGetCurrentControlProperty(): [boolean, IExternalControlProperty]

  lookupFormulaValuesIn(path: string): FormulaValue
}

export class NameResolverExtensions {
  static TryGetCurrentControlProperty(resolver: INameResolver): [boolean, IExternalControlProperty] {
    let currentProperty: IExternalControlProperty
    // If the current entity is a control and valid
    if (IsIExternalControl(resolver.currentEntity) && resolver?.currentProperty?.isValid) {
      const result = resolver.currentEntity.template.tryGetInputProperty(resolver.currentProperty.value)
      const currentProperty = result[1]
      return [true, currentProperty]
    }

    currentProperty = undefined
    return [false, currentProperty]
  }
}
