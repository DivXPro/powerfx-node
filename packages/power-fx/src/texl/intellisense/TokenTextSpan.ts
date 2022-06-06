import IComparer from '../../utils/typescriptNet/IComparer'
import { TokenType } from './TokenType'

// [TransportType(TransportKind.ByValue)]
export interface ITokenTextSpan {
  TokenName: string //{ get; }

  StartIndex: number // { get; }

  EndIndex: number // { get; }

  tokenType: TokenType // { get; }

  CanBeHidden: boolean // { get; }
}

export class TokenTextSpan implements ITokenTextSpan {
  public TokenName: string // { get; private set; }

  public StartIndex: number //{ get; private set; }

  public EndIndex: number ////{ get; private set; }

  public tokenType: TokenType //{ get; private set; }

  public CanBeHidden: boolean //{ get; private set; }

  constructor(name: string, startIndex: number, endIndex: number, type: TokenType, canHide: boolean) {
    this.TokenName = name
    this.StartIndex = startIndex
    this.EndIndex = endIndex
    this.tokenType = type
    this.CanBeHidden = canHide
  }
}

//TODO TokenTextSpanComparer 暂时没地方引用
// export class TokenTextSpanComparer implements IComparer<ITokenTextSpan>
// {
//   public Compare(self: ITokenTextSpan, other: ITokenTextSpan): number {
//     if (self == null) {
//       if (other == null)
//         return 0;

//       return -1;
//     }

//     if (other == null)
//       return 1;

//     if (self.tokenType != other.tokenType)
//       return self.tokenType.CompareTo(other.tokenType);

//     if (self.TokenName != other.TokenName)
//       return self.TokenName.CompareTo(other.TokenName);

//     return self.StartIndex.CompareTo(other.StartIndex);
//   }
// }
