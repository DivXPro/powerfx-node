import TexlLexer from '../lexer/TexlLexer'
import { DName } from '../utils/DName'
import { EquatableObject } from '../utils/EquatableObject'
import { DKind } from './DKind'
import { DType } from './DType'
import { DTypeSpecLexer } from './DTypeSpecLexer'
import { TypeTree } from './TypeTree'
import { ValueTree } from './ValueTree'

export class DTypeSpecParser {
  private static TypeEncodings = '?ebnshdipmgo$cDT!*%lLNZPQqV'
  private static get _types(): DType[] {
    return [
      DType.Unknown,
      DType.Error,
      DType.Boolean,
      DType.Number,
      DType.String,
      DType.Hyperlink,
      DType.DateTime,
      DType.Image,
      DType.PenImage,
      DType.Media,
      DType.Guid,
      DType.Blob,
      DType.Currency,
      DType.Color,
      DType.Date,
      DType.Time,
      DType.EmptyRecord,
      DType.EmptyTable,
      DType.EmptyEnum,
      DType.OptionSetValue,
      DType.OptionSet,
      DType.ObjNull,
      DType.DateTimeNoTimeZone,
      DType.Polymorphic,
      DType.View,
      DType.ViewValue,
      DType.NamedValue,
      DType.UntypedObject,
    ]
  }

  // Parses a type specification, returns true and sets 'type' on success.
  public static TryParse(lexer: DTypeSpecLexer): [boolean, DType | undefined] {
    // Contracts.AssertValue(lexer);
    // Contracts.Assert(DTypeSpecParser.TypeEncodings.length == DTypeSpecParser.Types.length);
    // Contracts.Assert(_typeEncodings.ToCharArray().Zip(_types, (c, t) => DType.MapKindToStr(t.Kind) == c.ToString()).All(x => x));

    let type: DType | undefined
    let token: string | undefined
    const nextTokenResult = lexer.tryNextToken()
    token = nextTokenResult[1]
    if (!nextTokenResult[0] || token?.length != 1) {
      type = DType.Invalid
      return [false, type]
    }

    // Older documents may use an "a" type, which for legacy reasons is a duplicate of "o" type.
    if (token == DType.MapKindToStr(DKind.LegacyBlob)) {
      token = DType.MapKindToStr(DKind.Blob)
    }

    // Note that control types "v" or "E" are parsed to Error, since the type spec language is not a mechanism for serializing/deserializing controls.
    if (token == DType.MapKindToStr(DKind.Control) || token == DType.MapKindToStr(DKind.DataEntity)) {
      type = DType.Error
      return [true, type]
    }

    const typeIdx = token != null ? DTypeSpecParser.TypeEncodings.indexOf(token) : -1
    if (typeIdx < 0) {
      type = DType.Invalid
      return [false, type]
    }

    // Contracts.AssertIndex(typeIdx, _types.Length);
    const result = DTypeSpecParser._types[typeIdx]

    if (result == DType.ObjNull) {
      // For null value
      type = result
      return [true, type]
    }

    if (!result.isAggregate) {
      if (result.isEnum) {
        let enumSupertype: DType | undefined
        let valueMap: ValueTree
        const parseResult = DTypeSpecParser.TryParse(lexer)
        enumSupertype = parseResult[1]
        const parseValueMapResult = DTypeSpecParser.TryParseValueMap(lexer)
        valueMap = parseValueMapResult[1]
        if (!parseResult[0] || (!enumSupertype?.isPrimitive && !enumSupertype?.isUnknown) || !parseValueMapResult[0]) {
          type = DType.Invalid
          return [false, type]
        }

        // For enums
        type = DType.MakeDTypeForEnum(enumSupertype.kind, valueMap)
        return [true, type]
      }

      // For non-enums, non-aggregates
      type = result
      return [true, type]
    }

    // Contracts.Assert(result.IsRecord || result.IsTable);
    let typeMap: TypeTree
    const resultParseTypeMap = DTypeSpecParser.TryParseTypeMap(lexer)
    typeMap = resultParseTypeMap[1]
    if (!resultParseTypeMap[0]) {
      type = DType.Invalid
      return [false, type]
    }

    type = DType.MakeDTypeForAggregate(result.kind, typeMap)
    return [true, type]
  }

  // Parses a typed name map specification, returns true and sets 'map' on success.
  // A map specification has the form: [name:type, ...]
  private static TryParseTypeMap(lexer: DTypeSpecLexer): [boolean, TypeTree] {
    // Contracts.AssertValue(lexer);
    let map: TypeTree
    let token: string
    const nextResult = lexer.tryNextToken()
    token = nextResult[1]
    if (!nextResult[0] || token != '[') {
      map = new TypeTree()
      return [false, map]
    }
    map = new TypeTree()

    while (true) {
      let nextToken = lexer.tryNextToken()
      token = nextToken[1]
      if (nextToken[0] && token != ']') {
        let name = token
        if (name.length >= 2 && name[0] === "'" && name[name.length] === "'") {
          name = TexlLexer.UnescapeName(name)
        }
        let type: DType
        let tryToken1 = lexer.tryNextToken()
        token = tryToken1[1]
        let tryParse1 = DTypeSpecParser.TryParse(lexer)
        type = tryParse1[1]
        if (!DName.IsValidDName(name) || !tryToken1[0] || token != ':' || map.contains(name) || !tryParse1[1]) {
          map = new TypeTree()
          return [false, map]
        }
        map = map.setItem(name, type)

        const nextTokenResult2 = lexer.tryNextToken()
        token = nextTokenResult2[1]
        if (!nextTokenResult2[0] || (token != ',' && token != ']')) {
          map = new TypeTree()
          return [false, map]
        } else if (token === ']') {
          return [true, map]
        }
      } else {
        if (token != ']') {
          map = new TypeTree()
          return [false, map]
        }
        break
      }
    }
    return [true, map]
  }

  // Parses a value map specification, returns true and sets 'map' on success.
  // A map specification has the form: [name:value, ...]
  private static TryParseValueMap(lexer: DTypeSpecLexer): [boolean, ValueTree] {
    //   Contracts.AssertValue(lexer);

    let token: string
    let map: ValueTree
    const result = lexer.tryNextToken()
    token = result[1]
    if (!result[0] || token != '[') {
      map = new ValueTree()
      return [false, map]
    }

    map = new ValueTree()

    while (true) {
      const result = lexer.tryNextToken()
      token = result[1]
      if (result[0] && token != ']') {
        let name = token
        if (name.length >= 2 && name.startsWith("'") && name.endsWith("'")) {
          // name = name.replace(/^\'+/, '').replace(/\'+$/, '')
          name = name.substring(1, name.length - 1) //去掉开头和结尾单引号
          //name = name.TrimStart('\'').TrimEnd('\'');
        }
        const nextTokenResult = lexer.tryNextToken()
        token = nextTokenResult[1]
        const parseResult = DTypeSpecParser.TryParseEquatableObject(lexer)
        const value = parseResult[1]
        if (!nextTokenResult[0] || token != ':' || !parseResult[0]) {
          map = new ValueTree()
          return [false, map]
        }
        map = map.setItem(name, value)

        const nextTokenResult2 = lexer.tryNextToken()
        token = nextTokenResult2[1]
        if (!nextTokenResult2[0] || (token != ',' && token != ']')) {
          map = new ValueTree()
          return [false, map]
        } else if (token === ']') {
          return [true, map]
        }
      } else {
        if (token != ']') {
          map = new ValueTree()
          return [false, map]
        }
        break
      }
    }
    return [true, map]
  }

  // Only primitive values are supported:
  //  - strings, such as "hello", etc.
  //  - numbers, such as 123.66124, etc.
  //  - booleans: true and false.
  private static TryParseEquatableObject(lexer: DTypeSpecLexer): [boolean, EquatableObject] {
    //   Contracts.AssertValue(lexer);

    let token: string
    let value: EquatableObject
    const nextTokenResult = lexer.tryNextToken()
    token = nextTokenResult[1]
    if (!nextTokenResult[0] || token.length === 0) {
      value = null
      return [false, value]
    }

    // String support
    if (token[0] == '"') {
      let tokenLen = token.length
      if (tokenLen < 2 || token[tokenLen - 1] != '"') {
        value = null
        return [false, value]
      }
      value = new EquatableObject(token.substr(1, tokenLen - 2))
      return [true, value]
    }

    // Number (hex) support
    if (token[0] == '#' && token.length > 1) {
      const intValue = Math.min(parseInt(token.substr(1), 16), 0)
      if (!isNaN(intValue)) {
        value = new EquatableObject(intValue)
        return [true, value]
      }
      value = null
      return [false, value]
    }

    // Number (double) support
    const numValue = parseFloat(token)
    if (!isNaN(numValue)) {
      value = new EquatableObject(numValue)
      return [true, value]
    }
    // Boolean support
    if (token.toLowerCase() === 'true' || token.toLowerCase() === 'false') {
      value = new EquatableObject(token.toLowerCase() === 'true')
      return [true, value]
    }

    value = null
    return [false, value]
  }
}
