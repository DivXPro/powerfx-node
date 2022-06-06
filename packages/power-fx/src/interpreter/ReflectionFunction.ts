import { TexlFunction } from '../functions/TexlFunction'
import { StringGetter } from '../localization'
import { FormulaType } from '../public/types/FormulaType'
import { FormulaValue } from '../public/values'
import { DType } from '../types/DType'
import { FunctionCategories } from '../types/FunctionCategories'
import { DPath } from '../utils/DPath'

export class CustomTexlFunction extends TexlFunction {
  public _impl: (args: FormulaValue[]) => Promise<FormulaValue> | FormulaValue

  public get supportsParamCoercion() {
    return true
  }

  constructor(name: string, returnType: DType, paramTypes: DType[], minArity?: number)
  constructor(name: string, returnType: FormulaType, paramTypes: FormulaType[], minArity?: number)
  constructor(name: string, returnType: FormulaType | DType, paramTypes: FormulaType[] | DType[], minArity?: number) {
    const types = paramTypes.map((paramType) => (paramType instanceof FormulaType ? paramType._type : paramType))
    returnType = returnType instanceof FormulaType ? returnType._type : returnType
    super(
      DPath.Root,
      name,
      name,
      CustomTexlFunction.SG('Custom func' + name),
      FunctionCategories.MathAndStat,
      returnType,
      0,
      minArity ?? paramTypes.length,
      paramTypes.length,
      ...types,
    )
  }

  public get isSelfContained() {
    return true
  }

  public static SG(text: string): StringGetter {
    return (locale: string) => text
  }

  public getSignatures(): Array<StringGetter[]> {
    return [[CustomTexlFunction.SG('Arg 1')]]
  }

  public async invoke(args: FormulaValue[]): Promise<FormulaValue> {
    return this._impl(args)
  }
}

/// <summary>
/// Base class for importing a C# function into Power Fx.
/// Dervied class should follow this convention:
/// - class name should folow this convention: "[Method Name]" + "Function"
/// - it should have a public static  method 'Execute'. this class will reflect over that signature to import to power fx.
/// </summary>

export abstract class ReflectionFunction implements FunctionDescr {
  public readonly retType: FormulaType
  public readonly paramTypes: FormulaType[]
  public readonly name: string
  public readonly method: (...args: any[]) => any
  abstract execute: (...args: any[]) => any

  /// <summary>
  /// Initializes a new instance of the <see cref="ReflectionFunction"/> class.
  /// Assume by defaults. Will reflect to get primitive types.
  /// </summary>
  // protected ReflectionFunction()
  // {
  //     this._info = null;
  // }
  // Explicitly provide types.
  // Necessary for Tables/Records
  constructor(name: string, returnType: FormulaType, paramTypes: FormulaType[], method: (...args: any[]) => any) {
    this.name = name
    this.retType = returnType
    this.paramTypes = paramTypes
    this.method = method
  }

  public getTexlFunction() {
    const customFn = new CustomTexlFunction(this.name, this.retType, this.paramTypes)
    customFn._impl = this.method
    return customFn
  }

  public invoke(args: FormulaValue[]): FormulaValue {
    const result = this.method.call(this, ...args)
    return result as FormulaValue
  }
}

export interface FunctionDescr {
  retType: FormulaType
  paramTypes: FormulaType[]
  name: string
  method: (...args: any[]) => any
}
