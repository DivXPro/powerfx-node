import { BinaryOp } from '../../lexer/BinaryOp'
import { UnaryOp } from '../../lexer/UnaryOp'
import { DType } from '../../types/DType'
import { Dictionary } from '../../utils/Dictionary'
import { DName } from '../../utils/DName'
import { DPath } from '../../utils/DPath'
import { DelegationCapability } from './DelegationCapability'

export abstract class OperationCapabilityMetadata {
  public schema: DType
  constructor(schema: DType) {
    // Contracts.AssertValid(schema);
    schema = schema
  }

  protected get columnRestrictions() {
    return new Dictionary<DPath, DelegationCapability>()
  }

  public get queryPathReplacement() {
    return new Dictionary<DPath, DPath>()
  }

  public abstract get defaultColumnCapabilities(): DelegationCapability

  public abstract get tableCapabilities(): DelegationCapability

  protected tryGetColumnRestrictions(columnPath: DPath): [boolean, DelegationCapability] {
    // Contracts.AssertValid(columnPath);
    let restrictions: DelegationCapability
    const result = this.columnRestrictions.tryGetValue(columnPath)
    restrictions = result[1]
    if (result[0]) {
      return [true, restrictions]
    }

    restrictions = new DelegationCapability(DelegationCapability.None)
    return [false, restrictions]
  }

  public tryGetColumnCapabilities(columnPath: DPath): [boolean, DelegationCapability] {
    // Contracts.AssertValid(columnPath);
    let capabilities: DelegationCapability
    // Check if it's a valid column name. As capabilities are not defined for all columns, we need to do this check.
    if (!this.schema.tryGetTypeByPath(columnPath)[0]) {
      capabilities = new DelegationCapability(DelegationCapability.None)
      return [false, capabilities]
    }

    capabilities = this.defaultColumnCapabilities

    let restrictions: DelegationCapability
    const result = this.tryGetColumnRestrictions(columnPath)
    restrictions = result[1]
    if (result[0]) {
      // capabilities &= ~restrictions;
      capabilities = DelegationCapability.LogicAnd(capabilities, DelegationCapability.BitwiseComplement(restrictions))
    }

    return [true, capabilities]
  }

  public isDelegationSupportedByColumn(columnPath: DPath, delegationCapability: DelegationCapability) {
    // Contracts.AssertValid(columnPath);

    // Only the first part of the path can have been renamed
    const result = DType.TryGetLogicalNameForColumn(this.schema, columnPath.at(0).toString())
    const logicalName = result[1]
    if (result[0]) {
      var renamedColumnPath = DPath.Root
      renamedColumnPath = renamedColumnPath.append(new DName(logicalName))
      for (let i = 1; i < columnPath.length; ++i) {
        renamedColumnPath = renamedColumnPath.append(new DName(columnPath.at(i).toString()))
      }

      columnPath = renamedColumnPath
    }
    const rst = this.tryGetColumnCapabilities(columnPath)
    return rst[0] && rst[1].hasCapability(delegationCapability.capabilities)
    // return this.tryGetColumnCapabilities(columnPath, out var columnCapabilities) && columnCapabilities.HasCapability(delegationCapability.Capabilities);
  }

  public isDelegationSupportedByTable(delegationCapability: DelegationCapability) {
    return this.defaultColumnCapabilities.hasCapability(delegationCapability.capabilities)
  }

  public isUnaryOpSupportedByTable(op: UnaryOp) {
    if (!this.isUnaryOpInDelegationSupported(op)) {
      return false
    }

    // Contracts.Assert(DelegationCapability.UnaryOpToDelegationCapabilityMap.ContainsKey(op));

    return this.isDelegationSupportedByTable(DelegationCapability.UnaryOpToDelegationCapabilityMap.get(op))
  }

  public isBinaryOpSupportedByTable(op: BinaryOp) {
    if (!this.isBinaryOpInDelegationSupported(op)) {
      return false
    }

    // Contracts.Assert(DelegationCapability.BinaryOpToDelegationCapabilityMap.ContainsKey(op));

    return this.isDelegationSupportedByTable(DelegationCapability.BinaryOpToDelegationCapabilityMap.get(op))
  }

  public isUnaryOpInDelegationSupported(op: UnaryOp) {
    // Check if unary op is supported
    switch (op) {
      case UnaryOp.Not:
      case UnaryOp.Minus:
        break
      default:
        return false
    }

    return true
  }

  public isBinaryOpInDelegationSupported(op: BinaryOp) {
    // Check if binary op is supported
    switch (op) {
      case BinaryOp.Equal:
      case BinaryOp.NotEqual:
      case BinaryOp.Less:
      case BinaryOp.LessEqual:
      case BinaryOp.Greater:
      case BinaryOp.GreaterEqual:
      case BinaryOp.And:
      case BinaryOp.Or:
      case BinaryOp.In:
      case BinaryOp.Add:
      case BinaryOp.Mul:
      case BinaryOp.Div:
        break
      default:
        return false
    }

    return true
  }

  public isBinaryOpInDelegationSupportedByColumn(op: BinaryOp, columnPath: DPath) {
    // Contracts.AssertValid(columnPath);

    if (!this.isBinaryOpInDelegationSupported(op)) {
      return false
    }

    // Contracts.Assert(DelegationCapability.BinaryOpToDelegationCapabilityMap.ContainsKey(op));

    return this.isDelegationSupportedByColumn(
      columnPath,
      DelegationCapability.BinaryOpToDelegationCapabilityMap.get(op),
    )
  }

  public isUnaryOpInDelegationSupportedByColumn(op: UnaryOp, columnPath: DPath) {
    // Contracts.AssertValid(columnPath)

    if (!this.isUnaryOpInDelegationSupported(op)) {
      return false
    }

    // Contracts.Assert(DelegationCapability.UnaryOpToDelegationCapabilityMap.ContainsKey(op))

    return this.isDelegationSupportedByColumn(columnPath, DelegationCapability.UnaryOpToDelegationCapabilityMap.get(op))
  }
}
