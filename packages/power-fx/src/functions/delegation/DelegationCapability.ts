import { Lazy } from '../../utils/Lazy'
import { Dictionary } from '../../utils/Dictionary'
import { BinaryOp, UnaryOp } from '../../lexer'
import { DelegationMetadataOperatorConstants } from './DelegationMetadataOperatorConstants'

// This lightweight wrapper around DelegationCababilityConstants is used to enforce valid values for capabilities.
export class DelegationCapability {
  private _capabilities: number
  private static readonly _binaryOpToDelegationCapabilityMap = new Lazy<Dictionary<BinaryOp, DelegationCapability>>(
    () =>
      new Dictionary<BinaryOp, DelegationCapability>([
        [BinaryOp.Equal, new DelegationCapability(DelegationCapability.Equal)],
        [BinaryOp.NotEqual, new DelegationCapability(DelegationCapability.NotEqual)],
        [BinaryOp.Less, new DelegationCapability(DelegationCapability.LessThan)],
        [BinaryOp.LessEqual, new DelegationCapability(DelegationCapability.LessThanOrEqual)],
        [BinaryOp.Greater, new DelegationCapability(DelegationCapability.GreaterThan)],
        [BinaryOp.GreaterEqual, new DelegationCapability(DelegationCapability.GreaterThanOrEqual)],
        [BinaryOp.And, new DelegationCapability(DelegationCapability.And)],
        [BinaryOp.Or, new DelegationCapability(DelegationCapability.Or)],
        [BinaryOp.In, new DelegationCapability(DelegationCapability.Contains)],
        [BinaryOp.Add, new DelegationCapability(DelegationCapability.Add)],
        [BinaryOp.Mul, new DelegationCapability(DelegationCapability.Mul)],
        [BinaryOp.Div, new DelegationCapability(DelegationCapability.Div)],
      ]),
  )

  private static readonly _unaryOpToDelegationCapabilityMap = new Lazy<Dictionary<UnaryOp, DelegationCapability>>(
    () =>
      new Dictionary<UnaryOp, DelegationCapability>([
        [UnaryOp.Not, new DelegationCapability(DelegationCapability.Not)],
        [UnaryOp.Minus, new DelegationCapability(DelegationCapability.Sub)],
      ]),
  )

  private static readonly _operatorToDelegationCapabilityMap = new Lazy<Dictionary<string, DelegationCapability>>(
    () =>
      new Dictionary<string, DelegationCapability>([
        [DelegationMetadataOperatorConstants.Equal, new DelegationCapability(DelegationCapability.Equal)],
        [DelegationMetadataOperatorConstants.NotEqual, new DelegationCapability(DelegationCapability.NotEqual)],
        [DelegationMetadataOperatorConstants.Less, new DelegationCapability(DelegationCapability.LessThan)],
        [DelegationMetadataOperatorConstants.LessEqual, new DelegationCapability(DelegationCapability.LessThanOrEqual)],
        [DelegationMetadataOperatorConstants.Greater, new DelegationCapability(DelegationCapability.GreaterThan)],
        [
          DelegationMetadataOperatorConstants.GreaterEqual,
          new DelegationCapability(DelegationCapability.GreaterThanOrEqual),
        ],
        [DelegationMetadataOperatorConstants.And, new DelegationCapability(DelegationCapability.And)],
        [DelegationMetadataOperatorConstants.Or, new DelegationCapability(DelegationCapability.Or)],
        [DelegationMetadataOperatorConstants.Contains, new DelegationCapability(DelegationCapability.Contains)],
        [DelegationMetadataOperatorConstants.IndexOf, new DelegationCapability(DelegationCapability.IndexOf)],
        [DelegationMetadataOperatorConstants.SubStringOf, new DelegationCapability(DelegationCapability.SubStringOf)],
        [DelegationMetadataOperatorConstants.Not, new DelegationCapability(DelegationCapability.Not)],
        [DelegationMetadataOperatorConstants.Year, new DelegationCapability(DelegationCapability.Year)],
        [DelegationMetadataOperatorConstants.Month, new DelegationCapability(DelegationCapability.Month)],
        [DelegationMetadataOperatorConstants.Day, new DelegationCapability(DelegationCapability.Day)],
        [DelegationMetadataOperatorConstants.Hour, new DelegationCapability(DelegationCapability.Hour)],
        [DelegationMetadataOperatorConstants.Minute, new DelegationCapability(DelegationCapability.Minute)],
        [DelegationMetadataOperatorConstants.Second, new DelegationCapability(DelegationCapability.Second)],
        [DelegationMetadataOperatorConstants.Lower, new DelegationCapability(DelegationCapability.Lower)],
        [DelegationMetadataOperatorConstants.Upper, new DelegationCapability(DelegationCapability.Upper)],
        [DelegationMetadataOperatorConstants.Trim, new DelegationCapability(DelegationCapability.Trim)],
        [DelegationMetadataOperatorConstants.Null, new DelegationCapability(DelegationCapability.Null)],
        [DelegationMetadataOperatorConstants.Date, new DelegationCapability(DelegationCapability.Date)],
        [DelegationMetadataOperatorConstants.Length, new DelegationCapability(DelegationCapability.Length)],
        [DelegationMetadataOperatorConstants.Sum, new DelegationCapability(DelegationCapability.Sum)],
        [DelegationMetadataOperatorConstants.Min, new DelegationCapability(DelegationCapability.Min)],
        [DelegationMetadataOperatorConstants.Max, new DelegationCapability(DelegationCapability.Max)],
        [DelegationMetadataOperatorConstants.Average, new DelegationCapability(DelegationCapability.Average)],
        [DelegationMetadataOperatorConstants.Count, new DelegationCapability(DelegationCapability.Count)],
        [DelegationMetadataOperatorConstants.Add, new DelegationCapability(DelegationCapability.Add)],
        [DelegationMetadataOperatorConstants.Mul, new DelegationCapability(DelegationCapability.Mul)],
        [DelegationMetadataOperatorConstants.Div, new DelegationCapability(DelegationCapability.Div)],
        [DelegationMetadataOperatorConstants.Sub, new DelegationCapability(DelegationCapability.Sub)],
        [DelegationMetadataOperatorConstants.StartsWith, new DelegationCapability(DelegationCapability.StartsWith)],
        [DelegationMetadataOperatorConstants.EndsWith, new DelegationCapability(DelegationCapability.EndsWith)],
        [
          DelegationMetadataOperatorConstants.CountDistinct,
          new DelegationCapability(DelegationCapability.CountDistinct),
        ],
        [DelegationMetadataOperatorConstants.CdsIn, new DelegationCapability(DelegationCapability.CdsIn)],
        [DelegationMetadataOperatorConstants.Top, new DelegationCapability(DelegationCapability.Top)],
        [DelegationMetadataOperatorConstants.AsType, new DelegationCapability(DelegationCapability.AsType)],
        [DelegationMetadataOperatorConstants.ArrayLookup, new DelegationCapability(DelegationCapability.ArrayLookup)],
      ]),
  )

  // // Supported delegatable operations.
  public static readonly None = 0x0
  public static readonly Sort = 0x1
  public static readonly Filter = 0x2
  public static readonly GreaterThan = 0x4
  public static readonly GreaterThanOrEqual = 0x8
  public static readonly LessThan = 0x10
  public static readonly LessThanOrEqual = 0x20
  public static readonly And = 0x40
  public static readonly Or = 0x80
  public static readonly In = 0x100
  public static readonly Exactin = 0x200
  public static readonly Not = 0x400
  public static readonly Equal = 0x800
  public static readonly NotEqual = 0x1000
  public static readonly SortAscendingOnly = 0x2000
  public static readonly Contains = 0x4000
  public static readonly IndexOf = 0x8000
  public static readonly SubStringOf = 0x10000
  public static readonly Year = 0x20000
  public static readonly Month = 0x40000
  public static readonly Day = 0x80000
  public static readonly Hour = 0x100000
  public static readonly Minute = 0x200000
  public static readonly Second = 0x400000
  public static readonly Lower = 0x800000
  public static readonly Upper = 0x1000000
  public static readonly Trim = 0x2000000
  public static readonly Null = 0x4000000
  public static readonly Date = 0x8000000
  public static readonly Length = 0x10000000
  public static readonly Sum = 0x20000000
  public static readonly Min = 0x40000000
  public static readonly Max = 0x80000000
  public static readonly Average = 0x100000000
  public static readonly Count = 0x200000000
  public static readonly Add = 0x400000000
  public static readonly Sub = 0x800000000
  public static readonly StartsWith = 0x1000000000
  public static readonly Mul = 0x2000000000
  public static readonly Div = 0x4000000000
  public static readonly EndsWith = 0x8000000000
  public static readonly CountDistinct = 0x10000000000
  public static readonly CdsIn = 0x20000000000
  public static readonly Top = 0x40000000000
  public static readonly Group = 0x80000000000
  public static readonly AsType = 0x100000000000
  public static readonly ArrayLookup = 0x200000000000

  // Please update it as max value changes.
  private static maxSingleCapabilityValue = DelegationCapability.ArrayLookup

  // Indicates support all functionality.
  public static get SupportsAll() {
    // Contracts.Assert(maxSingleCapabilityValue.IsPowerOfTwo)
    return DelegationCapability.maxSingleCapabilityValue | (DelegationCapability.maxSingleCapabilityValue - 1)
  }

  constructor(delegationCapabilities: number) {
    // Contracts.Assert(IsValid(delegationCapabilities));
    this._capabilities = delegationCapabilities
  }

  public static LogicAnd(lhs: DelegationCapability, rhs: DelegationCapability) {
    return new DelegationCapability(lhs.capabilities & rhs.capabilities)
  }

  // |
  public static LogicOr(lhs: DelegationCapability, rhs: DelegationCapability) {
    return new DelegationCapability(lhs.capabilities | rhs.capabilities)
  }

  public static BitwiseComplement(rhs: DelegationCapability) {
    return new DelegationCapability(~rhs.capabilities)
  }

  public hasLeastOneCapability(delegationCapability: number): boolean {
    return (this._capabilities & delegationCapability) != 0
  }

  public hasCapability(delegationCapability: number): boolean {
    if (delegationCapability == DelegationCapability.None) {
      return false
    }

    return (this._capabilities & delegationCapability) == delegationCapability
  }

  public get capabilities() {
    return this._capabilities
  }

  public static IsValid(capabilityConstant: number): boolean {
    return (
      capabilityConstant == DelegationCapability.None || !((capabilityConstant & DelegationCapability.SupportsAll) == 0)
    )
  }

  public static get BinaryOpToDelegationCapabilityMap() {
    return DelegationCapability._binaryOpToDelegationCapabilityMap.value
  }

  public static get UnaryOpToDelegationCapabilityMap() {
    return DelegationCapability._unaryOpToDelegationCapabilityMap.value
  }

  public static get OperatorToDelegationCapabilityMap() {
    return DelegationCapability._operatorToDelegationCapabilityMap.value
  }
}
