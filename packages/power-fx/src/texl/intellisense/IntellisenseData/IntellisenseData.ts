import { TexlBinding } from '../../../binding'
import { TexlFunction } from '../../../functions/TexlFunction'
import { TexlLexer } from '../../../lexer'
import { CommentToken } from '../../../lexer/tokens'
import { Identifier } from '../../../syntax'
import { CallNode, TexlNode } from '../../../syntax/nodes'
import { DType } from '../../../types'
import { EnumStore, EnumSymbol } from '../../../types/enums'
import { KeyValuePair } from '../../../utils'
import { ArgumentSuggestions } from '../ArgumentSuggestions'
import { IIntellisenseContext } from '../IIntellisenseContext'
import { IsValidSuggestion } from '../Intellisense'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { IntellisenseSuggestionList } from '../IntellisenseSuggestionList'
import { ISpecialCaseHandler } from '../SuggestionHandlers/CleanupHandlers/ISpecialCaseHandler'
import { SuggestionIconKind } from '../SuggestionIconKind'
import { SuggestionKind } from '../SuggestionKind'
import { DefaultIntellisenseData } from './DefaultIntellisenseData'
import { IIntellisenseData } from './IIntellisenseData'

// The IntellisenseData class contains the pre-parsed data for Intellisense to provide suggestions
export class IntellisenseData implements IIntellisenseData {
  private readonly _enumStore: EnumStore
  private readonly _expectedType: DType
  private readonly _suggestions: IntellisenseSuggestionList
  private readonly _substringSuggestions: IntellisenseSuggestionList
  private readonly _binding: TexlBinding
  private readonly _comments: Array<CommentToken>
  private readonly _curFunc: TexlFunction
  private readonly _curNode: TexlNode
  private readonly _script: string
  private readonly _cursorPos: number
  private readonly _argIndex: number
  private readonly _argCount: number
  private _isValidSuggestionFunc: IsValidSuggestion
  private _matchingStr: string
  // _matchingLength will be different from the length of _matchingStr when _matchingStr contains delimiters.
  // For matching purposes we escape the delimeters and match against the public  DName.
  private _matchingLength: number
  private _replacementStartIndex: number
  // There will be a separate replacement length when we want to replace an entire node and not just the
  // preceding portion which is used for matching.
  private _replacementLength: number
  private _missingTypes: Array<DType>
  private readonly _cleanupHandlers: Array<ISpecialCaseHandler>

  constructor(
    enumStore: EnumStore,
    context: IIntellisenseContext,
    expectedType: DType,
    binding: TexlBinding,
    curFunc: TexlFunction,
    curNode: TexlNode,
    argIndex: number,
    argCount: number,
    isValidSuggestionFunc: IsValidSuggestion,
    missingTypes: Array<DType>,
    comments: Array<CommentToken>,
  ) {
    // Contracts.AssertValue(context);
    // Contracts.AssertValid(expectedType);
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(curNode);
    // Contracts.Assert(0 <= context.CursorPosition && context.CursorPosition <= context.InputText.Length);
    // Contracts.AssertValue(isValidSuggestionFunc);
    // Contracts.AssertValueOrNull(missingTypes);
    // Contracts.AssertValueOrNull(comments);

    this._enumStore = enumStore
    this._expectedType = expectedType
    this._suggestions = new IntellisenseSuggestionList()
    this._substringSuggestions = new IntellisenseSuggestionList()
    this._binding = binding
    this._comments = comments
    this._curFunc = curFunc
    this._curNode = curNode
    this._script = context.InputText
    this._cursorPos = context.CursorPosition
    this._argIndex = argIndex
    this._argCount = argCount
    this._isValidSuggestionFunc = isValidSuggestionFunc
    this._matchingStr = ''
    this._matchingLength = 0
    this._replacementStartIndex = context.CursorPosition
    this._missingTypes = missingTypes
    this.BoundTo = ''
    this._cleanupHandlers = [] //new Array<ISpecialCaseHandler>();
  }

  public get ExpectedType(): DType {
    return this._expectedType
  }

  public get Suggestions(): IntellisenseSuggestionList {
    return this._suggestions
  }

  public get SubstringSuggestions(): IntellisenseSuggestionList {
    return this._substringSuggestions
  }

  public get Binding(): TexlBinding {
    return this._binding
  }

  public get Comments(): Array<CommentToken> {
    return this._comments
  }

  public get CurFunc(): TexlFunction {
    return this._curFunc
  }

  public get CurNode(): TexlNode {
    return this._curNode
  }

  public get Script(): string {
    return this._script
  }

  public get CursorPos(): number {
    return this._cursorPos
  }

  public get ArgIndex(): number {
    return this._argIndex
  }

  public get ArgCount(): number {
    return this._argCount
  }

  public get IsValidSuggestionFunc(): IsValidSuggestion {
    return this._isValidSuggestionFunc
  }

  public get MatchingStr(): string {
    return this._matchingStr
  }

  public get MatchingLength(): number {
    return this._matchingLength
  }

  public get ReplacementStartIndex(): number {
    return this._replacementStartIndex
  }

  public get ReplacementLength(): number {
    return this._replacementLength
  }

  public BoundTo: string

  public get MissingTypes(): Array<DType> {
    return this._missingTypes
  }

  public get CleanupHandlers(): Array<ISpecialCaseHandler> {
    return this._cleanupHandlers
  }

  /// <summary>
  /// Type that defines valid symbols in the formula
  /// </summary>
  public get ContextScope(): DType {
    return this.Binding.contextScope
  }

  /// <summary>
  /// Returns true if <see cref="suggestion"/> should be added to the suggestion list based on
  /// <see cref="type"/> and false otherwise.  May be used after suggestions and node type are found.
  /// Note: The default behavior has it so that all candidates are suggestible.  This may not always be
  /// desired.
  /// </summary>
  /// <param name="suggestion">
  /// Candidate suggestion string
  /// </param>
  /// <param name="type">
  /// Type of the node at the caller's context
  /// </param>
  /// <returns>
  /// Whether the provided candidate suggestion is valid per the provided type.
  /// </returns>
  public DetermineSuggestibility(suggestion: string, type: DType) {
    return true
  }

  /// <summary>
  /// This method is executed by <see cref="Intellisense"/> when it is run for a formula whose cursor
  /// is positioned to the right of a <see cref="DottedNameNode"/>, but not after the right node of the
  /// <see cref="DottedNameNode"/>.  If it returns true, further calculations will cease and the
  /// Intellisense handler will complete.  If it returns false, then fallback suggestion calculations will be run.
  /// </summary>
  /// <param name="leftNode">
  /// Left node in the <see cref="DottedNameNode"/> at which the cursor is pointed at the time of
  /// invocation.
  /// </param>
  /// <returns>
  /// True iff a suggestion was added, false if no suggestion was added (default suggestion behavior will
  /// run).
  /// </returns>
  public TryAddSuggestionsForLeftNodeScope(leftNode: TexlNode) {
    return false
  }

  /// <summary>
  /// This method is executed by <see cref="Intellisense"/> when it is run for a formula whose cursor
  /// is positioned to the right of a <see cref="DottedNameNode"/>, but not after the right node of the
  /// <see cref="DottedNameNode"/>.  It is run after all suggestions have been added for
  /// <see cref="node"/> and may be used to add additional suggestions after the rest.  This method
  /// does not alter control flow.
  /// </summary>
  /// <param name="node">
  /// Node for which suggestions may be added or other actions committed.
  /// </param>
  public OnAddedSuggestionsForLeftNodeScope(node: TexlNode): void {}

  /// <summary>
  /// Should return true if name collides with existing symbols and false otherwise.  Used to determine
  /// whether to prepend a prefix to an enum value.
  /// </summary>
  /// <param name="name">
  /// Name in question
  /// </param>
  /// <returns>
  /// True if the provided name collides with an existing name or identifier, false otherwise.
  /// </returns>
  public DoesNameCollide(name: string): boolean {
    // return (from enumSymbol in _enumStore.EnumSymbols
    // where(from localizedEnum in enumSymbol.LocalizedEnumValues where localizedEnum == name select localizedEnum).Any()
    //                 select enumSymbol).Count() > 1;
    let count = 0
    for (const enumSymbol of this._enumStore.enumSymbols) {
      if (enumSymbol.localizedEnumValues.filter((x) => x == name).length > 0) {
        count += 1
      }
    }
    return count > 1
  }

  /// <summary>
  /// Should unqualified enums be suggested
  /// </summary>
  public SuggestUnqualifiedEnums: boolean = true

  /// <summary>
  /// Retrieves an <see cref="EnumSymbol"/> from <see cref="binding"/> (if necessary)
  /// </summary>
  /// <param name="name">
  /// Name of the enum symbol for which to look
  /// </param>
  /// <param name="binding">
  /// Binding in which may be looked for the enum symbol
  /// </param>
  /// <param name="enumSymbol">
  /// Should be set to the symbol for <see cref="name"/> if it is found, and left null otherwise.
  /// </param>
  /// <returns>
  /// True if the enum symbol was found, false otherwise.
  /// </returns>
  public TryGetEnumSymbolBinding(name: string, binding: TexlBinding): [boolean, EnumSymbol] {
    return this.TryGetEnumSymbol(name)
  }

  public TryGetEnumSymbol(name: string): [boolean, EnumSymbol] {
    // Contracts.AssertValue(name);

    let symbol = this.EnumSymbols.filter((symbol) => symbol.name == name)[0]
    return [symbol != null, symbol]
  }

  /// <summary>
  /// A list of the enum symbols defined for intellisense
  /// </summary>
  public get EnumSymbols(): EnumSymbol[] {
    return this._enumStore.enumSymbols
  }

  /// <summary>
  /// Tries to add custom suggestions for a column specified by <see cref="type"/>
  /// </summary>
  /// <param name="type">
  /// The type of the column for which suggestions may be added
  /// </param>
  /// <returns>
  /// True if suggestions were added and default column suggestion behavior should not be executed,
  /// false otherwise.
  /// </returns>
  public TryAddCustomColumnTypeSuggestions(type: DType) {
    return false
  }

  /// <summary>
  /// This method is executed by <see cref="Intellisense"/> when it is run for a formula whose cursor
  /// is positioned to the right of a <see cref="DottedNameNode"/>.
  /// Tries to add custom dotten name suggestions by a provided type for the left node to the
  /// <see cref="DottedNameNode"/>.
  /// </summary>
  /// <param name="type">
  /// Type of the lhs of a <see cref="DottedNameNode"/> for which suggestions may be added to
  /// this.
  /// </param>
  /// <returns>
  /// True if operation was successful and default suggestion behavior should be short circuited and
  /// false otherwise.
  /// </returns>
  public TryAddCustomDottedNameSuggestions(type: DType) {
    return false
  }

  /// <summary>
  /// This method is executed by <see cref="Intellisense"/> when it is run for a formula whose cursor
  /// is positioned to the right of a <see cref="DottedNameNode"/>, regardless as to whether the
  /// position is before, amidst, or after the left node of the <see cref="DottedNameNode"/>.  It is run
  /// before any suggestions have been added and is not intended to change control flow.
  /// </summary>
  /// <param name="node">
  /// Left node in the <see cref="DottedNameNode"/> at which the cursor is pointed at the time of
  /// invocation.
  /// </param>
  public BeforeAddSuggestionsForDottedNameNode(node: TexlNode): void {}

  /// <summary>
  /// This method is called by <see cref="Intellisense"/> to determine whether a candidate suggestion
  /// that represents a function should be suggested
  /// </summary>
  /// <param name="suggestion">
  /// Candidate suggestion wherein the key represents the suggestion name and the value represents its
  /// type
  /// </param>
  /// <returns>
  /// True if the function may be suggested, false otherwise
  /// </returns>
  public ShouldSuggestFunction(func: TexlFunction) {
    return true
  }

  /// <summary>
  /// Returns a list of argument suggestions for a given func, scope type, and argument index
  /// </summary>
  /// <param name="function">
  /// The function for which we are producing argument suggestions
  /// </param>
  /// <param name="scopeType">
  /// The type of the scope from where intellisense is run
  /// </param>
  /// <param name="argumentIndex">
  /// The index of the current argument of <see cref="function"/>
  /// </param>
  /// <param name="argsSoFar">
  /// The arguments that are present in the formula at the time of invocation
  /// </param>
  /// <param name="requiresSuggestionEscaping">
  /// Is set to whether the characters within the returned suggestion need have its characters escaped
  /// </param>
  /// <returns>
  /// Argument suggestions for the provided context
  /// </returns>
  public GetArgumentSuggestions(
    func: TexlFunction,
    scopeType: DType,
    argumentIndex: number,
    argsSoFar: TexlNode[],
  ): [KeyValuePair<string, DType>[], boolean] {
    // Contracts.AssertValue(function);
    // Contracts.AssertValue(scopeType);

    return ArgumentSuggestions.GetArgumentSuggestions(
      this.TryGetEnumSymbol,
      this.SuggestUnqualifiedEnums,
      func,
      scopeType,
      argumentIndex,
    )
  }

  /// <summary>
  /// Should return the kind of suggestion that may be recomended for the
  /// <see cref="argumentIndex"/> parameter of <see cref="function"/>
  /// </summary>
  /// <param name="function">
  /// Function that the kind of suggestion for which this function determines
  /// </param>
  /// <param name="argumentIndex">
  /// The index of the argument to which the suggestion pertains
  /// </param>
  /// <returns>
  /// The suggestion kind for the hypothetical suggestion
  /// </returns>
  public GetFunctionSuggestionKind(func: TexlFunction, argumentIndex: number): SuggestionKind {
    return SuggestionKind.Global
  }

  /// <summary>
  /// This method is called after all default suggestions for value possibilities have been run and may be
  /// overridden to provide custom suggestions
  /// </summary>
  public AddCustomSuggestionsForValuePossibilities(): void {}

  /// <summary>
  /// May be overridden to provide custom suggestions at the point in intellisense runtime when
  /// suggestions for global identifiers are added
  /// </summary>
  public AddCustomSuggestionsForGlobals(): void {}

  /// <summary>
  /// May be overridden to provide custom suggestions or change other state after the point in
  /// intellisense runtime where suggestions for global identifiers are added.
  /// </summary>
  public AfterAddSuggestionsForGlobals(): void {}

  /// <summary>
  /// May be overridden to provide custom suggestions or change other state after the point in
  /// intellisense runtime where suggestions for unary operator keywords are added.
  /// </summary>
  public AfterAddSuggestionsForUnaryOperatorKeywords(): void {}

  /// <summary>
  /// This collection is appended to the resultant suggestion list when
  /// <see cref="Intellisense.FirstNameNodeSuggestionHandler"/> is used.  It may be overridden to provide
  /// additional first name node suggestions.  It is called when the cursor is
  /// </summary>
  /// <returns>
  /// Sequence of suggestions for first name node context.
  /// </returns>
  public SuggestableFirstNames(): string[] {
    return []
  } // => Enumerable.Empty<string>();

  /// <summary>
  /// Invokes <see cref="AddSuggestionsForConstantKeywords"/> to supply suggestions for constant
  /// keywords.  May be overridden to supply additional suggestions or to change the set of acceptable
  /// keywords.
  /// </summary>
  public AddSuggestionsForConstantKeywords(): void {
    IntellisenseHelper.AddSuggestionsForMatches(
      this,
      TexlLexer.LocalizedInstance.getConstantKeywords(false),
      SuggestionKind.KeyWord,
      SuggestionIconKind.Other,
      false,
    )
  }

  /// <summary>
  /// Array of additional variable suggestions that may be provided in an overridden method.
  /// Here, the key is the suggestion text and the value is the kind of desired icon.
  /// </summary>
  public AdditionalGlobalSuggestions: KeyValuePair<string, SuggestionIconKind>[] = []
  //Enumerable.Empty<KeyValuePair<string, SuggestionIconKind>>();

  /// <summary>
  /// This method may be overriden to add additional suggestions for local selections to the resultant
  /// suggestion list for first name nodes.
  /// </summary>
  public AddAdditionalSuggestionsForLocalSymbols(): void {}

  /// <summary>
  /// This method may be overriden to add additional suggestions for generic selections to the resultant
  /// suggestion list for first name nodes.
  /// </summary>
  /// <param name="currentNode">
  /// The node for which Intellisense is invoked
  /// </param>
  public AddAdditionalSuggestionsForKeywordSymbols(currentNode: TexlNode): void {}

  /// <param name="function">
  /// Function whose eligibility is called into question.
  /// </param>
  /// <returns>
  /// Returns true if <see cref="Intellisense.FunctionRecordNameSuggestionHandler"/> should make suggestions
  /// for the provided function and false otherwise.
  /// </returns>
  public IsFunctionElligibleForRecordSuggestions(func: TexlFunction) {
    return true
  }

  /// <param name="function">
  /// Function in question
  /// </param>
  /// <param name="callNode">
  /// The node at the present cursor position
  /// </param>
  /// <param name="type">
  /// If overridden, may be set to a custom function type when returns.
  /// </param>
  /// <returns>
  /// True if a special type was found and type is set, false otherwise.
  /// </returns>
  public TryGetSpecialFunctionType(func: TexlFunction, callNode: CallNode): [boolean, DType] {
    return [false, null]
  }

  /// <summary>
  /// This method may be overridden to provide additional suggestions for function record names after
  /// the default have been added.  It should return true if intellisenseData is handled and no more
  /// suggestions are to be found and false otherwise.
  /// </summary>
  public TryAddFunctionRecordSuggestions(func: TexlFunction, callNode: CallNode, columnName: Identifier) {
    return false
  }

  /// <summary>
  /// This method is called by <see cref="Intellisense.ErrorNodeSuggestionHandlerBase"/> if function was
  /// discovered as a parent node to the current error node.  It may be overridden to add additional
  /// suggestions pertaining to <see cref="function"/> and <see cref="argIndex"/>.  If it returns true,
  /// <see cref="Intellisense.ErrorNodeSuggestionHandlerBase"/> will return immediately and no more suggestions
  /// will be added.
  /// </summary>
  /// <param name="function">
  /// Function for which additional suggestions may be added
  /// </param>
  /// <param name="argIndex">
  /// Index of the argument on which the cursor is positioned
  /// </param>
  /// <returns>
  /// True if all suggestions have been added and no more should be.  False otherwise.
  /// </returns>
  public TryAddCustomFunctionSuggestionsForErrorNode(func: TexlFunction, argIndex: number) {
    return false
  }

  /// <summary>
  /// This method is called by <see cref="Intellisense.ErrorNodeSuggestionHandlerBase"/> before top level
  /// suggestions are added.  See <see cref="IntellisenseHelper.AddSuggestionsForTopLevel"/> for
  /// details.
  /// </summary>
  public AddSuggestionsBeforeTopLevelErrorNodeSuggestions() {
    return false
  }

  /// <summary>
  /// This method is called by <see cref="Intellisense.ErrorNodeSuggestionHandlerBase"/> if no top level
  /// suggestions are added.  It may be overridden to supply alternative top level suggestions.
  /// </summary>
  public AddAlternativeTopLevelSuggestionsForErrorNode(): void {}

  /// <summary>
  /// This method is called by <see cref="Intellisense.ErrorNodeSuggestionHandlerBase"/> after it has added all
  /// its suggestions to <see cref="Suggestions"/>
  /// </summary>
  public AddSuggestionsAfterTopLevelErrorNodeSuggestions(): void {}

  public TryAugmentSignature(
    func: TexlFunction,
    argIndex: number,
    paramName: string,
    highlightStart: number,
    // out number newHighlightStart, out number newHighlightEnd, out string newParamName, out string newInvariantParamName
  ) {
    return DefaultIntellisenseData.DefaultTryAugmentSignature(func, argIndex, paramName, highlightStart)
  }

  public GenerateParameterDescriptionSuffix(func: TexlFunction, paramName: string): string {
    return DefaultIntellisenseData.GenerateDefaultParameterDescriptionSuffix(func, paramName)
  }

  public SetMatchArea(startIndex: number, endIndex: number, replacementLength: number = -1): boolean {
    // Contracts.Assert(0 <= startIndex && startIndex <= endIndex && endIndex <= _script.Length);

    // If we have already provided suggestions, we can't set the match area
    if (this.Suggestions.Count() > 0 || this.SubstringSuggestions.Count() > 0) return false

    // Trim leading whitespace as there is no point to matching it
    // while (startIndex < endIndex && string.IsNullOrWhiteSpace(Script.Substring(startIndex, 1)))
    while (startIndex < endIndex && this.Script.substr(startIndex, 1) == '') startIndex++

    this._replacementStartIndex = startIndex
    this._matchingLength = endIndex - startIndex
    this._replacementLength = replacementLength < 0 ? this._matchingLength : replacementLength
    this._matchingStr = TexlLexer.UnescapeName(this._script.substr(startIndex, this._matchingLength))

    return true
  }
}
