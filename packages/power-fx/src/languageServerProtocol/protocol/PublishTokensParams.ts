import { TokenResultType } from '../../public/TokenResultType'
import { Dictionary } from '../../utils'

export class PublishTokensParams {
  /// <summary>
  /// The URI for which token information is reported.
  /// </summary>
  public uri: string = ''

  /// <summary>
  /// A map of token information items.
  /// </summary>
  public tokens: Dictionary<string, TokenResultType> = new Dictionary<string, TokenResultType>()
}
