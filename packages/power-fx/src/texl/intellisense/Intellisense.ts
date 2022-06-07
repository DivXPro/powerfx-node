import { TexlBinding } from '../../binding'
import { CallInfo } from '../../binding/bindingInfo'
import { TexlFunction } from '../../functions/TexlFunction'
import { CommentToken } from '../../lexer/tokens'
import { BinaryOpNode, CallNode, TexlNode } from '../../syntax'
import { Formula } from '../../syntax/Formula'
import { NodeKind } from '../../syntax/NodeKind'
import { DType, EnumStore, FunctionCategories } from '../../types'
import { distinct } from '../../utils/Arrays'
import Exception from '../../utils/typescriptNet/Exception'
import { IIntellisense } from './IIntellisense'
import { IIntellisenseContext } from './IIntellisenseContext'
import { IIntellisenseResult } from './IIntellisenseResult'
import { IntellisenseContext } from './IntellisenseContext'
import { DefaultIntellisenseData } from './IntellisenseData/DefaultIntellisenseData'
import { IntellisenseData } from './IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from './IntellisenseHelper'
import { IntellisenseResult } from './IntellisenseResult'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { ISuggestionHandler } from './SuggestionHandlers/ISuggestionHandler'

export declare type IsValidSuggestion = (
  intellisenseData: IntellisenseData,
  suggestion: IntellisenseSuggestion
) => boolean

// internal partial class Intellisense : IIntellisense
export class Intellisense implements IIntellisense {
  protected readonly _suggestionHandlers: Array<ISuggestionHandler>
  protected readonly _enumStore: EnumStore

  constructor(
    enumStore: EnumStore,
    suggestionHandlers: Array<ISuggestionHandler>
  ) {
    // Contracts.AssertValue(suggestionHandlers);

    this._enumStore = enumStore
    this._suggestionHandlers = suggestionHandlers
  }

  public Suggest(
    context: IntellisenseContext,
    binding: TexlBinding,
    formula: Formula
  ): IIntellisenseResult {
    // Contracts.CheckValue(context, "context");
    // Contracts.CheckValue(binding, "binding");
    // Contracts.CheckValue(formula, "formula");

    // TODO: Hoist scenario tracking out of language module.
    // Guid suggestScenarioGuid = Common.Telemetry.Log.Instance.StartScenario("IntellisenseSuggest");

    try {
      let intellisenseData: IntellisenseData
      let TryInitializeIntellisenseContextRes =
        this.TryInitializeIntellisenseContext(context, binding, formula)
      intellisenseData = TryInitializeIntellisenseContextRes[1]
      if (!TryInitializeIntellisenseContextRes[0]) {
        return new IntellisenseResult(new DefaultIntellisenseData(), [], null)
      }

      for (let handler of this._suggestionHandlers) {
        if (handler.Run(intellisenseData)) break
      }

      return this.Finalize(context, intellisenseData)
    } catch (error) {
      console.error('Intellisense.Suggest方法出现异常', error)
      // If there is any exception, we don't need to crash. Instead, Suggest() will simply
      // return an empty result set along with exception for client use.
      return new IntellisenseResult(
        new DefaultIntellisenseData(),
        [],
        new Exception(error.toString())
      )
    }
    // TODO: Hoist scenario tracking out of language module.
    // finally
    // {
    //     Common.Telemetry.Log.Instance.EndScenario(suggestScenarioGuid);
    // }
  }

  public static TryGetExpectedTypeForBinaryOp(
    binding: TexlBinding,
    curNode: TexlNode,
    cursorPos: number
  ): [boolean, DType] {
    let expectedType: DType
    // If we are in a binary operation context, the expected type is relative to the binary operation.
    if (
      curNode != null &&
      curNode.parent != null &&
      curNode.parent.kind == NodeKind.BinaryOp
    ) {
      let binaryOpNode: BinaryOpNode = curNode.parent.castBinaryOp()
      let coercedType: DType
      let expectedNode: TexlNode = null
      if (cursorPos < binaryOpNode.token.Span.min)
        // Cursor is before the binary operator. Expected type is equal to the type of right side.
        expectedNode = binaryOpNode.right
      else if (cursorPos > binaryOpNode.token.Span.lim)
        // Cursor is after the binary operator. Expected type is equal to the type of left side.
        expectedNode = binaryOpNode.left

      if (expectedNode != null) {
        let tryGetCoercedTypeRes = binding.tryGetCoercedType(expectedNode)
        coercedType = tryGetCoercedTypeRes[1]
        expectedType = tryGetCoercedTypeRes[0]
          ? coercedType
          : binding.getType(expectedNode)
        return [true, expectedType]
      }
    }

    expectedType = DType.Error
    return [false, expectedType]
  }

  public static FindCurFuncAndArgs(
    curNode: TexlNode,
    cursorPos: number,
    binding: TexlBinding
  ): [boolean, TexlFunction, number, number, DType] {
    // Contracts.AssertValue(curNode);
    // Contracts.AssertValue(binding);
    let curFunc: TexlFunction
    let argIndex: number
    let argCount: number
    let expectedType: DType
    if (curNode.kind == NodeKind.Call) {
      let callNode: CallNode = curNode.castCall()
      if (
        callNode.token.Span.lim <= cursorPos &&
        callNode.parenClose != null &&
        cursorPos <= callNode.parenClose.Span.min
      ) {
        let info: CallInfo = binding.getInfo(callNode)

        if (info.function != null) {
          curFunc = info.function
          argIndex = 0
          argCount = callNode.args.count
          expectedType =
            curFunc.paramTypes.length > 0 ? curFunc.paramTypes[0] : DType.Error

          return [true, curFunc, argIndex, argCount, expectedType]
        }
      }
    }

    let TryGetInnerMostFunctionRes = IntellisenseHelper.TryGetInnerMostFunction(
      curNode,
      binding
    )
    curFunc = TryGetInnerMostFunctionRes[1]
    argIndex = TryGetInnerMostFunctionRes[2]
    argCount = TryGetInnerMostFunctionRes[3]
    if (TryGetInnerMostFunctionRes[0]) {
      expectedType =
        curFunc.paramTypes.length > argIndex
          ? curFunc.paramTypes[argIndex]
          : DType.Error
      return [true, curFunc, argIndex, argCount, expectedType]
    }

    expectedType = DType.Error
    return [false, curFunc, argIndex, argCount, expectedType]
  }

  // Filters out all the types from the suggestions that are not accepted by the given type.
  public static TypeFilter(
    type: DType,
    matchingStr: string,
    suggestions: IntellisenseSuggestion[]
  ): IntellisenseSuggestion[] {
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertValue(suggestions);

    if (
      matchingStr == '' ||
      (matchingStr == null && type != DType.Error && type != DType.Unknown)
    ) {
      // Determine a safe start for suggestions whose types match the specified type.
      // Non-zero sort priorities take precedence over type filtering.
      let j = 0
      while (j < suggestions.length && suggestions[j].SortPriority > 0) j++

      let temp: IntellisenseSuggestion
      for (let i: number = j; i < suggestions.length; i++) {
        if (suggestions[i].Type == type) {
          let k = i
          temp = suggestions[k]
          temp.SetTypematch()
          while (k > j) {
            suggestions[k] = suggestions[k - 1]
            k--
          }
          suggestions[j++] = temp
        }
      }
    }
    return suggestions
  }

  protected static TryGetFunctionCategory(
    category: string
  ): [boolean, FunctionCategories] {
    // Contracts.AssertNonEmpty(category);
    let mask: FunctionCategories
    // foreach(let cat in Enum.GetValues(typeof (FunctionCategories)).Cast<FunctionCategories>())
    // {
    //   if (category.Equals(cat.ToString(), StringComparison.OrdinalIgnoreCase)) {
    //     mask = cat;
    //     return true;
    //   }
    // }
    // mask = default(FunctionCategories);
    return [false, mask]
  }

  protected static TypeMatchPriority(
    type: DType,
    suggestions: IntellisenseSuggestion[]
  ): void {
    // Contracts.Assert(type.IsValid);
    // Contracts.AssertValue(suggestions);

    // The string type is too nebulous to push all matching string values to the top of the suggestion list
    if (type == DType.Unknown || type == DType.Error || type == DType.String)
      return

    for (let suggestion of suggestions) {
      if (!suggestion.Type.isUnknown && type.accepts(suggestion.Type)) {
        suggestion.SortPriority++
      }
    }
  }

  private TryInitializeIntellisenseContext(
    context: IIntellisenseContext,
    binding: TexlBinding,
    formula: Formula
  ): [boolean, IntellisenseData] {
    // Contracts.AssertValue(context);
    let data: IntellisenseData

    let currentNode: TexlNode = TexlNode.FindNode(
      formula.parseTree,
      context.CursorPosition
    )
    let curFunc: TexlFunction
    let argIndex, argCount: number
    let expectedType: DType
    let isValidSuggestionFunc: IsValidSuggestion

    let GetFunctionAndTypeInformationRes = this.GetFunctionAndTypeInformation(
      context,
      currentNode,
      binding
    )
    curFunc = GetFunctionAndTypeInformationRes[0]
    argIndex = GetFunctionAndTypeInformationRes[1]
    argCount = GetFunctionAndTypeInformationRes[2]
    expectedType = GetFunctionAndTypeInformationRes[3]
    isValidSuggestionFunc = GetFunctionAndTypeInformationRes[4]

    data = this.CreateData(
      context,
      expectedType,
      binding,
      curFunc,
      currentNode,
      argIndex,
      argCount,
      isValidSuggestionFunc,
      binding.getExpandEntitiesMissingMetadata(),
      formula.comments
    )
    return [true, data]
  }

  protected CreateData(
    context: IIntellisenseContext,
    expectedType: DType,
    binding: TexlBinding,
    curFunc: TexlFunction,
    curNode: TexlNode,
    argIndex: number,
    argCount: number,
    isValidSuggestionFunc: IsValidSuggestion,
    missingTypes: DType[],
    comments: CommentToken[]
  ): IntellisenseData {
    return new IntellisenseData(
      this._enumStore,
      context,
      expectedType,
      binding,
      curFunc,
      curNode,
      argIndex,
      argCount,
      isValidSuggestionFunc,
      missingTypes,
      comments
    )
  }

  private GetFunctionAndTypeInformation(
    context: IIntellisenseContext,
    curNode: TexlNode,
    binding: TexlBinding
  ): [TexlFunction, number, number, DType, IsValidSuggestion] {
    // Contracts.AssertValue(context);
    // Contracts.AssertValue(curNode);
    // Contracts.AssertValue(binding);

    let curFunc: TexlFunction
    let argIndex: number
    let argCount: number
    let expectedType: DType
    let isValidSuggestionFunc: IsValidSuggestion

    let FindCurFuncAndArgsRes = Intellisense.FindCurFuncAndArgs(
      curNode,
      context.CursorPosition,
      binding
    )
    if (!FindCurFuncAndArgsRes[0]) {
      curFunc = null
      argIndex = 0
      argCount = 0
      expectedType = DType.Unknown
    } else {
      curFunc = FindCurFuncAndArgsRes[1]
      argIndex = FindCurFuncAndArgsRes[2]
      argCount = FindCurFuncAndArgsRes[3]
      expectedType = FindCurFuncAndArgsRes[4]
    }

    // let binaryOpExpectedType: DType;
    let TryGetExpectedTypeForBinaryOpRes =
      Intellisense.TryGetExpectedTypeForBinaryOp(
        binding,
        curNode,
        context.CursorPosition
      )
    if (TryGetExpectedTypeForBinaryOpRes[0])
      expectedType = TryGetExpectedTypeForBinaryOpRes[1]

    if (curFunc != null)
      isValidSuggestionFunc = (intellisenseData, suggestion) =>
        intellisenseData.CurFunc.isSuggestionTypeValid(
          intellisenseData.ArgIndex,
          suggestion.Type
        )
    else isValidSuggestionFunc = Helper.DefaultIsValidSuggestionFunc

    return [curFunc, argIndex, argCount, expectedType, isValidSuggestionFunc]
  }

  private Finalize(
    context: IIntellisenseContext,
    intellisenseData: IntellisenseData
  ): IIntellisenseResult {
    // Contracts.AssertValue(context);
    // Contracts.AssertValue(intellisenseData);

    let expectedType: DType = intellisenseData.ExpectedType

    Intellisense.TypeMatchPriority(
      expectedType,
      intellisenseData.Suggestions.list
    )
    Intellisense.TypeMatchPriority(
      expectedType,
      intellisenseData.SubstringSuggestions.list
    )
    intellisenseData.Suggestions.Sort()
    intellisenseData.SubstringSuggestions.Sort()
    let resultSuggestions: IntellisenseSuggestion[] = distinct(
      intellisenseData.Suggestions.list
    ) //.Distinct().ToList();
    let resultSubstringSuggestions: IntellisenseSuggestion[] = distinct(
      intellisenseData.SubstringSuggestions.list
    ) //.Distinct();
    resultSuggestions.push(...resultSubstringSuggestions)

    resultSuggestions = Intellisense.TypeFilter(
      expectedType,
      intellisenseData.MatchingStr,
      resultSuggestions
    )

    for (let handler of intellisenseData.CleanupHandlers) {
      handler.Run(context, intellisenseData, resultSuggestions)
    }

    return new IntellisenseResult(intellisenseData, resultSuggestions)
  }
}

export class Helper {
  public static DefaultIsValidSuggestionFunc(
    intellisenseData: IntellisenseData,
    suggestion: IntellisenseSuggestion
  ) {
    //return intellisenseData.ExpectedType.Accepts(suggestion.Type);
    return true
  }
}
