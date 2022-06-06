import { TexlBinding } from '../../binding'
import { CallInfo, FirstNameInfo } from '../../binding/bindingInfo'
import { TexlFunction } from '../../functions/TexlFunction'
import { TexlLexer } from '../../lexer'
import { CallNode, DottedNameNode, ErrorNode, FirstNameNode, TexlNode } from '../../syntax'
import { NodeKind } from '../../syntax/NodeKind'
import { DType, EnumSymbol, TypedName } from '../../types'
import { CharacterUtils, DName, DPath, KeyValuePair } from '../../utils'
import { AddSuggestionDryRunHelper } from './AddSuggestionDryRunHelper'
import { AddSuggestionHelper } from './AddSuggestionHelper'
import { IntellisenseData } from './IntellisenseData/IntellisenseData'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { IntellisenseSuggestionList } from './IntellisenseSuggestionList'
import { StringSuggestionHandler } from './SuggestionHandlers/CleanupHandlers/StringSuggestionHandler'
import { SuggestionIconKind } from './SuggestionIconKind'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'
import { distinct } from '../../utils/Arrays'
export class IntellisenseHelper {
  private static _addSuggestionHelper: AddSuggestionHelper = new AddSuggestionHelper()
  private static _addSuggestionDryRunHelper: AddSuggestionDryRunHelper = new AddSuggestionDryRunHelper()

  // Gets the inner most function and the current arg index from the current node, if any.
  // If there is no inner most function, current arg index will be -1
  // and argument count will be -1.
  public static TryGetInnerMostFunction(nodeCur: TexlNode, bind: TexlBinding): [boolean, TexlFunction, number, number] {
    // Contracts.AssertValue(nodeCur);
    // Contracts.AssertValue(bind);

    let funcCur: TexlFunction
    let iarg: number
    let carg: number

    let nodeParent: TexlNode = nodeCur.parent
    let nodeCallArg: TexlNode = nodeCur
    let callNode: CallNode = null

    while (nodeParent != null) {
      if (nodeParent.kind == NodeKind.Call) {
        callNode = nodeParent.asCall()
        break
      }
      // The last node before a call's list node is the call arg.
      if (nodeParent.kind != NodeKind.List) nodeCallArg = nodeParent

      nodeParent = nodeParent.parent
    }

    if (callNode == null) {
      iarg = -1
      carg = -1
      funcCur = null
      return [false, funcCur, iarg, carg]
    }

    // Contracts.AssertValue(nodeCallArg);

    let info: CallInfo = bind.getInfo(callNode)
    if (info.function != null) {
      carg = callNode.args.count
      for (iarg = 0; iarg < carg; iarg++) {
        if (callNode.args.children[iarg] == nodeCallArg) break
      }
      // Contracts.Assert(iarg < carg);
      funcCur = <TexlFunction>info.function
      return [true, funcCur, iarg, carg]
    }

    iarg = -1
    carg = -1
    funcCur = null
    return [false, funcCur, iarg, carg]
  }

  public static CanSuggestAfterValue(cursor: number, script: string): boolean {
    if (0 >= cursor || cursor > script.length) return false

    let result: boolean = CharacterUtils.IsSpace(script[cursor - 1])
    cursor--

    while (cursor > 0 && CharacterUtils.IsSpace(script[cursor])) cursor--

    return (result = result && script[cursor] != ',')
  }

  public static IsMatch(input: string, match: string): boolean {
    // Contracts.AssertValue(input);
    // Contracts.AssertValue(match);
    // input.StartsWith(match, StringComparison.OrdinalIgnoreCase);
    return match == '' ? true : input.toLocaleLowerCase().startsWith(match.toLocaleLowerCase())
  }

  public static DisambiguateGlobals(
    curList: IntellisenseSuggestionList,
    curSuggestion: UIString,
    suggestionKind: SuggestionKind,
    type: DType,
  ): UIString {
    // Contracts.AssertValue(curList);
    // Contracts.AssertValue(curSuggestion);
    // Contracts.AssertValid(type);

    let retVal: UIString = curSuggestion
    let sug: string = curSuggestion.text
    let suggestionKindIsGlobalOrScope: boolean =
      suggestionKind == SuggestionKind.Global || suggestionKind == SuggestionKind.ScopeVariable

    for (let s of curList.suggestionsForText(sug)) {
      // Retrive global/appVariable suggestions which
      //   -- Don't have the same type as current suggestion (because, if it's of same type, it will be filtered out anyway)
      //   -- Match the current suggestion text (filtered in the loop definition above for efficiency)
      if (
        (!suggestionKindIsGlobalOrScope && s.Kind != SuggestionKind.Global && s.Kind != SuggestionKind.ScopeVariable) ||
        s.Type == type
      ) {
        continue
      }

      // The retrived list represents collisions. Update the suggestion text with global disambiguation.

      let punctuatorLen: number = TexlLexer.PunctuatorAt.length + TexlLexer.PunctuatorAt.length
      // The suggestion already in the list is global. Update it.
      if (s.Kind == SuggestionKind.Global || s.Kind == SuggestionKind.ScopeVariable) {
        let index: number = curList.IndexOf(s)
        // Contracts.Assert(index >= 0);

        let dispText: UIString = curList.get(index).DisplayText // curList[index].DisplayText;

        // If we are already using the global syntax, we should not add it again.
        if (dispText.text.startsWith(TexlLexer.PunctuatorBracketOpen + TexlLexer.PunctuatorAt)) continue

        curList.updateDisplayText(
          index,
          new UIString(
            TexlLexer.PunctuatorBracketOpen + TexlLexer.PunctuatorAt + dispText.text + TexlLexer.PunctuatorBracketClose,
            dispText.highlightStart + punctuatorLen,
            dispText.highlightEnd + punctuatorLen,
          ),
        )
      }
      // Current suggestion is global. Update it.
      else
        retVal = new UIString(
          TexlLexer.PunctuatorBracketOpen + TexlLexer.PunctuatorAt + sug + TexlLexer.PunctuatorBracketClose,
          curSuggestion.highlightStart + punctuatorLen,
          curSuggestion.highlightEnd + punctuatorLen,
        )
    }
    return retVal
  }

  public static CheckAndAddSuggestion(suggestion: IntellisenseSuggestion, suggestionList: IntellisenseSuggestionList) {
    if (suggestionList.containsSuggestion(suggestion.DisplayText.text)) return false

    suggestionList.add(suggestion)
    return true
  }

  public static AddSuggestion(
    intellisenseData: IntellisenseData,
    suggestion: string,
    suggestionKind: SuggestionKind,
    iconKind: SuggestionIconKind,
    type: DType,
    requiresSuggestionEscaping: boolean,
    sortPriority = 0,
  ) {
    return IntellisenseHelper._addSuggestionHelper.AddSuggestion(
      intellisenseData,
      suggestion,
      suggestionKind,
      iconKind,
      type,
      requiresSuggestionEscaping,
      sortPriority,
    )
  }

  public static AddSuggestionsForMatches(
    intellisenseData: IntellisenseData,
    possibilities: string[],
    kind: SuggestionKind,
    iconKind: SuggestionIconKind,
    requiresSuggestionEscaping: boolean,
    sortPriority?: number,
  ): void
  public static AddSuggestionsForMatches(
    intellisenseData: IntellisenseData,
    possibilities: KeyValuePair<string, SuggestionIconKind>[],
    kind: SuggestionKind,
    requiresSuggestionEscaping: boolean,
    sortPriority?: number,
  ): void
  public static AddSuggestionsForMatches(
    intellisenseData: IntellisenseData,
    possibilities?: any,
    kind?: SuggestionKind,
    iconKind?: any,
    requiresSuggestionEscaping?: any,
    sortPriority: number = 0,
  ): void {
    if (typeof possibilities[0] == 'string') {
      //string[]
      // Contracts.AssertValue(intellisenseData);
      // Contracts.AssertValue(possibilities);

      for (let possibility of possibilities) {
        IntellisenseHelper.AddSuggestion(
          intellisenseData,
          possibility,
          kind,
          iconKind,
          DType.Unknown,
          requiresSuggestionEscaping,
          sortPriority,
        )
      }
    } else {
      // Contracts.AssertValue(intellisenseData);
      // Contracts.AssertValue(possibilities);
      //KeyValuePair<string, SuggestionIconKind>[]

      for (let possibility of possibilities) {
        IntellisenseHelper.AddSuggestion(
          intellisenseData,
          possibility.key,
          kind,
          possibility.value,
          DType.Unknown,
          requiresSuggestionEscaping,
          sortPriority,
        )
      }
    }
  }

  // public static AddSuggestionsForMatches(intellisenseData: IntellisenseData,
  //   possibilities: KeyValuePair<string, SuggestionIconKind>[], kind: SuggestionKind,
  //   requiresSuggestionEscaping: boolean, sortPriority = 0): void {
  //   // Contracts.AssertValue(intellisenseData);
  //   // Contracts.AssertValue(possibilities);

  //   for (let possibility of possibilities) {
  //     IntellisenseHelper.AddSuggestion(intellisenseData, possibility.key, kind, possibility.value, DType.Unknown, requiresSuggestionEscaping, sortPriority);
  //   }
  // }

  /// <summary>
  /// Suggest possibilities that can come after a value of a certain type.
  /// </summary>
  public static AddSuggestionsForAfterValue(intellisenseData: IntellisenseData, type: DType): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValid(type);

    intellisenseData.Suggestions.clear()
    intellisenseData.SubstringSuggestions.clear()
    intellisenseData.SetMatchArea(intellisenseData.ReplacementStartIndex, intellisenseData.ReplacementStartIndex)
    let possibility: string[] = TexlLexer.LocalizedInstance.getOperatorKeywords(type)
    IntellisenseHelper.AddSuggestionsForMatches(
      intellisenseData,
      possibility,
      SuggestionKind.BinaryOperator,
      SuggestionIconKind.Other,
      false,
    )
  }

  /// <summary>
  /// Adds suggestions for an enum, with an optional prefix.
  /// </summary>
  /// <param name="intellisenseData"></param>
  /// <param name="enumInfo"></param>
  /// <param name="prefix"></param>
  public static AddSuggestionsForEnum(intellisenseData: IntellisenseData, enumInfo: EnumSymbol, prefix = ''): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(enumInfo);
    // Contracts.AssertValue(prefix);

    let anyCollisionExists = false
    let locNameTypePairs = [] // new List<Tuple<String, DType>>();

    // We do not need to get the localized names since GetNames will only return invariant.
    // Instead, we use the invariant names later with the enumInfo to retrieve the localized name.
    for (let typedName of enumInfo.enumType.getNames(DPath.Root)) {
      let tryGetLocValueNameRes = enumInfo.tryGetLocValueName(typedName.name.value)
      let locName = tryGetLocValueNameRes[1]
      // enumInfo.tryGetLocValueName(typedName.name.value, out locName).Verify();
      let escapedLocName: string = TexlLexer.EscapeName(locName)
      let collisionExists = intellisenseData.DoesNameCollide(locName)
      if (collisionExists) {
        let candidate: string = prefix + escapedLocName
        let canAddSuggestion: boolean = IntellisenseHelper._addSuggestionDryRunHelper.AddSuggestion(
          intellisenseData,
          candidate,
          SuggestionKind.Global,
          SuggestionIconKind.Other,
          typedName.type,
          false,
        )
        anyCollisionExists = anyCollisionExists || canAddSuggestion
      }
      // locNameTypePairs.Add(new Tuple<String, DType>(escapedLocName, typedName.Type));
      locNameTypePairs.push([escapedLocName, typedName.type])
    }

    for (let locNameTypePair of locNameTypePairs) {
      let suggestion: string =
        anyCollisionExists || !intellisenseData.SuggestUnqualifiedEnums
          ? prefix + <string>locNameTypePair[0]
          : <string>locNameTypePair[0]
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        suggestion,
        SuggestionKind.Global,
        SuggestionIconKind.Other,
        <DType>locNameTypePair[1],
        false,
      )
    }
  }

  public static AddSuggestionsForNamesInType(
    type: DType,
    data: IntellisenseData,
    createTableSuggestion: boolean,
  ): void {
    // Contracts.AssertValid(type);
    // Contracts.AssertValue(data);

    for (let field of type.getNames(DPath.Root)) {
      let usedName = field.name
      let TryGetDisplayNameForColumn = DType.TryGetDisplayNameForColumn(type, usedName.value)
      let maybeDisplayName = TryGetDisplayNameForColumn[1]
      if (TryGetDisplayNameForColumn[0]) {
        usedName = new DName(maybeDisplayName)
      }

      let suggestionType: DType = field.type
      if (createTableSuggestion) {
        suggestionType = DType.CreateTable(new TypedName(type, usedName))
      }

      IntellisenseHelper.AddSuggestion(
        data,
        usedName.value,
        SuggestionKind.Field,
        SuggestionIconKind.Other,
        suggestionType,
        true,
      )
    }
  }

  public static AddSuggestionsForNamespace(
    intellisenseData: IntellisenseData,
    namespaceFunctions: TexlFunction[],
  ): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(namespaceFunctions);
    // Contracts.AssertAllValues(namespaceFunctions);

    for (let func of namespaceFunctions) {
      // Note we're using the unqualified name, since we're on the RHS of a "namespace." identifier.
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        func.name,
        SuggestionKind.Function,
        SuggestionIconKind.Function,
        func.returnType,
        true,
      )
    }
  }

  /// <summary>
  /// Adds suggestions that start with the MatchingString from the given type.
  /// </summary>
  public static AddTopLevelSuggestions(intellisenseData: IntellisenseData, type: DType, prefix = '') {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.Assert(type.IsValid);
    // Contracts.Assert(prefix.length == 0 || (TexlLexer.PunctuatorBang + TexlLexer.PunctuatorDot).IndexOf(prefix[prefix.length - 1]) >= 0);

    for (let tName of type.getAllNames(DPath.Root)) {
      if (!intellisenseData.TryAddCustomColumnTypeSuggestions(tName.type)) {
        let usedName = tName.name

        let TryGetDisplayNameForColumnRes = DType.TryGetDisplayNameForColumn(type, usedName.value)
        let maybeDisplayName = TryGetDisplayNameForColumnRes[1]

        if (TryGetDisplayNameForColumnRes[0]) usedName = new DName(maybeDisplayName)
        IntellisenseHelper.AddSuggestion(
          intellisenseData,
          prefix + TexlLexer.EscapeName(usedName.value),
          SuggestionKind.Global,
          SuggestionIconKind.Other,
          tName.type,
          false,
        )
      }
    }
  }

  /// <summary>
  /// Adds suggestions for type scoped at current cursor position.
  /// </summary>
  public static AddTopLevelSuggestionsForCursorType(
    intellisenseData: IntellisenseData,
    callNode: CallNode,
    argPosition: number,
  ) {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(callNode);
    // Contracts.Assert(argPosition >= 0);

    let info: CallInfo = intellisenseData.Binding.getInfo(callNode)
    // Contracts.AssertValue(info);
    let type: DType = info.cursorType

    // Suggestions are added for the error nodes in the next step.
    if (
      info.function != null &&
      argPosition <= info.function.maxArity &&
      info.function.isLambdaParam(argPosition) &&
      !info.function.hasSuggestionsForParam(argPosition) &&
      type.isValid
    ) {
      if (info.function.isLambdaParam(argPosition) && type.containsDataEntityType(DPath.Root)) {
        let error = false
        let dropAllOfTableRelationshipsRes = type.dropAllOfTableRelationships(error, DPath.Root)
        type = dropAllOfTableRelationshipsRes[0]
        error = dropAllOfTableRelationshipsRes[1]
        if (error) {
          return
        }
      }

      // if (info.ScopeIdentifier != default) {
      if (info.scopeIdentifier.value != '') {
        IntellisenseHelper.AddSuggestion(
          intellisenseData,
          info.scopeIdentifier.value,
          SuggestionKind.Global,
          SuggestionIconKind.Other,
          type,
          false,
        )
      }

      if (!info.requiresScopeIdentifier) {
        IntellisenseHelper.AddTopLevelSuggestions(intellisenseData, type)
      }
    }
  }

  public static GetEnumType(intellisenseData: IntellisenseData, node: TexlNode) {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(node);

    let dottedNode: DottedNameNode
    let firstNameNode: FirstNameNode
    if ((dottedNode = node.asDottedName()) != null) {
      return intellisenseData.Binding.getType(dottedNode.left)
    }

    if ((firstNameNode = node.asFirstName()) != null) {
      let firstNameInfo: FirstNameInfo = intellisenseData.Binding.getInfo(firstNameNode) //.VerifyValue();

      let parent: DPath = firstNameInfo.path.parent
      if (!parent.name.isValid) {
        return DType.Unknown
      }

      let TryGetEnumSymbolRes = intellisenseData.TryGetEnumSymbolBinding(parent.name.value, intellisenseData.Binding)
      let enumSymbol: EnumSymbol = TryGetEnumSymbolRes[1]
      if (TryGetEnumSymbolRes[0]) {
        return enumSymbol.enumType
      }
    }

    return DType.Unknown
  }

  public static ClosestParentScopeTypeForSuggestions(callNode: CallNode, intellisenseData: IntellisenseData): DType {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(intellisenseData);

    let currentNode: TexlNode = callNode
    while (currentNode.parent != null) {
      currentNode = currentNode.parent
      if (currentNode instanceof CallNode) {
        let callNodeCurr = <CallNode>(<unknown>currentNode)
        let parentScopeType: DType = IntellisenseHelper.ScopeTypeForArgumentSuggestions(callNodeCurr, intellisenseData)
        if (parentScopeType != null && parentScopeType != DType.Unknown) return parentScopeType
      }
    }

    return DType.Unknown
  }

  public static GetColumnNameStringSuggestions(scopeType: DType): KeyValuePair<string, DType>[] {
    // Contracts.AssertValid(scopeType);
    let arr: KeyValuePair<string, DType>[] = []
    for (let name of scopeType.getNames(DPath.Root)) {
      arr.push({
        key: '"' + CharacterUtils.ExcelEscapeString(name.name.value) + '"',
        value: name.type,
      })
    }
    return arr
  }

  public static GetSuggestionsFromType(typeToSuggestFrom: DType, suggestionType: DType): KeyValuePair<string, DType>[] {
    // Contracts.AssertValid(typeToSuggestFrom);
    // Contracts.AssertValid(suggestionType);

    // If no suggestion type provided, accept all suggestions.
    if (suggestionType == DType.Invalid) suggestionType = DType.Error

    // List < KeyValuePair < string, DType >> suggestions = new List<KeyValuePair<string, DType>>();
    let suggestions: KeyValuePair<string, DType>[] = []
    for (let tName of typeToSuggestFrom.getNames(DPath.Root)) {
      if (suggestionType.accepts(tName.type)) {
        let usedName = tName.name.value

        let TryGetDisplayNameForColumnRes = DType.TryGetDisplayNameForColumn(typeToSuggestFrom, usedName)
        let maybeDisplayName = TryGetDisplayNameForColumnRes[1]
        if (TryGetDisplayNameForColumnRes[0]) usedName = maybeDisplayName

        suggestions.push({
          key: usedName,
          value: tName.type,
        })
      }
    }
    return suggestions
  }

  public static ScopeTypeForArgumentSuggestions(callNode: CallNode, intellisenseData: IntellisenseData): DType {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(intellisenseData);

    let info = intellisenseData.Binding.getInfo(callNode)
    if (info.function.useParentScopeForArgumentSuggestions) {
      return IntellisenseHelper.ClosestParentScopeTypeForSuggestions(callNode, intellisenseData)
    }

    if (callNode.args.count <= info.function.suggestionTypeReferenceParamIndex) return DType.Unknown

    let referenceArg: TexlNode = callNode.args.children[info.function.suggestionTypeReferenceParamIndex]
    return info.function.usesEnumNamespace
      ? IntellisenseHelper.GetEnumType(intellisenseData, referenceArg)
      : intellisenseData.Binding.getType(referenceArg)
  }

  /// <summary>
  /// Adds suggestions for given argument position.
  /// Returns true if any function specific suggestions are added to the list. Otherwise false.
  /// </summary>
  /// <returns></returns>
  public static TryAddSpecificSuggestionsForGivenArgPosition(
    intellisenseData: IntellisenseData,
    callNode: CallNode,
    argumentIndex: number,
  ): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(callNode);
    // Contracts.Assert(argumentIndex >= 0);

    let info: CallInfo = intellisenseData.Binding.getInfo(callNode)
    // Contracts.AssertValue(info);

    if (callNode.args.count < 0 || info.function == null || !info.function.hasSuggestionsForParam(argumentIndex)) {
      return false
    }

    // Adding suggestions for callNode arguments from the Function's GetArgumentSuggestions method
    // Keep track of the previous suggestion counts so we can tell whether or not we have added any
    let countSuggestionsBefore: number = intellisenseData.Suggestions.Count()
    let countSubstringSuggestionsBefore: number = intellisenseData.SubstringSuggestions.Count()

    // If the function has specific suggestions for the argument,
    // indicate it to the caller.
    let func = info.function
    let suggestionKind = intellisenseData.GetFunctionSuggestionKind(func, argumentIndex)
    let requiresSuggestionEscaping: boolean
    let err: ErrorNode

    if (
      argumentIndex >= 0 &&
      argumentIndex < callNode.args.count &&
      (err = callNode.args.children[argumentIndex].asError()) != null &&
      err.token.Span.startsWith(intellisenseData.Script, '"')
    ) {
      intellisenseData.CleanupHandlers.push(new StringSuggestionHandler(err.token.Span.min))
    }

    let scopeType: DType = IntellisenseHelper.ScopeTypeForArgumentSuggestions(callNode, intellisenseData)

    let GetArgumentSuggestionsRes = intellisenseData.GetArgumentSuggestions(
      func,
      scopeType,
      argumentIndex,
      callNode.args.children,
    )
    requiresSuggestionEscaping = GetArgumentSuggestionsRes[1]
    let argSuggestions = GetArgumentSuggestionsRes[0]

    for (let suggestion of argSuggestions) {
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        suggestion.key,
        suggestionKind,
        SuggestionIconKind.Function,
        suggestion.value,
        requiresSuggestionEscaping,
      )
    }

    return (
      intellisenseData.Suggestions.Count() > countSuggestionsBefore ||
      intellisenseData.SubstringSuggestions.Count() > countSubstringSuggestionsBefore
    )
  }

  /// <summary>
  /// Adds suggestions for a given node.
  /// </summary>
  /// <param name="node">Node for which suggestions are needed.</param>
  /// <param name="hasSpecificSuggestions">Flag to indicate if inner most function has any specific suggestions.</param>
  /// <param name="currentNode">Current node in the traversal.</param>
  public static AddTopLevelSuggestionsForGivenNode(
    intellisenseData: IntellisenseData,
    node: TexlNode,
    currentNode: TexlNode,
  ): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(currentNode);

    let callNode: CallNode = IntellisenseHelper.GetNearestCallNode(currentNode)
    if (callNode == null) return false

    if (callNode.args.count == 0) {
      IntellisenseHelper.AddTopLevelSuggestionsForCursorType(intellisenseData, callNode, 0)
      return IntellisenseHelper.TryAddSpecificSuggestionsForGivenArgPosition(intellisenseData, callNode, 0)
    }

    for (let i = 0; i < callNode.args.count; i++) {
      if (node.inTree(callNode.args.children[i])) {
        IntellisenseHelper.AddTopLevelSuggestionsForCursorType(intellisenseData, callNode, i)
        if (
          node == currentNode &&
          IntellisenseHelper.TryAddSpecificSuggestionsForGivenArgPosition(intellisenseData, callNode, i)
        )
          return true
      }
    }

    if (callNode.parent != null)
      return IntellisenseHelper.AddTopLevelSuggestionsForGivenNode(intellisenseData, node, callNode.parent)

    return false
  }

  private static GetNearestCallNode(node: TexlNode): CallNode {
    // Contracts.AssertValue(node);
    let parent: TexlNode = node

    while (parent != null) {
      let callNode: CallNode
      if ((callNode = parent.asCall()) != null) {
        return callNode
      }
      parent = parent.parent
    }

    return null
  }

  /// <summary>
  /// Adds suggestions that start with the matchingString from the result from the types in scope.
  /// </summary>
  public static AddSuggestionsForTopLevel(intellisenseData: IntellisenseData, node: TexlNode) {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(node);

    return IntellisenseHelper.AddTopLevelSuggestionsForGivenNode(intellisenseData, node, node)
  }

  /// <summary>
  /// This is a Private method used only by the SuggestFunctions() method to add overload suggestions to the existing suggestions.
  /// </summary>
  public static AddFunctionOverloads(
    qualifiedName: string,
    suggestions: IntellisenseSuggestionList,
    funcSuggestion: IntellisenseSuggestion,
  ) {
    // Contracts.AssertNonEmpty(qualifiedName);
    // Contracts.AssertValue(suggestions);
    // Contracts.AssertValue(funcSuggestion);

    let overloadMatch: number = suggestions.FindIndex(
      (x) => x.Kind == SuggestionKind.Function && x.FunctionName == qualifiedName,
    )

    if (overloadMatch > -1) {
      suggestions.get(overloadMatch).addOverloads(funcSuggestion.Overloads)
    } else {
      IntellisenseHelper.CheckAndAddSuggestion(funcSuggestion, suggestions)
    }
  }

  public static AddSuggestionsForFunctions(intellisenseData: IntellisenseData) {
    // TASK: 76039: Intellisense: Update intellisense to filter suggestions based on the expected type of the text being typed in UI
    // Contracts.AssertValue(intellisenseData);

    for (let func of intellisenseData.Binding.nameResolver.functions) {
      let qualifiedName: string = func.qualifiedName
      let highlightStart: number = qualifiedName
        .toLocaleLowerCase()
        .indexOf(intellisenseData.MatchingStr.toLocaleLowerCase()) //.IndexOf(intellisenseData.MatchingStr, StringComparison.OrdinalIgnoreCase);
      let highlightEnd: number = intellisenseData.MatchingStr.length
      if (intellisenseData.ShouldSuggestFunction(func)) {
        if (IntellisenseHelper.IsMatch(qualifiedName, intellisenseData.MatchingStr)) {
          IntellisenseHelper.AddFunctionOverloads(
            qualifiedName,
            intellisenseData.Suggestions,
            IntellisenseSuggestion.newInstanceByTexlFunc(
              func,
              intellisenseData.BoundTo,
              new UIString(qualifiedName, 0, highlightEnd),
            ),
          )
        } else if (highlightStart > -1) {
          IntellisenseHelper.AddFunctionOverloads(
            qualifiedName,
            intellisenseData.SubstringSuggestions,
            IntellisenseSuggestion.newInstanceByTexlFunc(
              func,
              intellisenseData.BoundTo,
              new UIString(qualifiedName, highlightStart, highlightStart + highlightEnd),
            ),
          )
        }
      }
    }
  }

  /// <summary>
  /// Based on our current token, determine how much of it should be replaced
  /// </summary>
  /// <param name="intellisenseData"></param>
  /// <param name="tokenStart"></param>
  /// <param name="tokenEnd"></param>
  /// <param name="validNames"></param>
  /// <returns></returns>
  public static GetReplacementLength(
    intellisenseData: IntellisenseData,
    tokenStart: number,
    tokenEnd: number,
    validNames: string[],
  ) {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.Assert(tokenStart <= intellisenseData.CursorPos);
    // Contracts.Assert(intellisenseData.CursorPos <= tokenEnd);
    // Contracts.Assert(tokenEnd <= intellisenseData.Script.length);
    // Contracts.AssertAllNonEmpty(validNames);

    let cursorPos: number = intellisenseData.CursorPos
    // If the cursor is at the start of a token, then do not replace anything
    if (tokenStart == intellisenseData.CursorPos) return 0

    let forwardOverwrittenText: string = intellisenseData.Script.substr(cursorPos, tokenEnd - cursorPos)
    for (let validName of validNames) {
      // Contracts.AssertNonEmpty(validName);

      if (validName == forwardOverwrittenText) return cursorPos - tokenStart // If the remaining text of the token is a valid name, we shouldn't overwrite it
    }

    return tokenEnd - tokenStart
  }

  /// <summary>
  /// Adds suggestions that start with the matchingString from the top level scope of the binding.
  /// </summary>
  public static AddSuggestionsForRuleScope(intellisenseData: IntellisenseData) {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(intellisenseData.Binding);

    let scopeType = intellisenseData.ContextScope
    if (scopeType == null) return

    IntellisenseHelper.AddTopLevelSuggestions(intellisenseData, scopeType)
  }

  public static AddSuggestionsForGlobals(intellisenseData: IntellisenseData) {
    // Contracts.AssertValue(intellisenseData);

    intellisenseData.AddCustomSuggestionsForGlobals()

    //TODO ts Distinct
    // Suggest function namespaces
    // let namespaces = intellisenseData.Binding.nameResolver.functions.Select(func => func.namespace).Distinct();
    let funcs = intellisenseData.Binding.nameResolver.functions.map((func) => func.namespace)
    let namespaces = distinct(funcs)
    // .Select(func => func.namespace).Distinct();
    // let namespaces = Object.keys(intellisenseData.Binding.nameResolver.functions.map(u => u.namespace).reduce((un, u) => ({ ...un, u }), {}));

    for (let funcNamespace of namespaces) {
      if (funcNamespace == DPath.Root) continue

      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        funcNamespace.name.value,
        SuggestionKind.Global,
        SuggestionIconKind.Other,
        DType.Unknown,
        true,
      )
    }
  }

  public static AddSuggestionsForUnaryOperatorKeyWords(intellisenseData: IntellisenseData) {
    // Contracts.AssertValue(intellisenseData);

    // TASK: 76039: Intellisense: Update intellisense to filter suggestions based on the expected type of the text being typed in UI
    IntellisenseHelper.AddSuggestionsForMatches(
      intellisenseData,
      TexlLexer.LocalizedInstance.getUnaryOperatorKeywords(),
      SuggestionKind.KeyWord,
      SuggestionIconKind.Other,
      false,
    )
  }

  public static AddSuggestionsForEnums(intellisenseData: IntellisenseData) {
    // Contracts.AssertValue(intellisenseData);

    let suggestions = intellisenseData.Suggestions
    let substringSuggestions = intellisenseData.SubstringSuggestions
    let countSuggBefore: number = suggestions.Count()
    let countSubSuggBefore: number = substringSuggestions.Count()

    for (let enumInfo of intellisenseData.EnumSymbols) {
      let enumType = enumInfo.enumType
      let enumName = enumInfo.name

      // TASK: 76039: Intellisense: Update intellisense to filter suggestions based on the expected type of the text being typed in UI
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        enumName,
        SuggestionKind.Enum,
        SuggestionIconKind.Other,
        enumType,
        true,
      )

      IntellisenseHelper.AddSuggestionsForEnum(intellisenseData, enumInfo, enumName + TexlLexer.PunctuatorDot)
    }

    if (
      suggestions.Count() + substringSuggestions.Count() == countSuggBefore + countSubSuggBefore + 1 &&
      intellisenseData.SuggestUnqualifiedEnums
    ) {
      let enumSuggestion: string =
        suggestions.Count() > countSuggBefore
          ? suggestions.get(countSuggBefore).Text
          : substringSuggestions.get(countSubSuggBefore).Text
      let dotIndex: number = enumSuggestion.lastIndexOf(TexlLexer.PunctuatorDot)

      // Assert '.' is not present or not at the beginning or the end of the EnumSuggestion
      // Contracts.Assert(dotIndex == -1 || (0 < dotIndex && dotIndex < enumSuggestion.length - 1));
      let unqualifiedEnum = enumSuggestion.substr(dotIndex + 1)
      // If the Enum we are about suggest unqualified (i.e. just 'Blue' instead of Color!Blue)
      // has a name collision with some Item already in the suggestionlist we should not continue
      // and suggest it.
      if (
        suggestions.list.some((x) => x.Text == unqualifiedEnum) ||
        substringSuggestions.list.some((x) => x.Text == unqualifiedEnum)
      )
        return

      let enumType: DType
      if (suggestions.Count() > countSuggBefore) {
        enumType = suggestions.get(countSuggBefore).Type //[countSuggBefore].Type;
        suggestions.removeAt(suggestions.Count() - 1)
      } else {
        // Contracts.Assert(substringSuggestions.Count > countSubSuggBefore);
        enumType = substringSuggestions.get(countSubSuggBefore).Type //[countSubSuggBefore].Type;
        substringSuggestions.removeAt(substringSuggestions.Count() - 1)
      }

      // Add the unqualified Enum.
      // Note: The suggestion has already been escaped when it was previously added
      IntellisenseHelper.AddSuggestion(
        intellisenseData,
        unqualifiedEnum,
        SuggestionKind.Enum,
        SuggestionIconKind.Other,
        enumType,
        false,
      )
    }
  }

  public static AddSuggestionsForValuePossibilities(intellisenseData: IntellisenseData, node: TexlNode): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(node);

    let suggestionCount: number = intellisenseData.Suggestions.Count() + intellisenseData.SubstringSuggestions.Count()
    IntellisenseHelper.AddSuggestionsForRuleScope(intellisenseData)
    IntellisenseHelper.AddSuggestionsForTopLevel(intellisenseData, node)
    IntellisenseHelper.AddSuggestionsForFunctions(intellisenseData)
    intellisenseData.AddSuggestionsForConstantKeywords()
    IntellisenseHelper.AddSuggestionsForGlobals(intellisenseData)
    intellisenseData.AfterAddSuggestionsForGlobals()
    IntellisenseHelper.AddSuggestionsForUnaryOperatorKeyWords(intellisenseData)
    intellisenseData.AfterAddSuggestionsForUnaryOperatorKeywords()
    IntellisenseHelper.AddSuggestionsForEnums(intellisenseData)

    intellisenseData.AddCustomSuggestionsForValuePossibilities()

    return suggestionCount < intellisenseData.Suggestions.Count() + intellisenseData.SubstringSuggestions.Count()
  }

  public static IsPunctuatorColonNextToCursor(cursorPos: number, script: string): boolean {
    // Contracts.Assert(0 <= cursorPos && cursorPos <= script.length);

    let colonLen = TexlLexer.PunctuatorColon.length
    return script.length >= cursorPos + colonLen && script.substr(cursorPos, colonLen) == TexlLexer.PunctuatorColon
  }
}
