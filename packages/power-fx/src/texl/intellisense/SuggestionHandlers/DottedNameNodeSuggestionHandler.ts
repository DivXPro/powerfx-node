import { BindKind, TexlBinding } from '../../../binding'
import {
  FirstNameInfo,
  ScopedNameLookupInfo,
} from '../../../binding/bindingInfo'
import { TexlFunction } from '../../../functions/TexlFunction'
import {
  DottedNameNode,
  FirstNameNode,
  Identifier,
  TexlNode,
} from '../../../syntax'
import { NodeKind } from '../../../syntax/NodeKind'
import { DKind, DType } from '../../../types'
import { EnumSymbol } from '../../../types/enums'
import { DName, DPath } from '../../../utils'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { IntellisenseHelper } from '../IntellisenseHelper'
import { SuggestionIconKind } from '../SuggestionIconKind'
import { SuggestionKind } from '../SuggestionKind'
import { NodeKindSuggestionHandler } from './NodeKindSuggestionHandler'

// public partial class Intellisense {
export class DottedNameNodeSuggestionHandler extends NodeKindSuggestionHandler {
  constructor() {
    super(NodeKind.DottedName)
  }

  public TryAddSuggestionsForNodeKind(
    intellisenseData: IntellisenseData
  ): boolean {
    // Contracts.AssertValue(intellisenseData);

    let curNode: TexlNode = intellisenseData.CurNode
    let cursorPos: number = intellisenseData.CursorPos
    // Cursor position is after the dot (If it was before the dot FindNode would have returned the left node).
    // Contracts.Assert(curNode.Token.IsDottedNamePunctuator);
    // Contracts.Assert(curNode.Token.Span.Lim <= cursorPos);

    let dottedNameNode: DottedNameNode = curNode.castDottedName()
    let ident: Identifier = dottedNameNode.right
    let identName: string = ident.name.value
    let leftNode = dottedNameNode.left
    let leftType: DType = intellisenseData.Binding.getType(leftNode)

    intellisenseData.BeforeAddSuggestionsForDottedNameNode(leftNode)

    let isOneColumnTable: boolean =
      leftType.isColumn &&
      leftNode.kind == NodeKind.DottedName &&
      leftType.accepts(
        intellisenseData.Binding.getType((<DottedNameNode>leftNode).left)
      )

    if (cursorPos < ident.token.Span.min) {
      // Cursor position is before the identifier starts.
      // i.e. "this.  |  Awards"
      this.AddSuggestionsForLeftNodeScope(
        intellisenseData,
        leftNode,
        isOneColumnTable,
        leftType
      )
    } else if (cursorPos <= ident.token.Span.lim) {
      // Cursor position is in the identifier.
      // Suggest fields that don't need to be qualified.
      // Identifiers can include open and close brackets and the Token.Span covers them.
      // Get the matching string as a substring from the script so that the whitespace is preserved.
      intellisenseData.SetMatchArea(
        ident.token.Span.min,
        cursorPos,
        ident.token.Span.lim - ident.token.Span.min
      )

      if (!intellisenseData.Binding.errorContainer.hasErrors(dottedNameNode))
        intellisenseData.BoundTo = identName

      this.AddSuggestionsForLeftNodeScope(
        intellisenseData,
        leftNode,
        isOneColumnTable,
        leftType
      )
    } else if (
      IntellisenseHelper.CanSuggestAfterValue(
        cursorPos,
        intellisenseData.Script
      )
    ) {
      // Verify that cursor is after a space after the identifier.
      // i.e. "this.Awards   |"
      // Suggest binary operators.
      IntellisenseHelper.AddSuggestionsForAfterValue(
        intellisenseData,
        intellisenseData.Binding.getType(dottedNameNode)
      )
    }

    return true
  }

  private AddSuggestionsForLeftNodeScope(
    intellisenseData: IntellisenseData,
    leftNode: TexlNode,
    isOneColumnTable: boolean,
    leftType: DType
  ): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(leftNode);
    // Contracts.AssertValue(leftType);

    if (!intellisenseData.TryAddSuggestionsForLeftNodeScope(leftNode)) {
      let TryGetEnumInfoRes = DottedNameNodeSuggestionHandler.TryGetEnumInfo(
        intellisenseData,
        leftNode,
        intellisenseData.Binding
      )
      let enumInfo: EnumSymbol = TryGetEnumInfoRes[1]

      let TryGetNamespaceFunctionsRes =
        DottedNameNodeSuggestionHandler.TryGetNamespaceFunctions(
          leftNode,
          intellisenseData.Binding
        )
      let namespaceFunctions: TexlFunction[] = TryGetNamespaceFunctionsRes[1]

      let TryGetLocalScopeInfoRes =
        DottedNameNodeSuggestionHandler.TryGetLocalScopeInfo(
          leftNode,
          intellisenseData.Binding
        )
      let info: ScopedNameLookupInfo = TryGetLocalScopeInfoRes[1]

      if (TryGetEnumInfoRes[0]) {
        IntellisenseHelper.AddSuggestionsForEnum(intellisenseData, enumInfo)
      } else if (TryGetNamespaceFunctionsRes[0]) {
        this.AddSuggestionsForNamespace(intellisenseData, namespaceFunctions)
      } else if (TryGetLocalScopeInfoRes[0]) {
        IntellisenseHelper.AddTopLevelSuggestions(intellisenseData, info.type)
      } else if (!isOneColumnTable) {
        DottedNameNodeSuggestionHandler.AddSuggestionsForDottedName(
          intellisenseData,
          leftType
        )
      }
    }

    intellisenseData.OnAddedSuggestionsForLeftNodeScope(leftNode)
  }

  public AddSuggestionsForNamespace(
    intellisenseData: IntellisenseData,
    namespaceFunctions: TexlFunction[]
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
        true
      )
    }
  }

  private static TryGetLocalScopeInfo(
    node: TexlNode,
    binding: TexlBinding
  ): [boolean, ScopedNameLookupInfo] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    let info: ScopedNameLookupInfo

    if (node.kind == NodeKind.FirstName) {
      let curNode: FirstNameNode = node.castFirstName()
      let firstNameInfo = binding.getInfo(curNode)
      if (firstNameInfo.kind == BindKind.ScopeArgument) {
        info = <ScopedNameLookupInfo>firstNameInfo.data
        return [true, info]
      }
    }

    info = new ScopedNameLookupInfo(
      new DType(DKind.Unknown),
      0,
      new DName(),
      new DName(),
      false
    )
    return [false, info]
  }

  private static TryGetEnumInfo(
    data: IntellisenseData,
    node: TexlNode,
    binding: TexlBinding
  ): [boolean, EnumSymbol] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    let enumSymbol: EnumSymbol

    let curNode: FirstNameNode = node.asFirstName()
    if (curNode == null) {
      enumSymbol = null
      return [false, enumSymbol]
    }

    let firstNameInfo: FirstNameInfo = binding.getInfo(curNode) //.VerifyValue();
    if (firstNameInfo.kind != BindKind.Enum) {
      enumSymbol = null
      return [false, enumSymbol]
    }

    return data.TryGetEnumSymbolBinding(firstNameInfo.name.value, binding)
  }

  private static TryGetNamespaceFunctions(
    node: TexlNode,
    binding: TexlBinding
  ): [boolean, TexlFunction[]] {
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(binding);
    let functions: TexlFunction[]

    let curNode: FirstNameNode = node.asFirstName()
    if (curNode == null) {
      functions = [] // EmptyEnumerator<TexlFunction>.Instance;
      return [false, functions]
    }

    let firstNameInfo: FirstNameInfo = binding.getInfo(curNode) //.VerifyValue();
    // Contracts.AssertValid(firstNameInfo.Name);

    let namespacePath: DPath = new DPath().append(firstNameInfo.name)
    functions = binding.nameResolver.lookupFunctionsInNamespace(namespacePath)

    return [functions.length >= 0, functions]
  }

  // This method has logic to create Types for the TypedNames for a given type
  // if that type is Table.
  public static AddSuggestionsForDottedName(
    intellisenseData: IntellisenseData,
    type: DType
  ): void {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValid(type);

    if (intellisenseData.TryAddCustomDottedNameSuggestions(type)) return

    if (!type.isTable) {
      IntellisenseHelper.AddTopLevelSuggestions(intellisenseData, type)
      return
    }

    IntellisenseHelper.AddSuggestionsForNamesInType(
      type,
      intellisenseData,
      true
    )
  }
}
// }
