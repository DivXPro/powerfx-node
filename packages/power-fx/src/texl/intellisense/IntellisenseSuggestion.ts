import { TexlFunction } from '../../functions/TexlFunction'
import TexlLexer from '../../lexer/TexlLexer'
import { DType } from '../../types'
import IComparable from '../../utils/typescriptNet/IComparable'
// import IComparable from "../../utils/typescriptNet/IComparable";
import IEquatable from '../../utils/typescriptNet/IEquatable'
import StringBuilder from '../../utils/typescriptNet/Text/StringBuilder'
import { IIntellisenseSuggestion } from './IIntellisenseSuggestion'
import { SuggestionIconKind } from './SuggestionIconKind'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'

export class IntellisenseSuggestion
  implements IComparable<IntellisenseSuggestion>, IEquatable<IntellisenseSuggestion>, IIntellisenseSuggestion
{
  private readonly _text: string
  private _overloads: IIntellisenseSuggestion[]
  private _argIndex: number

  /// <summary>
  /// This is valid if the current kind is of SuggestionKind.Function, else -1.
  /// This is used to filter out suggestions that have less arguments than ArgIndex.
  /// </summary>
  private _argCount: number

  /// <summary>
  /// Gets the sort priority for this suggestion. 0 is lowest priority.
  /// </summary>
  public SortPriority: number

  /// <summary>
  /// Gets the text form of the DisplayText  for the suggestion.
  /// </summary>
  public get Text(): string {
    return this._text
  }

  /// <summary>
  /// This is an public field that stores the simple func name if the suggestion is a Function.
  /// </summary>
  public FunctionName: string

  /// <summary>
  /// This is an public field that stores the type of the suggestion.
  /// </summary>
  public Type: DType

  /// <summary>
  /// The exact matching :string. This is used for sorting the suggestions.
  /// </summary>
  public ExactMatch: string

  /// <summary>
  /// Description for the current func parameter.
  /// For example: This is used to provide parameter description for the highlighted func parameter.
  /// </summary>
  public FunctionParameterDescription: string

  /// <summary>
  /// Description, suitable for UI consumption.
  /// </summary>
  public Definition: string

  /// <summary>
  /// A boolean value indicating if the suggestion matches the expected type in the rule.
  /// </summary>
  public IsTypeMatch: boolean

  /// <summary>
  /// A boolean value indicating if the suggestion is the primary output property.
  /// </summary>
  public ShouldPreselect: boolean

  /// <summary>
  /// Returns the list of suggestions for the overload of the func.
  /// This is populated only if the suggestion kind is a func and if the func has overloads.
  /// </summary>
  public get Overloads(): IIntellisenseSuggestion[] {
    return this._overloads
  }

  /// <summary>
  /// The Kind of Suggestion
  /// </summary>
  public Kind: SuggestionKind

  /// <summary>
  /// What kind of icon to display next to the suggestion.
  /// </summary>
  public IconKind: SuggestionIconKind

  /// <summary>
  /// This is the :string that will be displayed to the user
  /// </summary>
  public DisplayText: UIString

  /// <summary>
  /// Indicates if there are errors.
  /// </summary>
  public HasErrors: boolean

  /// <summary>
  /// This is valid only if the Kind is Function, else -1.
  /// </summary>
  // public number ArgIndex
  // {
  //   get
  //   {
  //     return _argIndex;
  //   }

  //   internal set
  //   {
  //     // Contracts.Assert(value >= 0);
  //     if (Kind == SuggestionKind.Function) {
  //       _argIndex = value;
  //       foreach(IntellisenseSuggestion s in _overloads)
  //       {
  //         s.ArgIndex = value;
  //       }
  //     }
  //   }
  // }

  public get ArgIndex() {
    return this._argIndex
  }

  public set ArgIndex(value: number) {
    // Contracts.Assert(value >= 0);
    if (this.Kind == SuggestionKind.Function) {
      this._argIndex = value
      for (let s of this._overloads) {
        ;(<IntellisenseSuggestion>(<unknown>s)).ArgIndex = value
      }
    }
  }

  // constructor(text: UIString, kind: SuggestionKind, iconKind: SuggestionIconKind, type: DType,                     argCount: number, definition: string, functionName: string, functionParamDescription: string)
  // constructor(text: UIString, kind: SuggestionKind, iconKind: SuggestionIconKind, type: DType, exactMatch: string, argCount: number, definition: string, functionName: string,                                   sortPriority: number)
  // constructor(text: UIString, kind: SuggestionKind, iconKind: SuggestionIconKind, type: DType, exactMatch: string, argCount: number, definition: string, functionName: string, functionParamDescription: string, sortPriority:number)
  static newInstanceByTexlFunc(func: TexlFunction, exactMatch: string, displayText: UIString) {
    let newObj = new this(
      displayText,
      SuggestionKind.Function,
      SuggestionIconKind.Function,
      func.returnType,
      exactMatch,
      -1,
      func.description,
      func.name,
      0,
    )
    for (let signature of func.getSignatures()) {
      let count = 0
      let argumentSeparator = ''
      let listSep = TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
      let funcDisplayString: StringBuilder = new StringBuilder(newObj.Text)
      funcDisplayString.append('(')
      for (let arg of signature) {
        funcDisplayString.append(argumentSeparator)
        funcDisplayString.append(arg(null))
        argumentSeparator = listSep
        count++
      }
      funcDisplayString.append(')')
      newObj._overloads.push(
        new IntellisenseSuggestion(
          new UIString(funcDisplayString.toString()),
          SuggestionKind.Function,
          SuggestionIconKind.Function,
          func.returnType,
          exactMatch,
          count,
          func.description,
          func.name,
          0,
        ),
      )
    }
    return newObj
  }

  static newInstance(
    text: UIString,
    kind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    argCount: number,
    definition: string,
    functionName: string,
    functionParamDescription: string,
  ) {
    return new this(text, kind, iconKind, type, '', argCount, definition, functionName, 0, functionParamDescription)
  }

  constructor(
    text: UIString,
    kind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    exactMatch: string,
    argCount: number,
    definition: string,
    functionName: string,
    sortPriority?: number,
  )
  constructor(
    text: UIString,
    kind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    exactMatch: string,
    argCount: number,
    definition: string,
    functionName: string,
    sortPriority?: number,
    functionParamDescription?: string,
  )
  constructor(
    text: UIString,
    kind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    exactMatch: any,
    argCount: any,
    definition: any,
    functionName: any,
    sortPriority: number = 0,
    functionParamDescription: string = '',
  ) {
    // Contracts.AssertValue(text);
    // Contracts.AssertNonEmpty(text.Text);
    // Contracts.AssertValid(type);
    // Contracts.AssertValue(exactMatch);
    // Contracts.AssertValue(definition);
    // Contracts.Assert(argCount >= -1);
    // Contracts.AssertValueOrNull(functionName);
    // Contracts.AssertValueOrNull(functionParamDescription);

    this.DisplayText = <UIString>text
    this._overloads = [] // new List<IIntellisenseSuggestion>();
    this._text = (<UIString>text).text
    this.Kind = <SuggestionKind>kind
    this.IconKind = <SuggestionIconKind>iconKind
    this.Type = type
    this._argIndex = -1
    this.ExactMatch = exactMatch
    this._argCount = argCount
    this.FunctionName = functionName
    this.SortPriority = sortPriority
    this.ShouldPreselect = sortPriority != 0

    this.FunctionParameterDescription = functionParamDescription ?? ''
    this.Definition = definition
    this.IsTypeMatch = false
  }

  // For debugging.
  public toString() {
    return `${Text}: ${this.Kind}`
  }

  // For debugging.
  public appendTo(sb: StringBuilder) {
    // Contracts.AssertValue(sb);
    if (this.Kind == SuggestionKind.Function) {
      sb.appendLine(`Function ${this.Text}, arg index ${this.ArgIndex}`)
      sb.appendLine('Overloads:')
      for (let overload of this._overloads) {
        sb.appendLine(`${overload.DisplayText.toString()}`)
      }
    } else {
      sb.appendLine(`${this.Text}: ${this.Kind}`)
    }

    sb.appendLine()
  }

  // public CompareTo(other: IntellisenseSuggestion): number {
  //   // Contracts.AssertValueOrNull(other);
  //   if (other == null)
  //     return -1;

  //   let thisIsExactMatch: boolean = this.IsExactMatch(this.Text, this.ExactMatch);
  //   let otherIsExactMatch: boolean = this.IsExactMatch(other.Text, other.ExactMatch);

  //   if (thisIsExactMatch && !otherIsExactMatch)
  //     return -1;
  //   else if (!thisIsExactMatch && otherIsExactMatch)
  //     return 1;

  //   return this.SortPriority == other.SortPriority ?  this.Text.CompareTo(other.Text) : <number>(other.SortPriority - this.SortPriority);
  // }

  // Removes the func overloads which have args less than the given value
  public removeOverloads(argCount: number): void {
    // Contracts.Assert(argCount >= 0);

    if (this.Kind == SuggestionKind.Function) {
      for (let a of this._overloads) {
        if ((<IntellisenseSuggestion>a)._argCount < argCount) {
          const idx = this._overloads.indexOf(a)
          if (idx > -1) {
            this._overloads.splice(idx, 1) //.Remove(a);
          }
        }
      }
    }
  }

  // Adds the func overloads to the overload list.
  public addOverloads(suggestions: IIntellisenseSuggestion[]): void {
    // Contracts.AssertValue(suggestions);

    // this._overloads.AddRange(suggestions);
    this._overloads = this._overloads.concat(suggestions)
  }

  // Sets the value of IsTypeMatch to true.
  public SetTypematch(): void {
    this.IsTypeMatch = true
  }

  private IsExactMatch(input: string, match: string): boolean {
    // Contracts.AssertValue(input);
    // Contracts.AssertValue(match);
    // return input.Equals(match, StringComparison.OrdinalIgnoreCase);
    return input.toLocaleLowerCase() == match.toLocaleLowerCase()
  }

  //TODO compareTo
  compareTo(other: IntellisenseSuggestion): number {
    throw new Error('Method not implemented.')
  }

  //TODO equals接口
  equals(other: IntellisenseSuggestion): boolean {
    throw new Error('Method not implemented.')
  }

  //   public Equals(other: IntellisenseSuggestion): boolean {
  //     Contracts.AssertValueOrNull(other);

  //     if (other == null)
  //       return false;

  //     // REVIEW ragru/hekum: Here comparing the _overloads is not necessary because all the possible overloads for a
  //     // func are gathered under one name and hence there won't be 2 func suggestions with the same name.
  //     return _text == other.Text
  //       && Type.Equals(other.Type)
  //       && FunctionName == other.FunctionName
  //       && _argCount == other._argCount
  //       && _argIndex == other._argIndex;
  //   }

  //   public override Equals(other: object): boolean {
  //     Contracts.AssertValueOrNull(other);

  //     if (other == null)
  //       return false;

  //             IntellisenseSuggestion otherSuggestion = other as IntellisenseSuggestion;
  //     if (otherSuggestion == null)
  //       return false;
  //     else
  //       return Equals(otherSuggestion);
  //   }

  //   public override  GetHashCode() {
  //     let boolean: number = this.FunctionName == null ? 0 : this.FunctionName.GetHashCode();
  //     return _text.GetHashCode() ^ Type.GetHashCode() ^ funcHashCode ^ _argCount ^ _argIndex;
  //   }

  //   public static: boolean operator == (IntellisenseSuggestion suggestion1, IntellisenseSuggestion suggestion2)
  // {
  //   if ((object)suggestion1 == null || ((object)suggestion2) == null)
  //   return Object.Equals(suggestion1, suggestion2);

  //   return suggestion1.Equals(suggestion2);
  // }

  //   public static:boolean operator != (IntellisenseSuggestion suggestion1, IntellisenseSuggestion suggestion2)
  // {
  //   if (suggestion1 == null || suggestion2 == null)
  //     return !Object.Equals(suggestion1, suggestion2);

  //   return !(suggestion1.Equals(suggestion2));
  // }
}
