import { TexlBinding } from '../../binding/Binder'
import { FirstNameInfo } from '../../binding/bindingInfo'
import { IExternalDataSource } from '../../entities/external/IExternalDataSource'
import { TexlFunction } from '../../functions/TexlFunction'
import { BinaryOp } from '../../lexer/BinaryOp'
import { UnaryOp } from '../../lexer/UnaryOp'
import { TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'

export class DelegationTelemetryInfo {
  private readonly _info: string

  constructor(info: string) {
    // Contracts.AssertValue(info);

    this._info = info
  }

  public get info() {
    return this._info
  }

  public static CreateEmptyDelegationTelemetryInfo(): DelegationTelemetryInfo {
    return new DelegationTelemetryInfo('')
  }

  public static CreateBinaryOpNoSupportedInfoTelemetryInfo(
    op: BinaryOp | UnaryOp
  ): DelegationTelemetryInfo {
    return new DelegationTelemetryInfo(op.toString())
  }

  public static CreateUnaryOpNoSupportedInfoTelemetryInfo(
    op: UnaryOp
  ): DelegationTelemetryInfo {
    return new DelegationTelemetryInfo(op.toString())
  }

  public static CreateDataSourceNotDelegatableTelemetryInfo(
    ds: IExternalDataSource
  ): DelegationTelemetryInfo {
    // Contracts.AssertValue(ds);

    return new DelegationTelemetryInfo(ds.name)
  }

  public static CreateUndelegatableFunctionTelemetryInfo(
    func: TexlFunction
  ): DelegationTelemetryInfo {
    // Contracts.AssertValueOrNull(func);

    if (func == null)
      return DelegationTelemetryInfo.CreateEmptyDelegationTelemetryInfo()

    return new DelegationTelemetryInfo(func.name)
  }

  public static CreateNoDelSupportByColumnTelemetryInfo(
    info: FirstNameInfo | string
  ): DelegationTelemetryInfo {
    // Contracts.AssertValue(info);
    if (info instanceof FirstNameInfo)
      return new DelegationTelemetryInfo(info.name.toString())
    return new DelegationTelemetryInfo(info)
  }

  public static CreateImpureNodeTelemetryInfo(
    node: TexlNode,
    binding: TexlBinding = null
  ): DelegationTelemetryInfo {
    // Contracts.AssertValue(node)
    // Contracts.AssertValueOrNull(binding)

    switch (node.kind) {
      case NodeKind.Call:
        let callNode = node.asCall()
        let funcName = binding?.getInfo(callNode)?.function?.name || ''
        return new DelegationTelemetryInfo(funcName)
      default:
        return new DelegationTelemetryInfo(node.toString())
    }
  }
}
