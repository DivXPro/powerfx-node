/// All hosts should use <see cref="DefaultEnabledFeatures"/> except for Canvas Apps (legacy flag support)
/// This interface and the flags in it should be deprecated once the below flags are removed from Canvas Apps
/// DO NOT add flags to this clas without very strong justification. We do not want to allow PowerFx
/// behavior to be different between target platforms.
export interface IExternalEnabledFeatures {
  isEnhancedDelegationEnabled: boolean
  isProjectionMappingEnabled: boolean
  isEnableRowScopeOneToNExpandEnabled: boolean
  isUseDisplayNameMetadataEnabled: boolean
  isDynamicSchemaEnabled: boolean
}

export class DefaultEnabledFeatures implements IExternalEnabledFeatures {
  isEnhancedDelegationEnabled: boolean = true
  isProjectionMappingEnabled: boolean = true
  isEnableRowScopeOneToNExpandEnabled: boolean = true
  isUseDisplayNameMetadataEnabled: boolean = true
  isDynamicSchemaEnabled: boolean = true
}
