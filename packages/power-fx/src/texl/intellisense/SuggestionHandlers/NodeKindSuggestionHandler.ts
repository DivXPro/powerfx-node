import { NodeKind } from '../../../syntax/NodeKind'
import { IntellisenseData } from '../IntellisenseData/IntellisenseData'
import { ISuggestionHandler } from './ISuggestionHandler'

//  internal partial class Intellisense {
export abstract class NodeKindSuggestionHandler implements ISuggestionHandler {
  private _kind: NodeKind

  constructor(kind: NodeKind) {
    this._kind = kind
  }

  /// <summary>
  /// Adds suggestions as appropriate to the internal Suggestions and SubstringSuggestions lists of intellisenseData.
  /// Returns true if intellisenseData is handled and no more suggestions are to be found and false otherwise.
  /// </summary>
  public Run(intellisenseData: IntellisenseData): boolean {
    // Contracts.AssertValue(intellisenseData);
    // Contracts.AssertValue(intellisenseData.CurNode);

    if (intellisenseData.CurNode.kind != this._kind) return false

    return this.TryAddSuggestionsForNodeKind(intellisenseData)
  }

  public abstract TryAddSuggestionsForNodeKind(intellisenseData: IntellisenseData): boolean
}
// }
