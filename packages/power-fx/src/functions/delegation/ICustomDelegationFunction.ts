export interface ICustomDelegationFunction {
  // This exists to push a feature gate dependence out of PowerFx.
  // Once AllowUserDelegation is cleaned up, this can be removed
  isUserCallNodeDelegable(): boolean
}

export function IsICustomDelegationFunction(obj: any) {
  return typeof obj.isUserCallNodeDelegable === 'function'
}
