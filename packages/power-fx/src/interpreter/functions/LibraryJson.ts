import {
  BlankValue,
  UntypedObjectValue,
  ErrorKind,
  ErrorValue,
  ExpressionError,
  ExternalType,
  FormulaType,
  FormulaValue,
  IUntypedObject,
  StringValue,
} from '../../public'
import { IRContext } from '../../ir'
import { TargetFunctionFullProps } from './StandardErrorHanding'

export class JsonCustomObject implements IUntypedObject {
  private readonly _element: any

  constructor(element: any) {
    this._element = element
  }
  public get type() {
    switch (typeof this._element) {
      case 'string':
        return FormulaType.String
      case 'number':
        return FormulaType.Number
      case 'boolean':
        return FormulaType.Boolean
      case 'object': {
        return Array.isArray(this._element) ? ExternalType.ArrayType : ExternalType.ObjectType
      }
      default:
        return FormulaType.Blank
    }
  }
  public at(index: number): IUntypedObject {
    return new JsonCustomObject(this._element[index])
  }

  public getArrayLength() {
    return this._element.length
  }

  public getString() {
    return this._element
  }

  public getNumber(): number {
    return this._element
  }

  public getBoolean() {
    return this._element
  }

  public tryGetProperty(key: string): [boolean, IUntypedObject] {
    const value = this._element[key]
    return [value != null, new JsonCustomObject(value)]
  }
}

export function ParseJson(props: TargetFunctionFullProps<StringValue>): FormulaValue {
  const json = props.values[0].value
  let result

  try {
    result = JSON.parse(json)

    if (result == null) {
      return new BlankValue(IRContext.NotInSource(FormulaType.Blank))
    }

    return new UntypedObjectValue(props.irContext, new JsonCustomObject(result))
  } catch (ex) {
    return new ErrorValue(
      props.irContext,
      new ExpressionError(
        `The Json could not be parsed: ${(ex as Error).message}`,
        props.irContext.sourceContext,
        ErrorKind.InvalidFunctionUsage,
      ),
    )
  }
}
