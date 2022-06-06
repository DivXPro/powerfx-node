import { BindKind, TexlBinding } from '../binding'
import { GetTokensFlags } from '../public/GetTokensFlags'
import { TokenResultType } from '../public/TokenResultType'
import { hasFlag } from './CharacterUtils'

export class GetTokensUtils {
  static GetTokens(binding: TexlBinding, flags: GetTokensFlags): Record<string, TokenResultType> {
    const tokens: Record<string, TokenResultType> = {}

    if (binding == null) {
      return tokens
    }

    if (hasFlag(flags, GetTokensFlags.UsedInExpression)) {
      for (const item of binding.getCalls()) {
        if (item.function != null) {
          tokens[item.function.qualifiedName] = TokenResultType.Function
        }
      }

      for (const item of binding.getFirstNames()) {
        switch (item.kind) {
          case BindKind.Control:
          case BindKind.OptionSet:
          case BindKind.PowerFxResolvedObject:
            tokens[item.name.value] = TokenResultType.HostSymbol
            break
          case BindKind.LambdaField:
            tokens[item.name.value] = TokenResultType.Variable
            break
          default:
            break
        }
      }
    }

    if (hasFlag(flags, GetTokensFlags.AllFunctions)) {
      for (const item of binding.nameResolver.functions) {
        tokens[item.qualifiedName] = TokenResultType.Function
      }
    }
    return tokens
  }
}
